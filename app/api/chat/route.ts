import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI provider is not configured. Add OPENAI_API_KEY to the server environment." }, { status: 503 });
  try {
    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "A JSON object is required." }, { status: 400 });
    const messageValue = (body as Record<string, unknown>).message;
    const message = typeof messageValue === "string" ? messageValue.trim() : "";
    if (!message || message.length > 12000) return NextResponse.json({ error: "Message must be between 1 and 12000 characters" }, { status: 400 });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 45_000, maxRetries: 1 });
    const response = await client.responses.create({ model: process.env.OPENAI_MODEL || "gpt-5-mini", input: message });
    return NextResponse.json({ reply: response.output_text });
  } catch (error) {
    console.error("AI chat failed", error);
    return NextResponse.json({ error: "The assistant could not complete this request." }, { status: 500 });
  }
}