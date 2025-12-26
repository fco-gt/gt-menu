import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "./lib/logger";

const rateLimitMap = new Map();

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/public")) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limit = 100;
    const windowMs = 60 * 1000;

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, {
        count: 0,
        lastReset: Date.now(),
      });
    }

    const ipData = rateLimitMap.get(ip);

    if (Date.now() - ipData.lastReset > windowMs) {
      ipData.count = 0;
      ipData.lastReset = Date.now();
    }

    if (ipData.count >= limit) {
      logger.warn("Rate limit exceeded", {
        ip,
        path: request.nextUrl.pathname,
      });
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    ipData.count += 1;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/public/:path*",
};
