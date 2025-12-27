import { NextResponse } from "next/server";
import { z } from "zod";
import { createMenu } from "@/lib/services/menu";
import prisma from "@/lib/prisma";

const bodySchema = z.object({
  tenantSlug: z.string(),
  name: z.string(),
  items: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional().nullable(),
      priceCents: z.number(),
      order: z.number(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Demo endpoint only available in development" },
        { status: 403 }
      );
    }

    const json = await req.json();
    const { tenantSlug, name, items } = bodySchema.parse(json);

    // Check if tenant exists
    let tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    // Create tenant if it doesn't exist
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: `Demo: ${tenantSlug}`,
          slug: tenantSlug,
        },
      });
    }

    const formattedItems = items.map((item) => ({
      ...item,
      description: item.description ?? null,
    }));

    const menu = await createMenu({
      tenantId: tenant.id,
      name,
      items: formattedItems,
    });

    return NextResponse.json({ menu, tenant }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
