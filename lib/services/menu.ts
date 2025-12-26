import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import { MenuItem } from "@/types";

export async function createMenu({
  tenantId,
  name,
  items,
}: {
  tenantId: string;
  name: string;
  items: Omit<MenuItem, "id">[];
}) {
  const menu = await prisma.menu.create({
    data: {
      tenantId,
      publicId: `m_${nanoid(10)}`, // Short ID with prefix for readability
      versions: { create: { name, published: true, items: { create: items } } },
    },
    include: { versions: true },
  });

  return menu;
}
