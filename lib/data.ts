import prisma from "@/lib/prisma";
import { cache } from "react";
/**
 *  Get menu by public ID
 * @param publicId
 * @returns
 */
export const getMenuByPublicId = cache(async (publicId: string) => {
  const menu = await prisma.menu.findUnique({
    where: { publicId: publicId },
    include: {
      versions: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { items: true },
      },
    },
  });

  if (!menu) return null;

  return {
    id: menu.publicId,
    version: menu.versions[0] ?? null,
  };
});
