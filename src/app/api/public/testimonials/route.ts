import { NextResponse } from "next/server";
import {
  listTestimonials,
  submitPublicTestimonial,
} from "@/server/services/testimonial.service";
import { publicTestimonialSchema } from "@/server/validation/testimonial";
import { handle, getClientIp, rateLimited } from "@/server/utils/apiError";
import { checkRateLimit, publicReadGate } from "@/server/middleware/rateLimit";
import { checkSpam, logBlocked } from "@/server/utils/spamGuard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const limited = await publicReadGate(req, "testimonials");
  if (limited) return limited;
  return handle(async () => {
    const items = await listTestimonials();
    return NextResponse.json({ items });
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`public:testimonial:${ip}`, { limit: 3, window: "10 m" });
    if (!rl.success) return rateLimited();

    const body = await req.json();
    const data = publicTestimonialSchema.parse(body);

    // Reviews are the classic target for link-stuffed SEO spam.
    const verdict = checkSpam({ req, body, name: data.clientName, message: data.message });
    if (verdict.blocked) {
      logBlocked("testimonials", verdict, { ip, name: data.clientName, message: data.message });
      return NextResponse.json({ ok: true, id: null }, { status: 201 });
    }

    const doc = await submitPublicTestimonial(data);
    return NextResponse.json({ ok: true, id: doc._id }, { status: 201 });
  });
}
