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

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
