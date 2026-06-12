import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Admin from "@/server/models/Admin";
import { hashPassword, verifyPassword } from "@/server/auth/bcrypt";
import {
  generateRecoveryCode,
  hashRecoveryCode,
  verifyRecoveryCode,
} from "@/server/auth/recovery";
import {
  generateTwoFactorSecret,
  verifyTwoFactorCode,
  type TwoFactorSetup,
} from "@/server/auth/two-factor";
import { setEmergencyLock } from "@/server/auth/emergency-lock";
import { nanoid } from "nanoid";
import { logger } from "@/server/utils/logger";

export async function findAdminByEmail(email: string) {
  await connectDB();
  return Admin.findOne({ email: email.toLowerCase() });
}

export async function findAdminById(id: string) {
  await connectDB();
  return Admin.findById(id);
}

export async function changePassword(
  adminId: string,
  currentPassword: string,
  newPassword: string
) {
  await connectDB();
  const admin = await Admin.findById(adminId);
  if (!admin) throw new Error("Admin not found");
  const ok = await verifyPassword(currentPassword, admin.passwordHash);
  if (!ok) throw new Error("Current password is incorrect");
  admin.passwordHash = await hashPassword(newPassword);
  admin.lastPasswordChange = new Date();
  await admin.save();
  return { ok: true };
}

export async function setupTwoFactor(adminId: string): Promise<TwoFactorSetup> {
  await connectDB();
  const admin = await Admin.findById(adminId);
  if (!admin) throw new Error("Admin not found");
  const setup = await generateTwoFactorSecret(admin.email);
  // Store secret but don't enable until verified
  admin.twoFactorSecret = setup.secret;
  await admin.save();
  return setup;
}

export async function verifyAndEnableTwoFactor(adminId: string, code: string) {
  await connectDB();
  const admin = await Admin.findById(adminId);
  if (!admin || !admin.twoFactorSecret) throw new Error("2FA not initialised");
  if (!verifyTwoFactorCode(admin.twoFactorSecret, code)) {
    throw new Error("Invalid 2FA code");
  }
  admin.twoFactorEnabled = true;
  await admin.save();
  return { ok: true };
}

export async function disableTwoFactor(adminId: string, code: string) {
  await connectDB();
  const admin = await Admin.findById(adminId);
  if (!admin || !admin.twoFactorEnabled || !admin.twoFactorSecret) {
    throw new Error("2FA is not enabled");
  }
  if (!verifyTwoFactorCode(admin.twoFactorSecret, code)) {
    throw new Error("Invalid 2FA code");
  }
  admin.twoFactorEnabled = false;
  admin.twoFactorSecret = null;
  await admin.save();
  return { ok: true };
}

export async function rotateRecoveryCode(adminId: string) {
  await connectDB();
  const admin = await Admin.findById(adminId);
  if (!admin) throw new Error("Admin not found");
  const plain = generateRecoveryCode();
  admin.recoveryCodeHash = await hashRecoveryCode(plain);
  await admin.save();
  return { plain };
}

export async function consumeRecoveryCode(adminId: string, code: string) {
  await connectDB();
  const admin = await Admin.findById(adminId);
  if (!admin) throw new Error("Admin not found");
  const ok = await verifyRecoveryCode(code, admin.recoveryCodeHash ?? null);
  if (!ok) throw new Error("Invalid recovery code");
  // Burn the code after use
  admin.recoveryCodeHash = null;
  admin.emergencyLocked = false;
  admin.loginAttempts = 0;
  admin.lockedUntil = null;
  await admin.save();
  return { ok: true };
}

export async function recordLogin(
  adminId: string,
  meta: { ip: string; browser?: string; os?: string }
) {
  await connectDB();
  await Admin.updateOne(
    { _id: adminId },
    {
      $push: {
        loginLogs: {
          $each: [{ ip: meta.ip, browser: meta.browser ?? "", os: meta.os ?? "" }],
          $slice: -50,
        },
      },
    }
  );
}

export async function toggleEmergencyLock(adminId: string, locked: boolean) {
  await setEmergencyLock(adminId, locked);
  return { ok: true };
}

/**
 * Generate a password reset token for the given email.
 * Returns the raw (un-hashed) token to include in the email link.
 * The token is stored as a bcrypt hash in the DB with a 1-hour expiry.
 * Returns null if no admin is found (caller should NOT reveal this).
 */
export async function requestPasswordReset(email: string) {
  await connectDB();
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) return null;

  const rawToken = nanoid(48);
  const tokenHash = await hashPassword(rawToken);

  admin.passwordResetHash = tokenHash;
  admin.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await admin.save();

  logger.info({ adminId: admin._id.toString() }, "password reset requested");
  return { rawToken, admin };
}

/**
 * Verify the reset token and set a new password.
 * Finds admins whose reset hasn't expired, then bcrypt-compares the raw token.
 */
export async function confirmPasswordReset(token: string, newPassword: string) {
  await connectDB();
  const candidates = await Admin.find({
    passwordResetExpiry: { $gt: new Date() },
    passwordResetHash: { $ne: null },
  });

  for (const admin of candidates) {
    const match = await verifyPassword(token, admin.passwordResetHash!);
    if (match) {
      admin.passwordHash = await hashPassword(newPassword);
      admin.passwordResetHash = null;
      admin.passwordResetExpiry = null;
      admin.lastPasswordChange = new Date();
      admin.loginAttempts = 0;
      admin.lockedUntil = null;
      await admin.save();
      logger.info({ adminId: admin._id.toString() }, "password reset confirmed");
      return { ok: true };
    }
  }

  throw new Error("Invalid or expired reset token");
}
