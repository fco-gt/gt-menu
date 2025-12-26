import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

import { createMenu } from "@/lib/services/menu";

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
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.ADMIN_API_KEY)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const json = await req.json();
    const { tenantSlug, name, items } = bodySchema.parse(json);

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant)
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const formattedItems = items.map((item) => ({
      ...item,
      description: item.description ?? null,
    }));

    const menu = await createMenu({
      tenantId: tenant.id,
      name,
      items: formattedItems,
    });

    return NextResponse.json({ menu }, { status: 201 });
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
