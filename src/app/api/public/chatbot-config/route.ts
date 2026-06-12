import { NextResponse } from "next/server";
import { getSettings } from "@/server/services/settings.service";
import { handle } from "@/server/utils/apiError";

export const dynamic = "force-dynamic";

const FALLBACK_QUICK_ACTIONS = [
  { label: "What services do you offer?", payload: "What services do you offer?" },
  { label: "Get a free quote", payload: "I'd like to get a quote for my project" },
  { label: "Talk to Human", payload: "action:talk-to-human" },
];

/**
 * Public read-only endpoint for chatbot UI configuration. Pulls from the
 * Settings.chatbot subdocument so the admin can rename Aria, change the
 * welcome line, or swap quick-action prompts from /admin/settings without
 * a redeploy. Falls back to safe defaults when the DB is empty or unreachable.
 */
export async function GET() {
  return handle(async () => {
    const settings = await getSettings().catch(() => null);
    const cfg = settings?.chatbot;

    const quickActions = cfg?.quickActions?.length
      ? cfg.quickActions.map((q) => ({ label: q.label, payload: q.payload ?? q.label }))
      : FALLBACK_QUICK_ACTIONS;

    return NextResponse.json({
      name: cfg?.name || "Aria",
      avatar: cfg?.avatar || "",
      welcome: cfg?.welcome || "Hi! I'm Aria, the Web Digital Development assistant. How can I help?",
      placeholder: cfg?.placeholder || "Type a message…",
      quickActions,
    });
  });
}
