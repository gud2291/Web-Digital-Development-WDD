import "server-only";
import { verifyPreviewToken } from "@/server/auth/preview-token";
import { getDraft } from "@/server/preview/draft-store";

/**
 * §15.6 — server helper for public pages. Given a resource and the page's
 * searchParams, returns the live draft object when a valid `?preview=&token=`
 * is present, otherwise null (so the page falls back to the DB record).
 */
export async function getPreviewDoc<T = Record<string, unknown>>(
  resource: string,
  searchParams?: { preview?: string; token?: string }
): Promise<T | null> {
  const draftId = searchParams?.preview;
  const token = searchParams?.token;
  if (!draftId || !token) return null;

  const claims = verifyPreviewToken(token);
  if (!claims || claims.resource !== resource || claims.draftId !== draftId) return null;

  return getDraft<T>(claims.adminId, resource, draftId);
}
