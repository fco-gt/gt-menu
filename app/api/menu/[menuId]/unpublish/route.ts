import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTenant } from "@/lib/auth-helpers";

type Params = Promise<{ menuId: string }>;

// POST /api/menu/[menuId]/unpublish
export async function POST(req: Request, props: { params: Params }) {
  try {
    const { userId, tenant } = await requireTenant();
    const { menuId } = await props.params;

    // Verify menu belongs to tenant
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!menu || menu.tenantId !== tenant.id) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Unpublish all versions
    await prisma.menuVersion.updateMany({
      where: { menuId },
      data: { published: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unpublishing menu:", error);
    return NextResponse.json(
      { error: "Failed to unpublish menu" },
      { status: 500 }
    );
  }
}
