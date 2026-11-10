import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function validSignature(raw: string, header: string, secret: string) {
  const parts = header.split(",").map(x => x.split("="));
  const timestamp = parts.find(x => x[0] === "t")?.[1];
  const signatures = parts.filter(x => x[0] === "v1").map(x => x[1]);
  if (!timestamp || !signatures.length || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac("sha256", secret).update(timestamp + "." + raw).digest("hex");
  return signatures.some(sig => {
    try {
      const a = Buffer.from(sig, "hex");
      const b = Buffer.from(expected, "hex");
      return a.length === b.length && timingSafeEqual(a, b);
    } catch { return false; }
  });
}

async function upsertCompanySubscription(input: {
  organizationId: string;
  customerId: string | null;
  subscriptionId: string | null;
  status: string;
  plan: "free" | "pro" | "business";
  priceId?: string | null;
  periodEnd?: number | null;
  cancelAtPeriodEnd?: boolean;
}) {
  const { error } = await getSupabaseAdmin().from("organization_subscriptions").upsert({
    clerk_org_id: input.organizationId,
    stripe_customer_id: input.customerId,
    stripe_subscription_id: input.subscriptionId,
    status: input.status,
    plan_key: input.plan,
    stripe_price_id: input.priceId ?? null,
    current_period_end: input.periodEnd ? new Date(input.periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
    updated_at: new Date().toISOString(),
  } as never, { onConflict: "clerk_org_id" });
  if (error) throw error;
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  const raw = await request.text();
  const signature = request.headers.get("stripe-signature") || "";
  if (!validSignature(raw, signature, secret)) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });

  let event: any;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid event payload." }, { status: 400 }); }
  if (typeof event.id !== "string" || typeof event.type !== "string") return NextResponse.json({ error: "Invalid Stripe event." }, { status: 400 });

  const db = getSupabaseAdmin();
  const { error: ledgerError } = await db.from("stripe_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
  } as never);
  if (ledgerError) {
    if ((ledgerError as { code?: string }).code === "23505") return NextResponse.json({ received: true, duplicate: true });
    console.error("[stripe:webhook:ledger]", ledgerError);
    return NextResponse.json({ error: "Could not record webhook event." }, { status: 500 });
  }

  try {
    const object = event.data?.object;
    if (event.type === "checkout.session.completed") {
      const organizationId = object?.metadata?.clerk_org_id || object?.client_reference_id;
      const plan = object?.metadata?.plan;
      if (typeof organizationId === "string" && (plan === "pro" || plan === "business")) {
        await upsertCompanySubscription({
          organizationId,
          customerId: typeof object.customer === "string" ? object.customer : object.customer?.id ?? null,
          subscriptionId: typeof object.subscription === "string" ? object.subscription : object.subscription?.id ?? null,
          status: object.payment_status === "paid" || object.mode === "subscription" ? "active" : "incomplete",
          plan,
        });
      }
    } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const organizationId = object?.metadata?.clerk_org_id;
      const plan = object?.metadata?.plan;
      if (typeof organizationId === "string") {
        const price = object.items?.data?.[0]?.price;
        await upsertCompanySubscription({
          organizationId,
          customerId: typeof object.customer === "string" ? object.customer : object.customer?.id ?? null,
          subscriptionId: typeof object.id === "string" ? object.id : null,
          status: event.type === "customer.subscription.deleted" ? "canceled" : String(object.status || "inactive"),
          plan: plan === "pro" || plan === "business" ? plan : "free",
          priceId: typeof price?.id === "string" ? price.id : null,
          periodEnd: typeof object.current_period_end === "number" ? object.current_period_end : null,
          cancelAtPeriodEnd: Boolean(object.cancel_at_period_end),
        });
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    await db.from("stripe_webhook_events").delete().eq("event_id", event.id);
    console.error("[stripe:webhook]", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
