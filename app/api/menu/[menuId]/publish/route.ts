import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTenant } from "@/lib/auth-helpers";

type Params = Promise<{ menuId: string }>;

// POST /api/menu/[menuId]/publish
export async function POST(req: Request, props: { params: Params }) {
  try {
    const { tenant } = await requireTenant();
    const { menuId } = await props.params;

    // Verify menu belongs to tenant
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!menu || menu.tenantId !== tenant.id) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Unpublish all versions of this menu
      await tx.menuVersion.updateMany({
        where: { menuId },
        data: { published: false },
      });

      // Publish the latest version
      const latestVersion = await tx.menuVersion.findFirst({
        where: { menuId },
        orderBy: { createdAt: "desc" },
      });

      if (latestVersion) {
        await tx.menuVersion.update({
          where: { id: latestVersion.id },
          data: { published: true },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error publishing menu:", error);
    return NextResponse.json(
      { error: "Failed to publish menu" },
      { status: 500 }
    );
  }
}
