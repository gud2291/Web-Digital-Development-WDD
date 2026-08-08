import { NextResponse } from "next/server";
import { z } from "zod";
import { createContact, countRecentByEmailKey } from "@/server/services/contact.service";
import { handle, getClientIp, rateLimited } from "@/server/utils/apiError";
import { checkRateLimit } from "@/server/middleware/rateLimit";
import { checkSpam, logBlocked, normalizeEmail } from "@/server/utils/spamGuard";

export const dynamic = "force-dynamic";

/**
 * Lightweight exit-intent / popup lead capture.
 * Persists into the Contact collection so it shows up in the same inbox —
 * which means it needs the same spam guard as the contact form itself.
 */
const leadSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).default(""),
  source: z.string().max(60).default("popup"),
});

export async function POST(req: Request) {
  return handle(async () => {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`public:lead:${ip}`, { limit: 3, window: "10 m" });
    if (!rl.success) return rateLimited();

    const body = await req.json();
    const data = leadSchema.parse(body);

    const verdict = checkSpam({ req, body, name: data.name, email: data.email });
    const emailKey = normalizeEmail(data.email);
    const priorToday = verdict.blocked ? 0 : await countRecentByEmailKey(emailKey, 24 * 60 * 60 * 1000);

    if (verdict.blocked || priorToday >= 3) {
      logBlocked("leads", verdict, { ip, name: data.name, email: data.email, priorToday });
      return NextResponse.json({ ok: true, id: null }, { status: 201 });
    }

    const doc = await createContact({
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: "",
      budget: "",
      message: `[Lead — ${data.source}]`,
      ip,
      source: `lead:${data.source}`,
      suspicious: verdict.suspicious,
      spamScore: verdict.score,
      spamReasons: verdict.reasons,
    });
    return NextResponse.json({ ok: true, id: doc._id }, { status: 201 });
  });
}
