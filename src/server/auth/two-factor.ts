import "server-only";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { siteConfig } from "@/config/site";

export interface TwoFactorSetup {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export async function generateTwoFactorSecret(email: string): Promise<TwoFactorSetup> {
  const secret = speakeasy.generateSecret({
    name: `${siteConfig.shortName} (${email})`,
    issuer: siteConfig.name,
    length: 20,
  });

  if (!secret.otpauth_url) {
    throw new Error("Failed to generate otpauth URL");
  }

  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
    qrCodeDataUrl,
  };
}

export function verifyTwoFactorCode(secret: string, token: string): boolean {
  if (!secret || !/^\d{6}$/.test(token)) return false;
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
}
