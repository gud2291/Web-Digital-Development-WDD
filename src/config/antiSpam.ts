/**
 * Field names shared by the client-side spam shield and the server-side guard.
 * Kept in a neutral module because `@/server/utils/spamGuard` is `server-only`
 * and can never be imported from a client component.
 */
export const HONEYPOT_FIELD = "_hp_website";
export const ELAPSED_FIELD = "_elapsed";

/** Minimum time (ms) a human plausibly spends before submitting a form. */
export const MIN_FORM_MS = 3000;
/** Newsletter is a single email field — humans clear it faster. */
export const MIN_NEWSLETTER_MS = 1500;
