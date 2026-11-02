import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const allowedSections = new Set(["projects", "crm", "documents", "agents", "settings"]);

async function getOwner() {
  const { userId } = await auth();
  return userId;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ section: string }> },
) {
  const userId = await getOwner();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section } = await context.params;
  if (!allowedSections.has(section)) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("workspace_items")
      .select("id, section, title, description, content, status, created_at, updated_at")
      .eq("user_id", userId)
      .eq("section", section)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    console.error("[workspace:GET] Supabase request failed", error);
    return NextResponse.json({ error: "Workspace database is not configured or unavailable." }, { status: 503 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ section: string }> },
) {
  const userId = await getOwner();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section } = await context.params;
  if (!allowedSections.has(section)) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body) || typeof body.title !== "string" || !body.title.trim() || body.title.length > 160) {
    return NextResponse.json({ error: "A title of 1–160 characters is required." }, { status: 400 });
  }

  if (body.content !== undefined && (!body.content || typeof body.content !== "object" || Array.isArray(body.content) || JSON.stringify(body.content).length > 50000)) {
    return NextResponse.json({ error: "Content must be a JSON object no larger than 50000 characters." }, { status: 400 });
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("workspace_items")
      .insert({
        user_id: userId,
        section,
        title: body.title.trim(),
        description: typeof body.description === "string" ? body.description.slice(0, 2000) : "",
        content: body.content ?? {},
        status: typeof body.status === "string" ? body.status.slice(0, 40) : "active",
      } as never)
      .select("id, section, title, description, content, status, created_at, updated_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    console.error("[workspace:POST] Supabase insert failed", error);
    return NextResponse.json({ error: "Could not save workspace item. Check Supabase setup." }, { status: 503 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ section: string }> },
) {
  const userId = await getOwner();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section } = await context.params;
  if (!allowedSections.has(section)) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body) || typeof body.id !== "string" || !body.id) return NextResponse.json({ error: "A valid item id is required." }, { status: 400 });

  if (body.content !== undefined && (!body.content || typeof body.content !== "object" || Array.isArray(body.content) || JSON.stringify(body.content).length > 50000)) {
    return NextResponse.json({ error: "Content must be a JSON object no larger than 50000 characters." }, { status: 400 });
  }
  if (body.title !== undefined && (typeof body.title !== "string" || !body.title.trim() || body.title.length > 160)) {
    return NextResponse.json({ error: "Title must be between 1 and 160 characters." }, { status: 400 });
  }
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.title === "string") updates.title = body.title.trim();
  if (typeof body.description === "string") updates.description = body.description.slice(0, 2000);
  if (body.content !== undefined) updates.content = body.content;
  if (typeof body.status === "string") updates.status = body.status.slice(0, 40);

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("workspace_items")
      .update(updates as never)
      .eq("id", body.id)
      .eq("user_id", userId)
      .eq("section", section)
      .select("id, section, title, description, content, status, created_at, updated_at")
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Item not found." }, { status: 404 });
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("[workspace:PATCH] Supabase update failed", error);
    return NextResponse.json({ error: "Could not update workspace item." }, { status: 503 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ section: string }> },
) {
  const userId = await getOwner();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section } = await context.params;
  if (!allowedSections.has(section)) return NextResponse.json({ error: "Invalid section" }, { status: 400 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Item id is required." }, { status: 400 });

  try {
    const { error, count } = await getSupabaseAdmin()
      .from("workspace_items")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", userId)
      .eq("section", section);

    if (error) throw error;
    return NextResponse.json({ deleted: (count ?? 0) > 0 });
  } catch (error) {
    console.error("[workspace:DELETE] Supabase delete failed", error);
    return NextResponse.json({ error: "Could not delete workspace item." }, { status: 503 });
  }
}
