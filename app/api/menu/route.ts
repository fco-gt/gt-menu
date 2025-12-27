import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireTenant } from "@/lib/auth-helpers";
import { nanoid } from "nanoid";

const createMenuSchema = z.object({
  name: z.string().min(1, "Menu name is required"),
  items: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional().nullable(),
        priceCents: z.number(),
        order: z.number(),
      })
    )
    .optional()
    .default([]),
});

// GET /api/menu - List all menus for current tenant
export async function GET() {
  try {
    const { tenant } = await requireTenant();

    const menus = await prisma.menu.findMany({
      where: { tenantId: tenant.id },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ menus });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json(
      { error: "Failed to fetch menus" },
      { status: 500 }
    );
  }
}

// POST /api/menu - Create new menu
export async function POST(req: Request) {
  try {
    const { tenant } = await requireTenant();
    const json = await req.json();
    const { name, items } = createMenuSchema.parse(json);

    const result = await prisma.$transaction(async (tx) => {
      // Create menu
      const menu = await tx.menu.create({
        data: {
          tenantId: tenant.id,
          publicId: nanoid(10),
        },
      });

      // Create initial version
      const version = await tx.menuVersion.create({
        data: {
          menuId: menu.id,
          name,
          published: false,
        },
      });

      // Create items if provided
      if (items.length > 0) {
        await tx.item.createMany({
          data: items.map((item) => ({
            ...item,
            versionId: version.id,
            description: item.description ?? null,
          })),
        });
      }

      return { menu, version };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Error creating menu:", error);
    return NextResponse.json(
      { error: "Failed to create menu" },
      { status: 500 }
    );
  }
}
