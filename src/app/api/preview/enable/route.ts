import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { verifyPreviewToken } from "@/server/auth/preview-token";
import { PREVIEW_COOKIE, PREVIEW_COOKIE_MAX_AGE } from "@/server/preview/constants";

// Route handler that toggles draft mode — must run per-request.
export const dynamic = "force-dynamic";

/**
 * §15.6 — enter draft (preview) mode. The admin Live Preview iframe points here
 * with the signed preview token. We re-validate the token with the exact same
 * `verifyPreviewToken` check as before (no weakening), enable Next.js draft mode,
 * stash the token in an httpOnly + secure cookie so the target page can re-verify
 * it, then redirect to the public path — which now renders the draft because
 * draft mode is on. Normal visitors never hit this route and never get the cookie.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const pathParam = searchParams.get("path") || "/";

  if (!token) {
    return new NextResponse("Missing preview token", { status: 401 });
  }

  const claims = verifyPreviewToken(token);
  if (!claims) {
    return new NextResponse("Invalid or expired preview token", { status: 401 });
  }

  // Only ever redirect to an internal path (guard against open redirects).
  const safePath =
    pathParam.startsWith("/") && !pathParam.startsWith("//") ? pathParam : "/";

  draftMode().enable();
  cookies().set(PREVIEW_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/",
    maxAge: PREVIEW_COOKIE_MAX_AGE,
  });

  redirect(safePath);
}
