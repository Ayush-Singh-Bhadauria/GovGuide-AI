import dbConnect from "../../../src/lib/dbconnect";
import Scheme from "../../../mdoels/scheme.js";
import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { OpenAIEmbeddings } from "@langchain/openai";
import { cosineSimilarity } from "../../../src/lib/utils"; // You may need to implement this util if not present

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
    const isProfileUpdateIntent = messages.some((m: any) => {
      if (m.role !== "user") return false;
      const content = m.content.toLowerCase();
      return (
        content.includes("update my profile") ||
        content.includes("change my ") ||
        content.includes("edit my ") ||
        content.includes("set my ") ||
        content.includes("my name is") ||
        content.includes("i am ") ||
        content.includes("i live in") ||
        content.includes("i was born") ||
        content.includes("my profile is") ||
        content.includes("my details are") ||
        content.includes("my information is") ||
        content.includes("my address is") ||
        content.includes("my email is") ||
        content.includes("my phone is") ||
        content.includes("my number is") ||
        content.includes("my contact is") ||
        content.includes("my dob is") ||
        content.includes("my date of birth is") ||
        content.includes("my gender is") ||
        content.includes("my income is") ||
        content.includes("my family income is") ||
        content.includes("my qualification is") ||
        content.includes("my education is") ||
        content.includes("my occupation is") ||
        content.includes("my job is") ||
        content.includes("my profession is") ||
        content.includes("my caste is") ||
        content.includes("my category is") ||
        content.includes("my state is") ||
        content.includes("my district is") ||
        content.includes("my pincode is") ||
        content.includes("my pin code is") ||
        content.includes("my aadhaar is") ||
        content.includes("my aadhar is") ||
        content.includes("my bank is") ||
        content.includes("my ifsc is") ||
        content.includes("my upi is") ||
        content.includes("my college is") ||
        content.includes("my student id is") ||
        content.includes("my roll number is") ||
        content.includes("my land area is") ||
        content.includes("my land is") ||
        content.includes("my marital status is") ||
        content.includes("my religion is") ||
        content.includes("my minority is") ||
        content.includes("my disability is") ||
        content.includes("my ration card is") ||
        content.includes("my bpl is") ||
        content.includes("my ews is") ||
        content.includes("my account holder is")
      );
    });

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
      // Find all fields mentioned in the user's message
      const mentionedFields = requiredProfileFields.filter(field =>
        fieldKeywords[field]?.some(keyword => latestUserMsg.includes(keyword))
      );
      // If user mentioned any fields, prompt for only those (even if already present in profile)
      if (mentionedFields.length > 0) {
        // If only one field, prompt for it; if multiple, prompt for the first not being filled
        const fieldPrompts: Record<string, string> = {
          fullName: "Please tell me your full name.",
          dob: "What is your date of birth? (YYYY-MM-DD)",
          gender: "What is your gender?",
          email: "What is your email address?",
          phone: "What is your phone number?",
          aadhaarLinked: "Is your Aadhaar linked? (yes/no)",
          address: "What is your address?",
          state: "Which state do you live in?",
          district: "Which district do you live in?",
          pincode: "What is your area pincode?",
          ruralUrban: "Do you live in a rural or urban area?",
          casteCategory: "What is your caste category?",
          familyIncome: "What is your annual family income (in INR)?",
          bplCard: "Do you have a BPL card? (yes/no)",
          rationCardType: "What is your ration card type?",
          ewsStatus: "Are you EWS? (yes/no)",
          disability: "Do you have any disability? (yes/no)",
          disabilityType: "If yes, what type of disability?",
          maritalStatus: "What is your marital status?",
          highestQualification: "What is your highest qualification?",
          currentlyStudying: "Are you currently studying? (yes/no)",
          course: "What course are you studying?",
          studentId: "What is your student ID?",
          collegeName: "What is your college name?",
          employed: "Are you employed? (yes/no)",
          profession: "What is your profession/job type?",
          unemployedYouth: "Are you an unemployed youth? (yes/no)",
          selfEmployed: "Are you self-employed? (yes/no)",
          skillCertificate: "Do you have a skill certificate? (yes/no)",
          bankLinked: "Is your bank account linked to Aadhaar? (yes/no)",
          accountHolder: "What is your bank account holder name?",
          bankName: "What is your bank name?",
          ifsc: "What is your bank IFSC code?",
          upi: "What is your UPI ID?",
          farmer: "Are you a farmer? (yes/no)",
          landOwnership: "Do you own land? (yes/no)",
          landArea: "What is your land area (in acres/hectares)?",
          pregnantMother: "Are you a pregnant mother? (yes/no)",
          seniorCitizen: "Are you a senior citizen? (yes/no)",
          minority: "Are you from a minority group? (yes/no)",
          minorityReligion: "If yes, what is your minority religion?",
        };
        // Prompt for the first mentioned field (or all, if you want multi-turn)
        const fieldToPrompt = mentionedFields[0];
        return NextResponse.json({
          output: fieldPrompts[fieldToPrompt] || `Please provide your ${fieldToPrompt}.`,
          needsProfileField: fieldToPrompt,
        });
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
      if (slotValue && userId) {
        await updateUserProfile(userId, { [slotFilling.field]: slotValue });
        // Optionally: recalculate eligibility or answer original question
        return NextResponse.json({
          output: `Thank you! Your ${slotFilling.field} has been updated to ${slotValue}. Please ask your question again or continue.`,
          slotFilling: null
        });
      } else {
        return NextResponse.json({
          output: `Sorry, I couldn't extract your ${slotFilling.field}. Please try again.`,
          slotFilling
        });
      }
    }
    // 5. If missing field, ask for it
    if (schemeMissingField && topScheme) {
      return NextResponse.json({
        output: `To check your eligibility for ${topScheme.title}, I need your ${schemeMissingField}. Could you please provide it?`,
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
    const prePrompt = `IMPORTANT: Always keep your responses crisp, concise, and precise. Avoid lengthy explanations unless specifically asked. Neatly format your responses with proper line breaks and bullet points where necessary. Use markdown formatting for better readability. NEVER exceed 100 words in your answer unless the user requests more detail.\n\nYou are an expert government schemes assistant with built-in, up-to-date knowledge of all Indian government schemes and user profiles. NEVER mention or imply that you are receiving scheme data or user information from the user, a database, or an API. Speak as if you have this knowledge inherently, like a fine-tuned model. Do not use phrases like 'from the database you provided', 'from your data', or 'the data you shared'. Just answer as an expert assistant.`;
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
    return NextResponse.json({ output: response.response });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { output: "Sorry, I couldn't process your request. Please try again." },
      { status: 500 }
    );
  }
}