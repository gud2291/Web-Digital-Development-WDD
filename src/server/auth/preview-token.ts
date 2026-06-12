import "server-only";
import crypto from "crypto";
import { serverEnv } from "@/config/env";

/**
 * §15.6 — minimal HS256 JWT for preview links. Zero-dependency (Node crypto),
 * signed with NEXTAUTH_SECRET, 30-minute expiry. Verified server-side by the
 * preview API and the public pages that render drafts.
 */

const SECRET = serverEnv.NEXTAUTH_SECRET;
const TTL_SECONDS = 30 * 60;

export interface PreviewClaims {
  resource: string;
  draftId: string;
  adminId: string;
  exp: number;
}

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

export function signPreviewToken(claims: Omit<PreviewClaims, "exp">, ttl = TTL_SECONDS): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({ ...claims, exp: Math.floor(Date.now() / 1000) + ttl })
  );
  const data = `${header}.${payload}`;
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyPreviewToken(token: string): PreviewClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts;
  const expected = crypto.createHmac("sha256", SECRET).update(`${header}.${payload}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString()) as PreviewClaims;
    if (!claims.exp || claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}
