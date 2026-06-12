import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { serverEnv } from "@/config/env";

/**
 * Rate limiting — sliding window, per IP. Default 10 requests / 10 seconds.
 * Callers can pass a custom `{ limit, window }` (e.g. the chatbot uses 5 / 30s
 * per CLAUDE.md §11.1). If Upstash isn't configured, falls back to a no-op (dev).
 */

type Window = Parameters<typeof Ratelimit.slidingWindow>[1];

let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (_redis) return _redis;
  if (serverEnv.UPSTASH_REDIS_REST_URL && serverEnv.UPSTASH_REDIS_REST_TOKEN) {
    _redis = new Redis({
      url: serverEnv.UPSTASH_REDIS_REST_URL,
      token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

// Cache one Ratelimit instance per (limit, window) combination.
const _limiters = new Map<string, Ratelimit>();
function getLimiter(limit: number, window: Window): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  const key = `${limit}:${window}`;
  let limiter = _limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      analytics: true,
      prefix: `wdd-ratelimit:${key}`,
    });
    _limiters.set(key, limiter);
  }
  return limiter;
}

export async function checkRateLimit(
  identifier: string,
  opts?: { limit?: number; window?: Window }
) {
  const limiter = getLimiter(opts?.limit ?? 10, opts?.window ?? "10 s");
  if (!limiter) return { success: true, limit: 0, remaining: 0, reset: 0 };
  return limiter.limit(identifier);
}
