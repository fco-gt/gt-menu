import prisma from "@/lib/prisma";
import { requireTenant } from "@/lib/auth-helpers";
import { notFound } from "next/navigation";
import QRCodePage from "./QRCodePage";

type Params = Promise<{ menuId: string }>;

export default async function QRPage(props: { params: Params }) {
  const { tenant } = await requireTenant();
  const { menuId } = await props.params;

  const menu = await prisma.menu.findFirst({
    where: {
      id: menuId,
      tenantId: tenant.id,
    },
    include: {
      versions: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!menu || menu.versions.length === 0) {
    notFound();
  }

  return (
    <QRCodePage publicId={menu.publicId} menuName={menu.versions[0].name} />
  );
}
