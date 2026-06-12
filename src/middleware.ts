import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Edge middleware — runs before every matched request.
 *
 * Responsibilities:
 *   - Protect /admin/* (excluding /admin/login) and /api/admin/* via NextAuth JWT
 *   - Block common scrape user-agents on non-API routes
 *   - Attach a per-request correlation ID for tracing
 *
 * NextAuth's getToken works at the edge (JWT strategy) because it doesn't
 * touch the database — it only verifies the JWT signature.
 */

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

function isProtectedAdminPath(pathname: string): boolean {
  if (pathname.startsWith("/api/admin")) return true;
  if (!pathname.startsWith("/admin")) return false;
  return !PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bot blocking — only for non-API public routes
  const ua = request.headers.get("user-agent") || "";
  const blocked = /(curl|wget|libwww|python-requests|scrapy|httpclient)/i.test(ua);
  if (blocked && !pathname.startsWith("/api/")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Admin route protection
  if (isProtectedAdminPath(pathname)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const isAdmin = token && (token as { isAdmin?: boolean }).isAdmin === true;
    if (!isAdmin) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // §15.6 — Live Preview: flag preview requests on public routes so the page
  // renders the draft (validation + Redis read happen server-side in the page).
  const isPreviewRequest =
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api") &&
    request.nextUrl.searchParams.has("preview") &&
    request.nextUrl.searchParams.has("token");

  const response = NextResponse.next();
  response.headers.set("x-request-id", crypto.randomUUID());
  if (isPreviewRequest) {
    response.headers.set("x-wdd-preview", "1");
    response.headers.set("Cache-Control", "no-store");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
