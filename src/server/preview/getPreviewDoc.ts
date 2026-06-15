import "server-only";
import { cookies, draftMode } from "next/headers";
import { verifyPreviewToken } from "@/server/auth/preview-token";
import { getDraft } from "@/server/preview/draft-store";
import { PREVIEW_COOKIE } from "@/server/preview/constants";

/**
 * §15.6 — server helper for public pages. Returns the live draft object when the
 * request is in Next.js **draft mode** (an editor who hit `/api/preview/enable`
 * with a valid token) AND the cookie token verifies for this resource; otherwise
 * `null`, so the page renders the published record.
 *
 * Crucially, the cookie is only read **after** `draftMode().isEnabled` is true.
 * For normal visitors and at build/ISR time draft mode is off, so we return
 * early and never call the dynamic `cookies()` API — that's what lets the host
 * pages stay statically generated / ISR-cached. (Previously this read
 * `searchParams`, which forced every host page to render dynamically.)
 *
 * Security parity with the old `?preview=&token=` mechanism is preserved: the
 * same `verifyPreviewToken` (HS256, 30-min expiry) runs, and the resource is
 * matched against the signed claims. The `draftId` now comes from the verified
 * claims instead of the URL, so it cannot be tampered with.
 */
export async function getPreviewDoc<T = Record<string, unknown>>(
  resource: string
): Promise<T | null> {
  const { isEnabled } = draftMode();
  if (!isEnabled) return null;

  const token = cookies().get(PREVIEW_COOKIE)?.value;
  if (!token) return null;

  const claims = verifyPreviewToken(token);
  if (!claims || claims.resource !== resource) return null;

  return getDraft<T>(claims.adminId, resource, claims.draftId);
}
