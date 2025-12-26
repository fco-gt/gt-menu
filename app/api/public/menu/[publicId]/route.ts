import { NextResponse } from "next/server";
import { z } from "zod";
import { getMenuByPublicId } from "@/lib/data";
import { logger } from "@/lib/logger";

export async function GET(
  req: Request,
  props: { params: Promise<{ publicId: string }> }
) {
  const params = await props.params;
  const schema = z.object({ publicId: z.string().min(1) });
  const { publicId } = schema.parse(params);

  const payload = await getMenuByPublicId(publicId);

  if (!payload) {
    logger.warn("Menu not found", { publicId });
    return NextResponse.json({ error: "Menu not found" }, { status: 404 });
  }

  logger.info("Menu fetched", { publicId });

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control":
        // Cache at CDN/Edge for 1 hour, reuse stale up to 24h while revalidating
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Surrogate-Key": `menu:${publicId}`, // For programmatic invalidation
    },
  });
}
