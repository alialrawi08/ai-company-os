import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI provider is not configured. Add OPENAI_API_KEY to the server environment." }, { status: 503 });
  try {
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 12000) return NextResponse.json({ error: "Message must be between 1 and 12000 characters" }, { status: 400 });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({ model: process.env.OPENAI_MODEL || "gpt-5-mini", input: message });
    return NextResponse.json({ reply: response.output_text });
  } catch (error) {
    console.error("AI chat failed", error);
    return NextResponse.json({ error: "The assistant could not complete this request." }, { status: 500 });
  }
}