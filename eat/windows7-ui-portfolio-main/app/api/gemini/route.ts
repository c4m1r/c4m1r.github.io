import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key is missing" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // We can use a system instruction to make Gemini behave like a web browser or search engine
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: query }],
        }
      ],
      config: {
        systemInstruction: "You are an AI-powered search engine accessed via Internet Explorer 6 in a Windows XP environment. Keep your responses concise, informative, and formatted cleanly using standard markdown so they can be rendered as a webpage.",
        temperature: 0.7,
      }
    });

    return NextResponse.json({ result: response.text });
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: (error as Error).message || "Something went wrong" }, { status: 500 });
  }
}
