import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { PREVIEW_COOKIE } from "@/server/preview/constants";

// Route handler that toggles draft mode — must run per-request.
export const dynamic = "force-dynamic";

/**
 * §15.6 — leave draft (preview) mode. Disables Next.js draft mode, clears the
 * preview-token cookie, and redirects back to the live (cached) site so the
 * editor's own browser stops bypassing the cache.
 */
export async function GET(req: NextRequest) {
  const pathParam = new URL(req.url).searchParams.get("path") || "/";
  const safePath =
    pathParam.startsWith("/") && !pathParam.startsWith("//") ? pathParam : "/";

  draftMode().disable();
  cookies().delete(PREVIEW_COOKIE);

  redirect(safePath);
}
