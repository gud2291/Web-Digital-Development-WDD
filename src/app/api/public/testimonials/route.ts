import { NextResponse } from "next/server";
import {
  listTestimonials,
  submitPublicTestimonial,
} from "@/server/services/testimonial.service";
import { publicTestimonialSchema } from "@/server/validation/testimonial";
import { handle, getClientIp, rateLimited } from "@/server/utils/apiError";
import { checkRateLimit } from "@/server/middleware/rateLimit";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const items = await listTestimonials();
    return NextResponse.json({ items });
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(`public:testimonial:${ip}`);
    if (!rl.success) return rateLimited();

    const body = await req.json();
    const data = publicTestimonialSchema.parse(body);
    const doc = await submitPublicTestimonial(data);
    return NextResponse.json({ ok: true, id: doc._id }, { status: 201 });
  });
}
