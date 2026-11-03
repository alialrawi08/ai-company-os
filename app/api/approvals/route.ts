import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const allowedActions = new Set(["send_email", "update_crm", "publish_content", "modify_code", "external_action", "other"]);

async function owner() {
  const { userId } = await auth();
  return userId;
}

export async function GET() {
  const userId = await owner();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { data, error } = await getSupabaseAdmin().from("workspace_items")
      .select("id,title,description,content,status,created_at,updated_at")
      .eq("user_id", userId).eq("section", "agents")
      .like("title", "Approval: %")
      .order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return NextResponse.json({ approvals: data ?? [] });
  } catch (error) {
    console.error("[approvals:GET]", error);
    return NextResponse.json({ error: "Could not load approvals." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await owner();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "A JSON object is required." }, { status: 400 });
  const actionType = typeof body.actionType === "string" ? body.actionType : "other";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const proposal = typeof body.proposal === "string" ? body.proposal.trim() : "";
  if (!allowedActions.has(actionType) || !title || title.length > 140 || !proposal || proposal.length > 12000) {
    return NextResponse.json({ error: "Provide a valid action type, title (max 140), and proposal (max 12000)." }, { status: 400 });
  }
  try {
    const { data, error } = await getSupabaseAdmin().from("workspace_items").insert({
      user_id: userId, section: "agents", title: `Approval: ${title}`,
      description: proposal.slice(0, 2000),
      content: { kind: "approval_request", actionType, proposal, decision: null },
      status: "pending_approval",
    } as never).select("id,title,description,content,status,created_at,updated_at").single();
    if (error) throw error;
    const approvalId = (data as unknown as { id: string }).id;
    await getSupabaseAdmin().from("activity_logs").insert({ user_id: userId, event_type: "approval.requested", description: "An action is waiting for human approval", metadata: { approval_id: approvalId, action_type: actionType } } as never);
    return NextResponse.json({ approval: data }, { status: 201 });
  } catch (error) {
    console.error("[approvals:POST]", error);
    return NextResponse.json({ error: "Could not create approval request." }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  const userId = await owner();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body) || typeof body.id !== "string" || !body.id || !["approved", "rejected"].includes(body.decision)) {
    return NextResponse.json({ error: "A valid request id and approved/rejected decision are required." }, { status: 400 });
  }
  try {
    const supabase = getSupabaseAdmin();
    const { data: existing, error: readError } = await supabase.from("workspace_items").select("id,status,content,title")
      .eq("id", body.id).eq("user_id", userId).eq("section", "agents").like("title", "Approval: %").maybeSingle();
    if (readError) throw readError;
    if (!existing) return NextResponse.json({ error: "Approval request not found." }, { status: 404 });
    if (existing.status !== "pending_approval") return NextResponse.json({ error: "This request has already been decided." }, { status: 409 });
    const content = existing.content && typeof existing.content === "object" && !Array.isArray(existing.content) ? existing.content as Record<string, unknown> : {};
    const { data, error } = await supabase.from("workspace_items").update({
      status: body.decision, content: { ...content, decision: body.decision, decidedAt: new Date().toISOString() }, updated_at: new Date().toISOString(),
    } as never).eq("id", body.id).eq("user_id", userId).eq("section", "agents").eq("status", "pending_approval")
      .select("id,title,description,content,status,created_at,updated_at").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "This request has already been decided." }, { status: 409 });
    await supabase.from("activity_logs").insert({ user_id: userId, event_type: `approval.${body.decision}`, description: `An action request was ${body.decision}`, metadata: { approval_id: body.id } } as never);
    return NextResponse.json({ approval: data, executed: false, message: "Decision saved. Approval does not execute the proposed action." });
  } catch (error) {
    console.error("[approvals:PATCH]", error);
    return NextResponse.json({ error: "Could not save the approval decision." }, { status: 503 });
  }
}