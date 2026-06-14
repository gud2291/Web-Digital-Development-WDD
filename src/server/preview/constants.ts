import "server-only";

/**
 * §15.6 — name of the httpOnly cookie that carries the signed preview token
 * while Next.js draft mode is enabled. Shared by the preview enable/disable
 * route handlers and `getPreviewDoc`, so the public pages can re-verify the
 * token server-side. Kept in its own module so the route handlers don't pull in
 * the draft store just to read the cookie name.
 */
export const PREVIEW_COOKIE = "wdd-preview-token";

/** Mirrors the preview token's 30-minute TTL (see `signPreviewToken`). */
export const PREVIEW_COOKIE_MAX_AGE = 30 * 60;
