import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

const createTenantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

export async function POST(req: Request) {
  try {
    const userId = await requireAuth();

    // Check if user already has a tenant
    const existingMembership = await prisma.membership.findFirst({
      where: { clerkUserId: userId },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User already has a restaurant" },
        { status: 400 }
      );
    }

    const json = await req.json();
    const { name, slug } = createTenantSchema.parse(json);

    // Check slug uniqueness
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: "This restaurant URL is already taken" },
        { status: 400 }
      );
    }

    // Create tenant and membership in transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug,
        },
      });

      const membership = await tx.membership.create({
        data: {
          tenantId: tenant.id,
          clerkUserId: userId,
          role: "OWNER",
        },
      });

      return { tenant, membership };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Error creating tenant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
