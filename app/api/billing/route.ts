import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function config() {
  return {
    secret: process.env.STRIPE_SECRET_KEY,
    proPrice: process.env.STRIPE_PRO_PRICE_ID,
    businessPrice: process.env.STRIPE_BUSINESS_PRICE_ID,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  };
}

async function billingRecord(userId: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("workspace_items").select("id,content,status")
    .eq("user_id", userId).eq("section", "settings").eq("title", "Billing subscription").maybeSingle();
  if (error) throw error;
  return data;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const rowRaw = await billingRecord(userId);
    const row = rowRaw as { id: string; content: unknown; status: string } | null;
    const c = row?.content && typeof row.content === "object" ? row.content as Record<string, unknown> : {};
    return NextResponse.json({ subscription: {
      status: row?.status ?? "free",
      plan: c.plan ?? null,
      currentPeriodEnd: c.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: c.cancelAtPeriodEnd ?? false,
      canManage: typeof c.customerId === "string",
    }});
  } catch (error) {
    console.error("[billing:GET]", error);
    return NextResponse.json({ error: "Could not load billing status." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { secret, proPrice, businessPrice, appUrl } = config();
  if (!secret || !appUrl) return NextResponse.json({ error: "Billing is not configured. Add Stripe and app URL environment variables." }, { status: 503 });

  const body = await request.json().catch(() => null);
  const action = body && typeof body === "object" ? body.action : null;
  try {
    const rowRaw = await billingRecord(userId);
    const row = rowRaw as { id: string; content: unknown; status: string } | null;
    const content = row?.content && typeof row.content === "object" ? row.content as Record<string, unknown> : {};
    let endpoint: string;
    const params = new URLSearchParams();

    if (action === "checkout") {
      const plan = body?.plan;
      const price = plan === "pro" ? proPrice : plan === "business" ? businessPrice : null;
      if (!price) return NextResponse.json({ error: "Choose a valid plan and configure its recurring Stripe Price ID." }, { status: 400 });
      params.set("mode", "subscription");
      params.set("line_items[0][price]", price);
      params.set("line_items[0][quantity]", "1");
      params.set("client_reference_id", userId);
      params.set("metadata[user_id]", userId);
      params.set("metadata[plan]", plan);
      params.set("subscription_data[metadata][user_id]", userId);
      params.set("subscription_data[metadata][plan]", plan);
      params.set("success_url", appUrl + "/dashboard/billing?success=1");
      params.set("cancel_url", appUrl + "/dashboard/billing?canceled=1");
      if (typeof content.customerId === "string") params.set("customer", content.customerId);
      else params.set("customer_creation", "always");
      endpoint = "https://api.stripe.com/v1/checkout/sessions";
    } else if (action === "portal") {
      if (typeof content.customerId !== "string") return NextResponse.json({ error: "No Stripe customer is linked yet." }, { status: 409 });
      params.set("customer", content.customerId);
      params.set("return_url", appUrl + "/dashboard/billing");
      endpoint = "https://api.stripe.com/v1/billing_portal/sessions";
    } else {
      return NextResponse.json({ error: "Unknown billing action." }, { status: 400 });
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: "Bearer " + secret, "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
      signal: AbortSignal.timeout(15000),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("[billing:stripe]", data?.error?.type);
      return NextResponse.json({ error: "Stripe could not create the billing session." }, { status: 502 });
    }
    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error("[billing:POST]", error);
    return NextResponse.json({ error: "Could not start billing." }, { status: 503 });
  }
}
