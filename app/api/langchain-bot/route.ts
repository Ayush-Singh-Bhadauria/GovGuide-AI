import dbConnect from "../../../src/lib/dbconnect";
import Scheme from "../../../mdoels/scheme.js";
import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { OpenAIEmbeddings } from "@langchain/openai";
import { cosineSimilarity } from "../../../src/lib/utils";

// --- Slot Filling & Profile Enrichment Utilities ---

/**
 * Given a scheme object, return an array of required eligibility fields (e.g., ["dob", "familyIncome"])
 */
function getSchemeEligibilityFields(scheme: any): string[] {
  if (Array.isArray(scheme.eligibilityFields)) return scheme.eligibilityFields;
  const elig = (scheme.eligibility || "").toLowerCase();
  const fields: string[] = [];
  if (elig.includes("age") || elig.includes("date of birth") || elig.includes("born")) fields.push("dob");
  if (elig.includes("income")) fields.push("familyIncome");
  if (elig.includes("gender")) fields.push("gender");
  if (elig.includes("rural") || elig.includes("urban")) fields.push("ruralUrban");
  // Add more as needed
  return fields;
}

/**
 * Given a user profile and required fields, return the first missing field (or null)
 */
function checkMissingFields(userProfile: any, requiredFields: string[]): string | null {
  for (const field of requiredFields) {
    if (!userProfile || userProfile[field] === undefined || userProfile[field] === null || userProfile[field] === "") {
      return field;
    }
  }
  return null;
}

/**
 * Extract slot value from user message for a given field (simple regex-based for now)
 */
function extractSlotValue(field: string, message: string): string | null {
  const text = message.toLowerCase();
  if (field === "dob") {
    // Match date patterns (e.g., 5th April 2001, 2001-04-05, etc.)
    const dateMatch = text.match(/(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}-\d{2}-\d{2}|\d{1,2}(st|nd|rd|th)?\s+[a-zA-Z]+\s+\d{4})/);
    if (dateMatch) {
      // Optionally: convert to ISO format
      return dateMatch[0];
    }
  }
  if (field === "familyIncome") {
    // Match numbers (optionally with commas, rupees, etc.)
    const incomeMatch = text.match(/\d{2,}(,\d{2,})*/);
    if (incomeMatch) return incomeMatch[0].replace(/,/g, "");
  }
  if (field === "gender") {
    if (text.includes("male")) return "male";
    if (text.includes("female")) return "female";
    if (text.includes("other")) return "other";
  }
  if (field === "ruralUrban") {
    if (text.includes("rural")) return "rural";
    if (text.includes("urban")) return "urban";
  }
  // Add more slot extraction as needed
  return null;
}

/**
 * Update user profile in MongoDB (async)
 */
async function updateUserProfile(userId: string, updateObj: Record<string, any>) {
  if (!userId) return null;
  await dbConnect();
  const User = (await import("../../../mdoels/user.js")).default;
  return User.findByIdAndUpdate(userId, { $set: updateObj }, { new: true });
}

/**
 * Detect language (very basic: Hindi, Hinglish, English)
 */
function detectLanguage(text: string): "hindi" | "hinglish" | "english" {
  // Simple heuristic: if mostly Devanagari, it's Hindi
  const devnagari = /[\u0900-\u097F]/;
  if (devnagari.test(text)) return "hindi";
  // Improved Hinglish detection: Only if 2+ Hinglish words and not mostly English
  const hinglishWords = [
    "kya", "hai", "kaunsa", "karna", "set", "kar", "sakta", "sakti", "aap", "mera", "mere", "hain", "ho", "ka", "ke", "ki", "tum", "profile", "update", "dhanyavaad", "poochh", "scheme", "baare"
  ];
  const lower = text.toLowerCase();
  let hinglishCount = 0;
  for (const w of hinglishWords) {
    if (lower.includes(w)) hinglishCount++;
  }
  // If 2 or more Hinglish words and less than 70% of words are English dictionary words, classify as Hinglish
  const words = lower.split(/\s+/);
  const englishWords = words.filter(w => /^[a-zA-Z]+$/.test(w));
  if (hinglishCount >= 2 && englishWords.length / words.length < 0.7) {
    return "hinglish";
  }
  return "english";
}

// --- Main Chatbot Handler ---
export async function POST(req: NextRequest) {
  try {
    const { messages, userProfile, userId, slotFilling } = await req.json();
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { output: "OpenAI API key is not set" },
        { status: 500 }
      );
    }
    await dbConnect();
    const allSchemes = await Scheme.find({});

    // 0. Conversational slot filling: check for missing required profile fields
    // Only prompt for missing profile fields if the user has sent a message that is clearly about profile update or if the conversation context suggests it
    // Otherwise, do not prompt for missing fields at the start of the conversation
    // --- Multilingual Profile Update Intent Detection using LLM ---
    let isProfileUpdateIntent = false;
    try {
      const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";
      if (lastUserMsg) {
        const intentPrompt = `User said: '${lastUserMsg}'. Is the user trying to update or edit their personal profile information? Answer 'Yes' or 'No'.`;
        const intentRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4-1106-preview",
            messages: [
              { role: "system", content: "You are a helpful assistant for intent detection." },
              { role: "user", content: intentPrompt }
            ],
            max_tokens: 3,
            temperature: 0
          })
        });
        if (intentRes.ok) {
          const intentData = await intentRes.json();
          const intentText = intentData.choices?.[0]?.message?.content?.toLowerCase() || "";
          if (intentText.includes("yes")) isProfileUpdateIntent = true;
        } else {
          // fallback: do not mark as intent
          isProfileUpdateIntent = false;
        }
      }
    } catch (err) {
      // fallback: do not mark as intent
      isProfileUpdateIntent = false;
    }

    const requiredProfileFields = [
      "fullName", "dob", "gender", "email", "phone", "aadhaarLinked", "address", "state", "district", "pincode", "ruralUrban", "casteCategory", "familyIncome", "bplCard", "rationCardType", "ewsStatus", "disability", "disabilityType", "maritalStatus", "highestQualification", "currentlyStudying", "course", "studentId", "collegeName", "employed", "profession", "unemployedYouth", "selfEmployed", "skillCertificate", "bankLinked", "accountHolder", "bankName", "ifsc", "upi", "farmer", "landOwnership", "landArea", "pregnantMother", "seniorCitizen", "minority", "minorityReligion"
    ];
    // Only treat a profile field as missing if it is not present in userProfile AND it is not present in the auth user object (for example, user.name)
    // Fix: If userProfile.fullName is missing but userProfile.name exists, treat as not missing
    const getProfileField = (field: string) => {
      if (!userProfile) return undefined;
      if (field === "fullName") {
        return userProfile.fullName || userProfile.name;
      }
      return userProfile[field];
    };
    const missingField = requiredProfileFields.find(
      (field) => getProfileField(field) === undefined || getProfileField(field) === null || getProfileField(field) === ""
    );

    // Only prompt for missing field if the user intent is profile update
    // --- NEW LOGIC: Only prompt for fields the user explicitly mentions ---
    if (isProfileUpdateIntent) {
      // Map field names to possible user phrases
      const fieldKeywords: Record<string, string[]> = {
        fullName: ["name", "full name"],
        dob: ["dob", "date of birth", "birthday", "born"],
        gender: ["gender", "male", "female", "other"],
        email: ["email", "mail"],
        phone: ["phone", "mobile", "contact number"],
        aadhaarLinked: ["aadhaar", "aadhar"],
        address: ["address"],
        state: ["state"],
        district: ["district"],
        pincode: ["pincode", "pin code", "postal code"],
        ruralUrban: ["rural", "urban"],
        casteCategory: ["caste", "category"],
        familyIncome: ["income", "family income"],
        bplCard: ["bpl"],
        rationCardType: ["ration card"],
        ewsStatus: ["ews"],
        disability: ["disability", "disabled"],
        disabilityType: ["disability type"],
        maritalStatus: ["marital status", "married", "single"],
        highestQualification: ["qualification", "education", "degree"],
        currentlyStudying: ["studying", "student", "currently studying"],
        course: ["course"],
        studentId: ["student id", "roll number"],
        collegeName: ["college"],
        employed: ["employed", "job", "working"],
        profession: ["profession", "occupation", "job type"],
        unemployedYouth: ["unemployed"],
        selfEmployed: ["self-employed", "self employed"],
        skillCertificate: ["skill certificate"],
        bankLinked: ["bank linked", "bank account linked"],
        accountHolder: ["account holder"],
        bankName: ["bank name"],
        ifsc: ["ifsc"],
        upi: ["upi"],
        farmer: ["farmer"],
        landOwnership: ["land ownership", "own land"],
        landArea: ["land area"],
        pregnantMother: ["pregnant"],
        seniorCitizen: ["senior citizen", "old age"],
        minority: ["minority"],
        minorityReligion: ["minority religion"],
      };
      const latestUserMsg = [...messages].reverse().find(m => m.role === "user")?.content?.toLowerCase() || "";
      const userLang = detectLanguage(latestUserMsg);
      // Find all fields mentioned in the user's message
      const mentionedFields = requiredProfileFields.filter(field =>
        fieldKeywords[field]?.some(keyword => latestUserMsg.includes(keyword))
      );
      if (mentionedFields.length > 0) {
        // If user mentioned any fields, try to extract and update immediately
        for (const field of mentionedFields) {
          const slotValue = extractSlotValue(field, latestUserMsg);
          if (slotValue && userId) {
            // Language-specific confirmation
            let confirmMsg = '';
            if (userLang === 'hindi') {
              confirmMsg = `धन्यवाद! आपका ${field} अपडेट कर दिया गया है। कृपया अपनी क्वेरी जारी रखें या किसी योजना के बारे में पूछें।`;
            } else if (userLang === 'hinglish') {
              confirmMsg = `Dhanyavaad! Aapka ${field} update kar diya gaya hai. Aap apna query continue kar sakte hain ya kisi scheme ke baare mein poochh sakte hain.`;
            } else {
              confirmMsg = `Thank you! Your ${field} has been updated to ${slotValue}. Please ask your question again or continue.`;
            }
            await updateUserProfile(userId, { [field]: slotValue });
            return NextResponse.json({
              output: confirmMsg,
              needsProfileField: null,
            });
          }
        }
        // If not found, prompt for the first mentioned field
        const fieldToPrompt = mentionedFields[0];
        const slotValue = extractSlotValue(fieldToPrompt, latestUserMsg);
        if (slotValue && userId) {
          let confirmMsg = '';
          if (userLang === 'hindi') {
            confirmMsg = `धन्यवाद! आपका ${fieldToPrompt} अपडेट कर दिया गया है। कृपया अपनी क्वेरी जारी रखें या किसी योजना के बारे में पूछें।`;
          } else if (userLang === 'hinglish') {
            confirmMsg = `Dhanyavaad! Aapka ${fieldToPrompt} update kar diya gaya hai. Aap apna query continue kar sakte hain ya kisi scheme ke baare mein poochh sakte hain.`;
          } else {
            confirmMsg = `Thank you! Your ${fieldToPrompt} has been updated to ${slotValue}. Please ask your question again or continue.`;
          }
          await updateUserProfile(userId, { [fieldToPrompt]: slotValue });
          return NextResponse.json({
            output: confirmMsg,
            needsProfileField: null
          });
        } else {
          // Language-specific prompts
          const fieldPrompts: Record<string, { hindi: string, hinglish: string, english: string }> = {
            district: {
              hindi: "कृपया अपना जिला बताएं।",
              hinglish: "Kaunsa district aap set karna chahte hain?",
              english: "Which district do you live in?"
            },
            // ...add more fields as needed...
          };
          const promptObj = fieldPrompts[fieldToPrompt] || {
            hindi: `कृपया अपना ${fieldToPrompt} बताएं।`,
            hinglish: `Apna ${fieldToPrompt} batayein.`,
            english: `Please provide your ${fieldToPrompt}.`
          };
          return NextResponse.json({
            output: promptObj[userLang],
            needsProfileField: fieldToPrompt,
          });
        }
      }
    }

    // 1. Detect if user is asking about a scheme
    const latestUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";
    // Find the most relevant scheme (top 1)
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
    const queryEmbedding = await embeddings.embedQuery(latestUserMsg);
    const summarizedSchemes = allSchemes.map(s => ({
      _id: s._id,
      title: s.title,
      description: s.description?.slice(0, 100),
      category: s.category,
      eligibility: s.eligibility?.slice(0, 80),
      link: s.link || ""
    }));
    const schemeEmbeddings = await Promise.all(
      summarizedSchemes.map(async (s) => ({
        ...s,
        embedding: await embeddings.embedQuery(`${s.title} ${s.description} ${s.category} ${s.eligibility}`)
      }))
    );
    const scoredSchemes = schemeEmbeddings.map(s => ({
      ...s,
      score: cosineSimilarity(queryEmbedding, s.embedding)
    }));
    scoredSchemes.sort((a, b) => b.score - a.score);
    const topScheme = scoredSchemes[0];
    // 2. Get required eligibility fields for this scheme
    let schemeEligibilityFields: string[] = [];
    if (topScheme) {
      schemeEligibilityFields = getSchemeEligibilityFields(topScheme);
    }
    // 3. Check for missing fields for scheme eligibility (do not redeclare missingField)
    // Remove the following lines if present above:
    //   let missingField: string | null = null;
    //   const missingField = ...
    // Only use the variable for profile slot-filling above, and for scheme slot-filling here:
    let schemeMissingField: string | null = null;
    if (schemeEligibilityFields.length > 0) {
      schemeMissingField = checkMissingFields(userProfile, schemeEligibilityFields);
    }
    // 4. Slot-filling state: If we are waiting for a slot value, extract and update
    if (slotFilling && slotFilling.field && slotFilling.schemeId) {
      const slotValue = extractSlotValue(slotFilling.field, latestUserMsg);
      const userLang = detectLanguage(latestUserMsg);
      if (slotValue && userId) {
        // Language-specific confirmation
        let confirmMsg = '';
        if (userLang === 'hindi') {
          confirmMsg = `धन्यवाद! आपका ${slotFilling.field} अपडेट कर दिया गया है। कृपया अपनी क्वेरी जारी रखें या किसी योजना के बारे में पूछें।`;
        } else if (userLang === 'hinglish') {
          confirmMsg = `Dhanyavaad! Aapka ${slotFilling.field} update kar diya gaya hai. Aap apna query continue kar sakte hain ya kisi scheme ke baare mein poochh sakte hain.`;
        } else {
          confirmMsg = `Thank you! Your ${slotFilling.field} has been updated to ${slotValue}. Please ask your question again or continue.`;
        }
        await updateUserProfile(userId, { [slotFilling.field]: slotValue });
        return NextResponse.json({
          output: confirmMsg,
          slotFilling: null
        });
      } else {
        // Language-specific prompts for missing slot value
        const fieldPrompts: Record<string, { hindi: string, hinglish: string, english: string }> = {
          dob: {
            hindi: "कृपया अपनी जन्मतिथि बताएं (YYYY-MM-DD)।",
            hinglish: "Apni date of birth batayein (YYYY-MM-DD).",
            english: "What is your date of birth? (YYYY-MM-DD)"
          },
          familyIncome: {
            hindi: "कृपया अपनी वार्षिक पारिवारिक आय बताएं (INR में)।",
            hinglish: "Apni annual family income batayein (INR mein).",
            english: "What is your annual family income (in INR)?"
          },
          gender: {
            hindi: "कृपया अपना लिंग बताएं।",
            hinglish: "Apna gender batayein.",
            english: "What is your gender?"
          },
          ruralUrban: {
            hindi: "क्या आप ग्रामीण या शहरी क्षेत्र में रहते हैं?",
            hinglish: "Aap rural ya urban area mein rehte hain?",
            english: "Do you live in a rural or urban area?"
          },
          // ...add more fields as needed...
        };
        const promptObj = fieldPrompts[slotFilling.field] || {
          hindi: `कृपया अपना ${slotFilling.field} बताएं।`,
          hinglish: `Apna ${slotFilling.field} batayein.`,
          english: `Please provide your ${slotFilling.field}.`
        };
        return NextResponse.json({
          output: promptObj[userLang],
          slotFilling
        });
      }
    }
    // 5. If missing field, ask for it
    if (schemeMissingField && topScheme) {
      const userLang = detectLanguage(latestUserMsg);
      // Language-specific prompts for missing eligibility field
      const fieldPrompts: Record<string, { hindi: string, hinglish: string, english: string }> = {
        dob: {
          hindi: "कृपया अपनी जन्मतिथि बताएं (YYYY-MM-DD)।",
          hinglish: "Apni date of birth batayein (YYYY-MM-DD).",
          english: "What is your date of birth? (YYYY-MM-DD)"
        },
        familyIncome: {
          hindi: "कृपया अपनी वार्षिक पारिवारिक आय बताएं (INR में)।",
          hinglish: "Apni annual family income batayein (INR mein).",
          english: "What is your annual family income (in INR)?"
        },
        gender: {
          hindi: "कृपया अपना लिंग बताएं।",
          hinglish: "Apna gender batayein.",
          english: "What is your gender?"
        },
        ruralUrban: {
          hindi: "क्या आप ग्रामीण या शहरी क्षेत्र में रहते हैं?",
          hinglish: "Aap rural ya urban area mein rehte hain?",
          english: "Do you live in a rural or urban area?"
        },
        // ...add more fields as needed...
      };
      const promptObj = fieldPrompts[schemeMissingField] || {
        hindi: `कृपया अपना ${schemeMissingField} बताएं।`,
        hinglish: `Apna ${schemeMissingField} batayein.`,
        english: `Please provide your ${schemeMissingField}.`
      };
      return NextResponse.json({
        output: promptObj[userLang],
        slotFilling: { field: schemeMissingField, schemeId: topScheme._id }
      });
    }

    // 4. Build schemesText for prompt
    const topSchemes = scoredSchemes.slice(0, 5);
    const schemesText = topSchemes.map((s, i) =>
      `#${i + 1}: ${s.title}\n${s.description}\nCategory: ${s.category}\nEligibility: ${s.eligibility}${s.link ? `\nLink: ${s.link}` : ''}`
    ).join("\n\n");

    // Only keep the last 5 messages for context
    const trimmedMessages = messages.slice(-5);
    const chatHistory = trimmedMessages
      .map((msg: any) => {
        if (msg.role === "user") return `User: ${msg.content}`;
        if (msg.role === "assistant") return `Bot: ${msg.content}`;
        return '';
      })
      .join("\n");
    const userProfileText = userProfile ? `User Profile: ${JSON.stringify(userProfile, null, 2)}` : "";
    const userLang = detectLanguage(latestUserMsg);
    let langInstruction = '';
    if (userLang === 'hindi') {
      langInstruction = 'Reply ONLY in Hindi.';
    } else if (userLang === 'hinglish') {
      langInstruction = 'Reply ONLY in Hinglish (Hindi in Roman script, like the user).';
    } else {
      langInstruction = 'Reply ONLY in English.';
    }
    const prePrompt = `${langInstruction}\n\nIMPORTANT: Always keep your responses crisp, concise, and precise. Avoid lengthy explanations unless specifically asked. Neatly format your responses with proper line breaks and bullet points where necessary. Use markdown formatting for better readability. NEVER exceed 100 words in your answer unless the user requests more detail.\n\nYou are an expert government schemes assistant with built-in, up-to-date knowledge of all Indian government schemes and user profiles. NEVER mention or imply that you are receiving scheme data or user information from the user, a database, or an API. Speak as if you have this knowledge inherently, like a fine-tuned model. Do not use phrases like 'from the database you provided', 'from your data', or 'the data you shared'. Just answer as an expert assistant.`;
    const prompt = `${prePrompt}\n\nHere are some relevant government schemes:\n\n${schemesText}\n\n${userProfileText}\n\nConversation so far:\n${chatHistory}\n\nContinue the conversation as a helpful government schemes assistant.`;
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      modelName: "gpt-4-1106-preview",
      maxTokens: 350,
    });
    // Defensive: Check if model or chain is undefined/null before calling
    if (!model) {
      return NextResponse.json(
        { output: "Sorry, the language model could not be initialized." },
        { status: 500 }
      );
    }
    const chain = new ConversationChain({ llm: model });
    if (!chain) {
      return NextResponse.json(
        { output: "Sorry, the conversation chain could not be initialized." },
        { status: 500 }
      );
    }
    let response;
    try {
      // Workaround for possible async context issues in LangChain/OpenAI
      // Use a microtask to ensure proper context propagation
      response = await Promise.resolve().then(() => chain.call({ input: prompt }));
    } catch (err) {
      console.error("LangChain call error:", err);
      return NextResponse.json(
        { output: "Sorry, there was an error processing your request. Please try again." },
        { status: 500 }
      );
    }
    if (!response || !response.response) {
      return NextResponse.json(
        { output: "Sorry, I couldn't process your request. Please try again." },
        { status: 500 }
      );
    }
    // Intent filtering: only include applicationLink if user intent is to apply
    const applyIntentKeywords = [
      "apply", "application", "register", "enroll", "enrol", "submit", "fill form", "how to apply", "where to apply", "get benefit"
    ];
    const userMsgLower = (latestUserMsg || "").toLowerCase();
    const isApplyIntent = applyIntentKeywords.some(k => userMsgLower.includes(k));
    const topSchemesForFrontend = scoredSchemes.slice(0, 1).map(s => {
      const schemeObj: any = {
        name: s.title,
        category: s.category,
        description: s.description,
        eligibility: s.eligibility,
        benefits: allSchemes.find(a => a.title === s.title)?.benefits || ""
      };
      if (isApplyIntent) {
        schemeObj.applicationLink = s.link || "";
      }
      return schemeObj;
    });
    return NextResponse.json({
      output: response.response,
      schemes: topSchemesForFrontend
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { output: "Sorry, I couldn't process your request. Please try again." },
      { status: 500 }
    );
  }
}
