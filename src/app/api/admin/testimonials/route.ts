import { NextResponse } from "next/server";
import {
  listTestimonials,
  createTestimonial,
} from "@/server/services/testimonial.service";
import { createTestimonialSchema } from "@/server/validation/testimonial";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const items = await listTestimonials({ includeHidden: true });
    return NextResponse.json({ items });
  });
}

export async function POST(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = createTestimonialSchema.parse(await req.json());
    const doc = await createTestimonial(data);
    return NextResponse.json(doc, { status: 201 });
  });
}
