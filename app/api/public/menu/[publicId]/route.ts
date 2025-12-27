import { NextResponse } from "next/server";
import { z } from "zod";
import { getMenuByPublicId } from "@/lib/data";

export async function GET(
  req: Request,
  props: { params: Promise<{ publicId: string }> }
) {
  const params = await props.params;
  const schema = z.object({ publicId: z.string().min(1) });
  const { publicId } = schema.parse(params);

  const payload = await getMenuByPublicId(publicId);

  if (!payload)
    return NextResponse.json({ error: "Menu not found" }, { status: 404 });

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control":
        "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
