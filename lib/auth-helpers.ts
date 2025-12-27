import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Membership, Tenant } from "@/app/generated/prisma";

/**
 * Get the current authenticated user's primary tenant.
 * Returns the first tenant the user has membership in.
 * @param userId
 * @returns
 */
export async function getCurrentTenant(
  userId: string
): Promise<(Tenant & { membership: Membership }) | null> {
  const membership = await prisma.membership.findFirst({
    where: { clerkUserId: userId },
    include: { tenant: true },
    orderBy: { createdAt: "asc" }, // Get first tenant created
  });

  if (!membership) return null;

  return {
    ...membership.tenant,
    membership,
  };
}

/**
 * Check if the current user has access to a specific tenant.
 * @param userId
 * @param tenantId
 * @returns
 */
export async function hasAccessToTenant(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const membership = await prisma.membership.findFirst({
    where: {
      clerkUserId: userId,
      tenantId,
    },
  });

  return !!membership;
}

/**
 * Get current user ID from Clerk auth.
 * Throws if not authenticated.
 * @returns
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

/**
 * Get current tenant for authenticated user.
 * Throws if user is not authenticated or has no tenant.
 * @returns
 */
export async function requireTenant() {
  const userId = await requireAuth();
  const tenant = await getCurrentTenant(userId);

  if (!tenant) {
    throw new Error("No tenant found for user");
  }

  return { userId, tenant };
}
