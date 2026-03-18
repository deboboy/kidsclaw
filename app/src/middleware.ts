import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // CSP headers for /play/* pages (kid-facing)
  if (request.nextUrl.pathname.startsWith("/play/")) {
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "connect-src 'self' https://*.play.kidsclaw.club",
        "font-src 'self'",
        "frame-ancestors 'none'",
      ].join("; ")
    );
  }

  // Rate limiting header (used by Vercel Edge)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("X-RateLimit-Policy", "api");
  }

  return response;
}

export const config = {
  matcher: ["/play/:path*", "/api/:path*"],
};
