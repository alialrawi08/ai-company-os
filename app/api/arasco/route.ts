import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const systemPrompt = `You are ARASCO, a capable personal AI assistant. Be clear, practical, honest, and concise. Help the user reason, research, plan, write, and build. Never claim to have accessed the user's device, files, accounts, or performed an external action unless a connected tool actually confirms it. You do not have direct computer-control permissions in this version. For actions with real-world consequences, explain the action and ask for explicit approval before execution. Match the user's language.`;

export async function GET() {
  return NextResponse.json({ status: "online", assistant: "ARASCO", configured: Boolean(process.env.OPENAI_API_KEY) }, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ARASCO is installed, but the AI engine is not connected yet. Add OPENAI_API_KEY to your .env.local file and restart the server." },
      { status: 503 },
    );
  }

  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("messages" in body) || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid message format." }, { status: 400 });
    }

    const messages = body.messages
      .filter((item: unknown): item is { role: "user" | "assistant"; content: string } =>
        Boolean(item) &&
        typeof item === "object" &&
        "role" in item &&
        "content" in item &&
        ((item as { role: unknown }).role === "user" || (item as { role: unknown }).role === "assistant") &&
        typeof (item as { content: unknown }).content === "string",
      )
      .slice(-16)
      .map((item) => ({ role: item.role, content: item.content.slice(0, 6000) }));

    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      return NextResponse.json({ error: "Send a message to begin." }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json({ error: "ARASCO received an empty response. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("ARASCO API error:", error);
    return NextResponse.json({ error: "ARASCO could not reach its intelligence engine. Check your API configuration and try again." }, { status: 500 });
  }
}
