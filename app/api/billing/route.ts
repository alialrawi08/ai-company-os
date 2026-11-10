import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenancy";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function config() {
  return {
    secret: process.env.STRIPE_SECRET_KEY,
    proPrice: process.env.STRIPE_PRO_PRICE_ID,
    businessPrice: process.env.STRIPE_BUSINESS_PRICE_ID,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  };
}

export async function GET() {
  const tenant = await getTenantContext().catch(() => null);
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!tenant.organizationId) {
    return NextResponse.json({ subscription: { status: "free", plan: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, canManage: false }, needsOrganization: true });
  }
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("organization_subscriptions")
      .select("plan_key,status,current_period_end,cancel_at_period_end,stripe_customer_id")
      .eq("clerk_org_id", tenant.organizationId)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ subscription: {
      status: data?.status ?? "free",
      plan: data?.plan_key ?? null,
      currentPeriodEnd: data?.current_period_end ?? null,
      cancelAtPeriodEnd: data?.cancel_at_period_end ?? false,
      canManage: tenant.role === "admin" && typeof data?.stripe_customer_id === "string",
    }});
  } catch (error) {
    console.error("[billing:GET]", error);
    return NextResponse.json({ error: "Could not load company billing status." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const tenant = await getTenantContext().catch(() => null);
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!tenant.organizationId) return NextResponse.json({ error: "Create or select a company before starting a company subscription." }, { status: 409 });
  if (tenant.role !== "admin") return NextResponse.json({ error: "Only company admins can manage billing." }, { status: 403 });

  const { secret, proPrice, businessPrice, appUrl } = config();
  if (!secret || !appUrl) return NextResponse.json({ error: "Billing is not configured. Add Stripe and app URL environment variables." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const action = body && typeof body === "object" ? body.action : null;

  try {
    const { data: subscription, error } = await getSupabaseAdmin()
      .from("organization_subscriptions")
      .select("stripe_customer_id")
      .eq("clerk_org_id", tenant.organizationId)
      .maybeSingle();
    if (error) throw error;

    const params = new URLSearchParams();
    let endpoint: string;
    if (action === "checkout") {
      const plan = body?.plan;
      const price = plan === "pro" ? proPrice : plan === "business" ? businessPrice : null;
      if (!price) return NextResponse.json({ error: "Choose a valid plan and configure its recurring Stripe Price ID." }, { status: 400 });
      params.set("mode", "subscription");
      params.set("line_items[0][price]", price);
      params.set("line_items[0][quantity]", "1");
      params.set("client_reference_id", tenant.organizationId);
      params.set("metadata[clerk_org_id]", tenant.organizationId);
      params.set("metadata[plan]", plan);
      params.set("metadata[initiated_by_user_id]", tenant.userId);
      params.set("subscription_data[metadata][clerk_org_id]", tenant.organizationId);
      params.set("subscription_data[metadata][plan]", plan);
      if (typeof subscription?.stripe_customer_id === "string") params.set("customer", subscription.stripe_customer_id);
      else params.set("customer_creation", "always");
      params.set("success_url", appUrl + "/dashboard/billing?success=1");
      params.set("cancel_url", appUrl + "/dashboard/billing?canceled=1");
      endpoint = "https://api.stripe.com/v1/checkout/sessions";
    } else if (action === "portal") {
      if (typeof subscription?.stripe_customer_id !== "string") return NextResponse.json({ error: "No Stripe customer is linked to this company yet." }, { status: 409 });
      params.set("customer", subscription.stripe_customer_id);
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
    if (!response.ok || typeof data.url !== "string") {
      console.error("[billing:stripe]", data?.error?.type);
      return NextResponse.json({ error: "Stripe could not create the billing session." }, { status: 502 });
    }
    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error("[billing:POST]", error);
    return NextResponse.json({ error: "Could not start company billing." }, { status: 503 });
  }
}
