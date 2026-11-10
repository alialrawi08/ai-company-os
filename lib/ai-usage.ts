import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type UsageInput = {
  userId: string;
  clerkOrgId?: string | null;
  agentRole: string;
  feature: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export async function recordAIUsage(input: UsageInput) {
  try {
    const { error } = await getSupabaseAdmin().from("ai_usage_events").insert({
      user_id: input.userId,
      clerk_org_id: input.clerkOrgId ?? null,
      agent_role: input.agentRole.toLowerCase(),
      feature: input.feature,
      model: input.model,
      prompt_tokens: input.promptTokens,
      completion_tokens: input.completionTokens,
      total_tokens: input.totalTokens,
      cost_status: "unpriced",
      metadata: { pricing_note: "Token usage captured; monetary pricing awaits a verified model-rate configuration." },
    } as never);
    if (error) throw error;
  } catch (error) {
    console.error("AI usage event could not be recorded", error);
  }
}
