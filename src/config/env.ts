/**
 * 🔒 Environment Variables — Validated at runtime with Zod.
 *
 * Importing this file in any server module will throw with a clear error
 * message at boot time if a required variable is missing. This prevents
 * runtime surprises in production.
 *
 * Two surfaces:
 *   - `serverEnv`  → secrets, DB urls, API keys (NEVER imported in client code)
 *   - `clientEnv`  → public variables prefixed with NEXT_PUBLIC_
 */

import { z } from "zod";

// ── Server-only schema (NEVER expose to browser) ───────────────────────────
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  MONGODB_URI: z.string().url().describe("MongoDB Atlas connection string"),

  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32, "Must be at least 32 chars"),

  // Google OAuth (admin login)
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // Admin seed
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(12),

  // Cloudinary (media)
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // Resend (email)
  RESEND_API_KEY: z.string().startsWith("re_"),
  RESEND_FROM_EMAIL: z.string().email(),

  // Upstash Redis (optional — for rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Google Gemini — optional. The chatbot currently answers from the
  // admin-managed knowledge base in `@/server/ai/smart-reply` and never calls
  // Gemini, so requiring this key only forced a live credential into every
  // environment for nothing. Keep the slot for when an LLM path is added.
  GEMINI_API_KEY: z.string().min(1).optional().describe("Google Gemini API key"),
});

// ── Client schema (exposed to browser via NEXT_PUBLIC_) ────────────────────
const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_GTM_ID: z.string().optional(),
  NEXT_PUBLIC_CLARITY_ID: z.string().optional(),
});

// ── Parse & expose ─────────────────────────────────────────────────────────
function parseEnv() {
  // Skip strict validation in build phase (Vercel preview, etc.)
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    return {
      server: process.env as unknown as z.infer<typeof serverSchema>,
      client: process.env as unknown as z.infer<typeof clientSchema>,
    };
  }

  const server = serverSchema.safeParse(process.env);
  const client = clientSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
    NEXT_PUBLIC_CLARITY_ID: process.env.NEXT_PUBLIC_CLARITY_ID,
  });

  if (!server.success) {
    console.error("❌ Invalid server env vars:", server.error.flatten().fieldErrors);
    throw new Error("Invalid server env vars — see logs above");
  }
  if (!client.success) {
    console.error("❌ Invalid client env vars:", client.error.flatten().fieldErrors);
    throw new Error("Invalid client env vars — see logs above");
  }

  return { server: server.data, client: client.data };
}

const parsed = parseEnv();

export const serverEnv = parsed.server;
export const clientEnv = parsed.client;
