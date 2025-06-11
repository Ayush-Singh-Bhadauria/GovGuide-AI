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

    // Format chat history as a transcript
    const chatHistory = messages
      .map((msg: any) => {
        if (msg.role === "user") return `User: ${msg.content}`;
        if (msg.role === "assistant") return `Bot: ${msg.content}`;
        return '';
      })
      .join("\n");

    const schemesText = schemes.map((s) => `Title: ${s.title}\nDescription: ${s.description}\nCategory: ${s.category}\nEligibility: ${s.eligibility}${s.link ? `\nLink: ${s.link}` : ''}`).join("\n\n");
    const userProfileText = userProfile ? `User Profile: ${JSON.stringify(userProfile, null, 2)}` : "";
    const prompt = `Here are all the government schemes in the database:\n\n${schemesText}\n\n${userProfileText}\n\nConversation so far:\n${chatHistory}\n\nContinue the conversation as a helpful government schemes assistant.`;

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      modelName: "gpt-4-1106-preview",
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