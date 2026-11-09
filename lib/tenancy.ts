import "server-only";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type TenantContext = {
  userId: string;
  organizationId: string | null;
  role: "owner" | "admin" | "member";
};

export async function getTenantContext(): Promise<TenantContext | null> {
  const session = await auth();
  if (!session.userId) return null;

  const organizationId = session.orgId ?? null;
  const rawRole = session.orgRole ?? "";
  const role: TenantContext["role"] = rawRole === "org:admin" ? "admin" : "member";

  if (organizationId) {
    const db = getSupabaseAdmin();
    const organizationName = session.orgSlug || organizationId;
    const { error: organizationError } = await db.from("organizations").upsert({
      clerk_org_id: organizationId,
      name: organizationName,
      created_by_user_id: session.userId,
      updated_at: new Date().toISOString(),
    } as never, { onConflict: "clerk_org_id", ignoreDuplicates: true });
    if (organizationError) throw organizationError;

    const { error: membershipError } = await db.from("organization_memberships").upsert({
      clerk_org_id: organizationId,
      clerk_user_id: session.userId,
      role,
      updated_at: new Date().toISOString(),
    } as never, { onConflict: "clerk_org_id,clerk_user_id" });
    if (membershipError) throw membershipError;
  }

  return { userId: session.userId, organizationId, role };
}

export function scopeTenant<T extends { eq: (column: string, value: string) => T; is: (column: string, value: null) => T }>(
  query: T,
  tenant: TenantContext,
): T {
  return tenant.organizationId
    ? query.eq("clerk_org_id", tenant.organizationId)
    : query.eq("user_id", tenant.userId).is("clerk_org_id", null);
}

export function tenantInsert<Tenant extends TenantContext>(tenant: Tenant, extra: Record<string, unknown> = {}) {
  return {
    ...extra,
    user_id: tenant.userId,
    clerk_org_id: tenant.organizationId,
  };
}
