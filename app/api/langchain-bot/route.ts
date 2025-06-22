import dbConnect from "../../../src/lib/dbconnect";
import Scheme from "../../../mdoels/scheme.js";
import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { OpenAIEmbeddings } from "@langchain/openai";
import { cosineSimilarity } from "../../../src/lib/utils"; // You may need to implement this util if not present

export async function POST(req: NextRequest) {
  try {
    const { messages, userProfile } = await req.json();
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { output: "OpenAI API key is not set" },
        { status: 500 }
      );
    }
    await dbConnect();
    const allSchemes = await Scheme.find({});

    // 0. Conversational slot filling: check for missing required profile fields
    // List all profile fields you want to support for conversational update
    const requiredProfileFields = [
      "fullName", "dob", "gender", "email", "phone", "aadhaarLinked", "address", "state", "district", "pincode", "ruralUrban", "casteCategory", "familyIncome", "bplCard", "rationCardType", "ewsStatus", "disability", "disabilityType", "maritalStatus", "highestQualification", "currentlyStudying", "course", "studentId", "collegeName", "employed", "profession", "unemployedYouth", "selfEmployed", "skillCertificate", "bankLinked", "accountHolder", "bankName", "ifsc", "upi", "farmer", "landOwnership", "landArea", "pregnantMother", "seniorCitizen", "minority", "minorityReligion"
    ];
    const missingField = requiredProfileFields.find(
      (field) => !userProfile || userProfile[field] === undefined || userProfile[field] === null || userProfile[field] === ""
    );
    if (missingField) {
      // Map field to a user-friendly question
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
      return NextResponse.json({
        output: fieldPrompts[missingField] || `Please provide your ${missingField}.`,
        needsProfileField: missingField,
      });
    }

    // 1. Get the latest user message (query)
    const latestUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";

    // 2. Summarize each scheme (title, short description, category, eligibility, link)
    const summarizedSchemes = allSchemes.map(s => ({
      _id: s._id,
      title: s.title,
      description: s.description?.slice(0, 100), // first 100 chars
      category: s.category,
      eligibility: s.eligibility?.slice(0, 80), // first 80 chars
      link: s.link || ""
    }));

    // 3. Use embeddings to find the top 5 most relevant schemes for the user's query
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
    const queryEmbedding = await embeddings.embedQuery(latestUserMsg);
    const schemeEmbeddings = await Promise.all(
      summarizedSchemes.map(async (s) => ({
        ...s,
        embedding: await embeddings.embedQuery(`${s.title} ${s.description} ${s.category} ${s.eligibility}`)
      }))
    );
    // Compute cosine similarity and sort
    const scoredSchemes = schemeEmbeddings.map(s => ({
      ...s,
      score: cosineSimilarity(queryEmbedding, s.embedding)
    }));
    scoredSchemes.sort((a, b) => b.score - a.score);
    const topSchemes = scoredSchemes.slice(0, 5);

    // 4. Build schemesText for prompt
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
    const chain = new ConversationChain({ llm: model });
    const response = await chain.call({ input: prompt });
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