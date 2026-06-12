import "server-only";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/server/db/mongodb";
import Admin from "@/server/models/Admin";
import { serverEnv } from "@/config/env";
import { verifyPassword } from "./bcrypt";
import { verifyTwoFactorCode } from "./two-factor";
import { clearLoginAttempts, getBruteForceState, recordFailedAttempt } from "./brute-force";
import { logger } from "@/server/utils/logger";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing credentials");
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
