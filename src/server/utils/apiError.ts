import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "./logger";

export interface ApiErrorBody {
  error: string;
  code: number;
  issues?: unknown;
}

export function apiError(message: string, code = 500, issues?: unknown) {
  const body: ApiErrorBody = { error: message, code };
  if (issues !== undefined) body.issues = issues;
  return NextResponse.json(body, { status: code });
}

export function unauthorized() {
  return apiError("Unauthorized", 401);
}

export function notFound(what = "Resource") {
  return apiError(`${what} not found`, 404);
}

export function badRequest(message = "Invalid request", issues?: unknown) {
  return apiError(message, 400, issues);
}

export function rateLimited() {
  return apiError("Too many requests", 429);
}

/**
 * Wrap an async route handler. Logs the real error server-side and returns
 * a generic message to the client so internals never leak.
 */
export function handle<T>(fn: () => Promise<T> | T) {
  return Promise.resolve()
    .then(fn)
    .catch((err: unknown) => {
      if (err instanceof ZodError) {
        return badRequest("Validation failed", err.flatten());
      }
      logger.error({ err }, "api route failure");
      return apiError("Internal server error", 500);
    });
}

/**
 * Best available client IP, used as the rate-limit key everywhere.
 *
 * Order matters. `x-forwarded-for` is a client-settable header — a caller can
 * put any value in it, and reading its first entry hands an attacker a fresh
 * rate-limit bucket per request, which would defeat the contact-form limits and
 * the admin login throttle alike. So the headers the platform sets itself come
 * first, and the spoofable one is only a last resort.
 *
 *   1. x-vercel-forwarded-for  — written by Vercel's edge, overwrites anything the client sent
 *   2. x-real-ip               — set by Vercel and by nginx/Cloudflare-style proxies
 *   3. x-forwarded-for         — fallback for other hosts; take the LAST hop, which
 *                                the nearest trusted proxy appended, rather than the
 *                                first, which the client controls
 */
export function getClientIp(req: Request): string {
  const vercel = req.headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const hops = xff.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }
  return "unknown";
}
