import { NextRequest, NextResponse } from "next/server";
import TextToSpeechV1 from "ibm-watson/text-to-speech/v1";
import { IamAuthenticator } from "ibm-watson/auth";

const textToSpeech = new TextToSpeechV1({
  authenticator: new IamAuthenticator({
    apikey: process.env.IBM_WATSON_TTS_APIKEY!,
  }),
  serviceUrl: process.env.IBM_WATSON_TTS_URL!,
});

export async function POST(req: NextRequest) {
  const { text, lang } = await req.json();
  if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });
  try {
    // Use a more natural/expressive voice
    let voice = "en-US_AllisonV3Voice";
    if (lang === "hi-IN") voice = "hi-IN_AnanyaV3Voice";
    // You can also try "en-US_EmmaV3Voice" or "en-US_MichaelV3Voice" for different English voices
    const response = await textToSpeech.synthesize({
      text,
      accept: "audio/mp3",
      voice,
    });
    const stream = response.result as NodeJS.ReadableStream;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = audioBuffer.toString("base64");
    return NextResponse.json({ audioContent: audioBase64 });
  } catch (e) {
    return NextResponse.json({ error: "IBM Watson TTS failed" }, { status: 500 });
  }
}
