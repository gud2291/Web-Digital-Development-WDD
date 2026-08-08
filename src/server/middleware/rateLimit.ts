import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { serverEnv } from "@/config/env";
import { getClientIp, rateLimited } from "@/server/utils/apiError";

/**
 * Rate limiting — sliding window, per IP. Default 10 requests / 10 seconds.
 * Callers can pass a custom `{ limit, window }` (e.g. the chatbot uses 5 / 30s
 * per CLAUDE.md §11.1).
 *
 * When Upstash IS configured it is used exactly as before. When the Upstash env
 * vars are absent we fall back to a lightweight IN-MEMORY sliding-window limiter
 * so public endpoints still get basic protection instead of a no-op.
 *
 * NOTE: the in-memory fallback is PER-INSTANCE state. On serverless / multi-
 * instance deployments each instance keeps its own counters, so it is only
 * best-effort (an attacker hitting different instances gets a higher effective
 * limit, and counters reset on cold start). Upstash (shared Redis) is still the
 * recommended limiter for production.
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

// ---------------------------------------------------------------------------
// In-memory fallback (used ONLY when Upstash is not configured).
// ---------------------------------------------------------------------------

const WINDOW_UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/** Parse an Upstash-style duration string ("10 s", "30 s", "1 m") to ms. */
function windowToMs(window: Window): number {
  const match = /^(\d+)\s*(ms|s|m|h|d)$/.exec(String(window).trim());
  if (!match) return 10_000; // safe default — matches the historical "10 s"
  return Number(match[1]) * WINDOW_UNIT_MS[match[2]];
}

// Map of identifier -> sorted list of request timestamps (ms) within the window.
const _memHits = new Map<string, number[]>();
let _lastSweep = 0;

/**
 * Periodically drop fully-expired identifiers so the Map can't grow unbounded
 * on a long-lived instance. Cheap: runs at most once per sweep interval.
 */
function sweep(now: number, maxWindowMs: number) {
  if (now - _lastSweep < 60_000) return;
  _lastSweep = now;
  const cutoff = now - maxWindowMs;
  for (const [key, hits] of _memHits) {
    if (hits.length === 0 || hits[hits.length - 1] <= cutoff) {
      _memHits.delete(key);
    }
  }
}

function memoryLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  sweep(now, windowMs);
  const windowStart = now - windowMs;

  const prev = _memHits.get(identifier) ?? [];
  // Keep only timestamps still inside the sliding window.
  const hits = prev.filter((t) => t > windowStart);

  const success = hits.length < limit;
  if (success) hits.push(now);
  _memHits.set(identifier, hits);

  const remaining = Math.max(0, limit - hits.length);
  // reset ≈ when the oldest in-window hit ages out (matches Upstash semantics).
  const reset = (hits.length > 0 ? hits[0] : now) + windowMs;
  return { success, limit, remaining, reset };
}

/**
 * Throttle for public READ endpoints. 60/minute per IP is far above anything a
 * person browsing the site produces (the blog list is debounced, the ticker
 * fetches once per page load), but it stops an unauthenticated script from
 * pulling the whole catalogue in a loop or driving up Atlas load for free.
 *
 * Returns a 429 response to hand straight back, or `null` to continue.
 *
 * NOTE: do NOT use this on `/api/public/locations/[slug]` — that route is
 * fetched server-side by its own page, so every visitor's request would arrive
 * from the one server IP and share a single bucket.
 */
export async function publicReadGate(req: Request, bucket: string) {
  const rl = await checkRateLimit(`public:read:${bucket}:${getClientIp(req)}`, {
    limit: 60,
    window: "1 m",
  });
  return rl.success ? null : rateLimited();
}

export async function checkRateLimit(
  identifier: string,
  opts?: { limit?: number; window?: Window }
) {
  const limit = opts?.limit ?? 10;
  const window = opts?.window ?? "10 s";
  const limiter = getLimiter(limit, window);
  // Upstash configured → use it exactly as before.
  if (limiter) return limiter.limit(identifier);
  // No Upstash → best-effort per-instance in-memory fallback.
  return memoryLimit(identifier, limit, windowToMs(window));
}
