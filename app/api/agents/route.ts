import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const roles = ["CEO", "Research", "Sales", "Developer", "Marketing", "Finance", "Support"] as const;
type AgentRole = (typeof roles)[number];

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("agent_runs")
      .select("id, agent_role, task, result, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return NextResponse.json({ runs: data ?? [] });
  } catch (error) {
    console.error("Agent history load failed", error);
    return NextResponse.json({ error: "Could not load agent history. Check database configuration." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI provider is not configured. Add OPENAI_API_KEY to the server environment." }, { status: 503 });

  try {
    const body = await request.json();
    const role = body.role as AgentRole;
    const task = typeof body.task === "string" ? body.task.trim() : "";
    if (!roles.includes(role)) return NextResponse.json({ error: "Unknown agent role" }, { status: 400 });
    if (!task || task.length > 12000) return NextResponse.json({ error: "Task must be between 1 and 12000 characters" }, { status: 400 });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions: `You are the ${role} specialist inside AI Company OS. Be practical, structured, honest about uncertainty, and never claim to have taken external actions. Give the user a useful deliverable and clear next steps.`,
      input: task,
    });

    const result = response.output_text || "";
    const { data: run, error: saveError } = await getSupabaseAdmin()
      .from("agent_runs")
      .insert({
        user_id: userId,
        agent_role: role.toLowerCase(),
        task,
        result,
        status: "completed",
      } as never)
      .select("id, agent_role, task, result, status, created_at")
      .single();
    if (saveError) throw saveError;

    await getSupabaseAdmin().from("activity_logs").insert({
      user_id: userId,
      event_type: "agent.completed",
      description: `${role} agent completed a task`,
      metadata: { agent_role: role.toLowerCase() },
    } as never);

    return NextResponse.json({ role, result, run });
  } catch (error) {
    console.error("Agent execution failed", error);
    return NextResponse.json({ error: "The agent could not complete or save this task." }, { status: 500 });
  }
}
