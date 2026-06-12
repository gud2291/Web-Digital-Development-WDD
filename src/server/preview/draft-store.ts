import "server-only";
import { Redis } from "@upstash/redis";
import { serverEnv } from "@/config/env";

/**
 * §1 — short-lived draft store for the Live Preview system. Drafts live under
 * `preview:<adminId>:<resource>:<draftId>` with a 30-minute TTL.
 *
 * Uses Upstash Redis when configured; otherwise falls back to an in-process
 * Map with the same TTL + key format, so live preview ALWAYS works (no Upstash
 * required). The Map is per-server-process, which is exactly what a same-host
 * admin → public preview round-trip needs.
 */

const TTL_SECONDS = 30 * 60;
const TTL_MS = TTL_SECONDS * 1000;

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

// ── In-memory fallback (survives HMR via globalThis) ────────────────────────
interface MemEntry {
  data: unknown;
  expires: number;
}
const globalStore = globalThis as unknown as { __wddPreviewStore?: Map<string, MemEntry> };
const memStore: Map<string, MemEntry> = globalStore.__wddPreviewStore ?? new Map();
globalStore.__wddPreviewStore = memStore;

/** Lazy expiry sweep — drop stale entries whenever the store is touched. */
function sweep(): void {
  const now = Date.now();
  for (const [key, entry] of memStore) {
    if (entry.expires <= now) memStore.delete(key);
  }
}

/** Preview is always available — Redis when configured, in-memory otherwise. */
export function isPreviewEnabled(): boolean {
  return true;
}

function keyFor(adminId: string, resource: string, draftId: string): string {
  return `preview:${adminId}:${resource}:${draftId}`;
}

export async function saveDraft(
  adminId: string,
  resource: string,
  draftId: string,
  data: unknown
): Promise<boolean> {
  const key = keyFor(adminId, resource, draftId);
  const redis = getRedis();
  if (redis) {
    await redis.set(key, data as Record<string, unknown>, { ex: TTL_SECONDS });
    return true;
  }
  sweep();
  memStore.set(key, { data, expires: Date.now() + TTL_MS });
  return true;
}

export async function getDraft<T = Record<string, unknown>>(
  adminId: string,
  resource: string,
  draftId: string
): Promise<T | null> {
  const key = keyFor(adminId, resource, draftId);
  const redis = getRedis();
  if (redis) {
    const value = await redis.get<T>(key);
    return value ?? null;
  }
  sweep();
  const entry = memStore.get(key);
  if (!entry || entry.expires <= Date.now()) return null;
  return entry.data as T;
}

export async function deleteDraft(adminId: string, resource: string, draftId: string): Promise<void> {
  const key = keyFor(adminId, resource, draftId);
  const redis = getRedis();
  if (redis) {
    await redis.del(key);
    return;
  }
  memStore.delete(key);
}
