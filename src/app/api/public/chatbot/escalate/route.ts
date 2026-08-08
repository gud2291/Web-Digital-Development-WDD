import { NextResponse } from "next/server";
import { connectDB } from "@/server/db/mongodb";
import Contact from "@/server/models/Contact";
import { chatbotEscalateSchema } from "@/server/validation/chatbot-message";
import { checkRateLimit } from "@/server/middleware/rateLimit";
import { checkSpam, logBlocked } from "@/server/utils/spamGuard";
import { handle, getClientIp, rateLimited } from "@/server/utils/apiError";
import { sendEmail } from "@/server/email/resend";
import { ContactFormAdmin } from "@/server/email/templates/contact-form-admin";
import { siteConfig } from "@/config/site";
import { logger } from "@/server/utils/logger";

export const dynamic = "force-dynamic";

/**
 * "Talk to Human" escalation from the in-page chatbot.
 *
 * Saves a Contact doc with source="chatbot" + the conversation history as the
 * message body. If the user hasn't typed name/email yet, we use placeholders
 * tied to their sessionId so the owner can still triage.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`chatbot-escalate:${ip}`, { limit: 3, window: "10 m" });
    if (!rl.success) return rateLimited();

    const body = await req.json();
    const data = chatbotEscalateSchema.parse(body);

    const historyText =
      data.history.length === 0
        ? "(no prior messages)"
        : data.history
            .map((m) => `${m.role === "user" ? "User" : "Aria"}: ${m.text}`)
            .join("\n");

    const name = data.name?.trim() || "Chatbot visitor";
    const email = data.email?.trim() || `chatbot+${data.sessionId}@webdigitaldevelopment.com`;
    const phone = data.phone?.trim() || "";
    const message = `[Talk to Human request from chatbot]\n\nSession: ${data.sessionId}\n\nConversation:\n${historyText}`;

    // The widget stamps the same timing token the forms do, so a script POSTing
    // straight at this endpoint (it writes into the same inbox) is dropped.
    // Only the visitor's own lines are scored — Aria's replies quote our own
    // links and would otherwise trip the link-spam signal.
    const verdict = checkSpam({
      req,
      body,
      name: data.name,
      email: data.email,
      message: data.history
        .filter((m) => m.role === "user")
        .map((m) => m.text)
        .join("\n"),
    });
    if (verdict.blocked) {
      logBlocked("chatbot-escalate", verdict, { ip, sessionId: data.sessionId, name, email });
      return NextResponse.json({ ok: true, id: null }, { status: 201 });
    }

    await connectDB();
    const doc = await Contact.create({
      name,
      email,
      phone,
      service: "Chatbot escalation",
      budget: "",
      message,
      ip,
      source: "chatbot",
      suspicious: verdict.suspicious,
      spamScore: verdict.score,
      spamReasons: verdict.reasons,
    });

    // Fire-and-forget admin email. If it fails, the DB record still exists.
    try {
      await sendEmail({
        to: siteConfig.email,
        subject: `New chatbot escalation — ${name}`,
        react: ContactFormAdmin({
          name,
          email,
          phone,
          service: "Chatbot escalation",
          budget: "",
          message,
        }),
      });
    } catch (err) {
      logger.error({ err }, "chatbot escalate email failed");
    }

    return NextResponse.json({ ok: true, id: String(doc._id) }, { status: 201 });
  });
}
