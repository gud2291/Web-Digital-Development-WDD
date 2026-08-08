import "server-only";
import { headers } from "next/headers";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/server/db/mongodb";
import Admin from "@/server/models/Admin";
import { serverEnv } from "@/config/env";
import { verifyPassword } from "./bcrypt";
import { verifyTwoFactorCode } from "./two-factor";
import { clearLoginAttempts, getBruteForceState, recordFailedAttempt } from "./brute-force";
import { recordLogin } from "@/server/services/admin.service";
import { checkRateLimit } from "@/server/middleware/rateLimit";
import { logger } from "@/server/utils/logger";

/**
 * Extract the client IP from NextAuth's internal request. Its `headers` is a
 * plain object (not a Headers instance), so we read it directly rather than via
 * getClientIp(). Mirrors the x-forwarded-for / x-real-ip precedence used there.
 */
function ipFromAuthReq(req?: { headers?: Record<string, string> }): string {
  const headers = req?.headers ?? {};
  const vercel = headers["x-vercel-forwarded-for"];
  if (vercel) return vercel.split(",")[0].trim();
  const realIp = headers["x-real-ip"];
  if (realIp) return realIp.trim();
  const xff = headers["x-forwarded-for"];
  if (xff) {
    const hops = xff.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }
  return "unknown";
}

/**
 * Best-effort {ip, ua} from the ambient request headers. Used on the Google
 * sign-in path, where NextAuth's signIn callback gets no req object — but the
 * callback still runs inside the /api/auth route's request scope, so
 * next/headers is available. Never throws.
 */
function ipUaFromRequestHeaders(): { ip: string; ua: string } {
  try {
    const h = headers();
    const asRecord: Record<string, string> = {};
    for (const key of ["x-vercel-forwarded-for", "x-real-ip", "x-forwarded-for"]) {
      const value = h.get(key);
      if (value) asRecord[key] = value;
    }
    return { ip: ipFromAuthReq({ headers: asRecord }), ua: h.get("user-agent") || "" };
  } catch {
    return { ip: "unknown", ua: "" };
  }
}

/** Light user-agent → {browser, os} derivation for the login-activity log. */
function parseUserAgent(ua: string): { browser: string; os: string } {
  if (!ua) return { browser: "", os: "" };
  let browser = "Unknown";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/opr|opera/i.test(ua)) browser = "Opera";
  else if (/chrome|chromium|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";
  let os = "Unknown";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  return { browser, os };
}

/**
 * Persist a successful login to the admin's loginLogs. Fire-and-forget: a
 * recording failure must never block or slow a successful login, so all errors
 * are swallowed and logged.
 */
async function safeRecordLogin(adminId: string, ip: string, ua: string): Promise<void> {
  try {
    const { browser, os } = parseUserAgent(ua);
    await recordLogin(adminId, { ip, browser, os });
  } catch (err) {
    logger.warn({ err, adminId }, "failed to record login activity");
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    // Absolute/idle window: an untouched session expires after 8h, forcing
    // re-login. updateAge rotates the JWT (and its iat) hourly while the admin
    // is active, so a working session stays logged in without extending the
    // effective lifetime beyond the 8h window.
    maxAge: 8 * 60 * 60,
    updateAge: 60 * 60,
  },
  secret: serverEnv.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing credentials");
        }

        // Per-IP brute-force throttle. Complements the per-account lock in
        // brute-force.ts by slowing credential-stuffing / password-spray that
        // cycles through many emails from one source. Fails OPEN if the limiter
        // backend errors so a Redis outage can never block legitimate logins.
        const ip = ipFromAuthReq(req as { headers?: Record<string, string> });
        let loginAllowed = true;
        try {
          const rl = await checkRateLimit(`admin-login:${ip}`, {
            limit: 10,
            window: "5 m",
          });
          loginAllowed = rl.success;
        } catch (err) {
          logger.warn({ err }, "login rate-limit check failed; allowing");
        }
        if (!loginAllowed) {
          throw new Error("Too many login attempts. Try again later.");
        }

        await connectDB();
        const admin = await Admin.findOne({ email: credentials.email.toLowerCase() });
        if (!admin) {
          throw new Error("Invalid credentials");
        }

        if (admin.emergencyLocked) {
          throw new Error("Account is emergency-locked");
        }

        const bf = getBruteForceState(admin);
        if (bf.locked) {
          throw new Error("Account temporarily locked. Try again later.");
        }

        const ok = await verifyPassword(credentials.password, admin.passwordHash);
        if (!ok) {
          await recordFailedAttempt(admin);
          throw new Error("Invalid credentials");
        }

        if (admin.twoFactorEnabled) {
          const code = credentials.twoFactorCode ?? "";
          if (!code) {
            throw new Error("2FA_REQUIRED");
          }
          if (!verifyTwoFactorCode(admin.twoFactorSecret ?? "", code)) {
            await recordFailedAttempt(admin);
            throw new Error("Invalid 2FA code");
          }
        }

        await clearLoginAttempts(admin._id.toString());
        logger.info({ adminId: admin._id.toString() }, "admin login success");

        await safeRecordLogin(
          admin._id.toString(),
          ip,
          (req as { headers?: Record<string, string> })?.headers?.["user-agent"] ?? ""
        );

        return {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
    GoogleProvider({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: { prompt: "consent", access_type: "offline", response_type: "code" },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const admin = await Admin.findOne({ email: user.email?.toLowerCase() });
        if (!admin || admin.emergencyLocked) return false;
        const { ip, ua } = ipUaFromRequestHeaders();
        await safeRecordLogin(admin._id.toString(), ip, ua);
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id ?? token.sub ?? "";
        token.role = (user as { role?: string }).role ?? "owner";
        token.isAdmin = true;
      }
      if (!token.id && token.sub) token.id = token.sub;
      // §5 fix — Google logins carry the Google profile id, not the Mongo _id,
      // which broke every account route (2FA, password, recovery, lock) with a
      // CastError. Whenever token.id is not a valid ObjectId, resolve the real
      // admin id from the DB by email.
      if (token.email && (!token.id || !/^[a-f\d]{24}$/i.test(String(token.id)))) {
        await connectDB();
        const admin = await Admin.findOne({ email: String(token.email).toLowerCase() })
          .select("_id role")
          .lean();
        if (admin) {
          token.id = admin._id.toString();
          token.role = admin.role ?? "owner";
          token.isAdmin = true;
        }
      }
      // Real session revocation — on every request that carries an authenticated
      // admin token (skip the initial sign-in pass, where `user` is present and
      // the credentials/Google checks already ran), re-validate against the DB.
      // Invalidate (return an empty token so middleware sees no isAdmin and
      // redirects to /admin/login) when: the admin was deleted, is
      // emergency-locked, or the token was issued before the admin's last
      // password change. Scoped to admin tokens only — public/non-admin requests
      // carry no token and never reach this DB read. Lookup is by email (matches
      // the resolution above and avoids ObjectId casts for Google tokens).
      if (!user && token.isAdmin && token.email) {
        await connectDB();
        const admin = await Admin.findOne({ email: String(token.email).toLowerCase() })
          .select("emergencyLocked lastPasswordChange")
          .lean();
        const issuedAt = typeof token.iat === "number" ? token.iat : 0;
        const changedAt = admin?.lastPasswordChange
          ? Math.floor(new Date(admin.lastPasswordChange).getTime() / 1000)
          : 0;
        if (!admin || admin.emergencyLocked || issuedAt < changedAt) {
          return {} as typeof token;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        session.user.role = (token.role as string) || "owner";
        session.user.isAdmin = !!token.isAdmin;
      }
      return session;
    },
  },
};
