import { NextResponse } from "next/server";
import { z } from "zod";
import { createContact } from "@/server/services/contact.service";
import { handle, getClientIp, rateLimited } from "@/server/utils/apiError";
import { checkRateLimit } from "@/server/middleware/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Lightweight exit-intent / popup lead capture.
 * Persists into the Contact collection so it shows up in the same inbox.
 */
const leadSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(30).default(""),
  source: z.string().max(60).default("popup"),
});

export async function POST(req: Request) {
  return handle(async () => {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`public:lead:${ip}`);
    if (!rl.success) return rateLimited();

    const body = await req.json();
    const data = leadSchema.parse(body);
    const doc = await createContact({
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: "",
      budget: "",
      message: `[Lead — ${data.source}]`,
      ip,
    });
    return NextResponse.json({ ok: true, id: doc._id }, { status: 201 });
  });
}
