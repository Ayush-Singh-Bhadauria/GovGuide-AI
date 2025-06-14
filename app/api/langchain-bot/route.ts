import dbConnect from "../../../src/lib/dbconnect";
import Scheme from "../../../mdoels/scheme.js";
import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";

export async function POST(req: NextRequest) {
  try {
    const { messages, userProfile } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { output: "OpenAI API key is not set. Please contact the administrator." },
        { status: 500 }
      );
    }

    // Fetch all schemes from the database
    await dbConnect();
    const schemes = await Scheme.find({});

    // Only keep the last 5 messages for context
    const trimmedMessages = messages.slice(-5);
    const chatHistory = trimmedMessages
      .map((msg: any) => {
        if (msg.role === "user") return `User: ${msg.content}`;
        if (msg.role === "assistant") return `Bot: ${msg.content}`;
        return '';
      })
      .join("\n");

    const schemesText = schemes.map((s) => `Title: ${s.title}\nDescription: ${s.description}\nCategory: ${s.category}\nEligibility: ${s.eligibility}${s.link ? `\nLink: ${s.link}` : ''}`).join("\n\n");

    const userProfileText = userProfile ? `User Profile: ${JSON.stringify(userProfile, null, 2)}` : "";
    // Add a pre-prompt for crisp and precise responses, and limit answer length
    const prePrompt = `IMPORTANT: Always keep your responses crisp, concise, and precise. Avoid lengthy explanations unless specifically asked. Neatly format your responses with proper line breaks and bullet points where necessary. Use markdown formatting for better readability. NEVER exceed 100 words in your answer unless the user requests more detail.\n\nYou are an expert government schemes assistant with built-in, up-to-date knowledge of all Indian government schemes and user profiles. NEVER mention or imply that you are receiving scheme data or user information from the user, a database, or an API. Speak as if you have this knowledge inherently, like a fine-tuned model. Do not use phrases like 'from the database you provided', 'from your data', or 'the data you shared'. Just answer as an expert assistant.`;
    const prompt = `${prePrompt}\n\nHere are all the government schemes in the database:\n\n${schemesText}\n\n${userProfileText}\n\nConversation so far:\n${chatHistory}\n\nContinue the conversation as a helpful government schemes assistant.`;

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      modelName: "gpt-4-1106-preview",
      maxTokens: 350, // Limit response tokens for cost control
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