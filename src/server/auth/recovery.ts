import "server-only";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const ROUNDS = 12;

/**
 * Generates a one-time recovery code. The plaintext is returned ONCE for
 * delivery to the admin (email + display). Only the hash is persisted.
 */
export function generateRecoveryCode(): string {
  // 32 hex chars → ~128 bits of entropy, grouped for readability
  const raw = randomBytes(16).toString("hex").toUpperCase();
  return raw.match(/.{1,4}/g)!.join("-");
}

export async function hashRecoveryCode(plain: string): Promise<string> {
  return bcrypt.hash(plain.replace(/-/g, "").toUpperCase(), ROUNDS);
}

export async function verifyRecoveryCode(plain: string, hash: string | null): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plain.replace(/-/g, "").toUpperCase(), hash);
}
