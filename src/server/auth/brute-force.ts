import "server-only";
import type { HydratedDocument } from "mongoose";
import Admin, { type Admin as AdminDoc } from "@/server/models/Admin";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export interface BruteForceState {
  locked: boolean;
  lockedUntil: Date | null;
  attemptsRemaining: number;
}

export function getBruteForceState(admin: Pick<AdminDoc, "loginAttempts" | "lockedUntil">): BruteForceState {
  const now = new Date();
  const lockedUntil = admin.lockedUntil ? new Date(admin.lockedUntil) : null;
  const locked = !!lockedUntil && lockedUntil > now;
  return {
    locked,
    lockedUntil,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - (admin.loginAttempts ?? 0)),
  };
}

export async function recordFailedAttempt(adminDoc: HydratedDocument<AdminDoc>): Promise<void> {
  adminDoc.loginAttempts = (adminDoc.loginAttempts ?? 0) + 1;
  if (adminDoc.loginAttempts >= MAX_ATTEMPTS) {
    adminDoc.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
    adminDoc.loginAttempts = 0;
  }
  await adminDoc.save();
}

export async function clearLoginAttempts(adminId: string): Promise<void> {
  await Admin.updateOne(
    { _id: adminId },
    { $set: { loginAttempts: 0, lockedUntil: null } }
  );
}
