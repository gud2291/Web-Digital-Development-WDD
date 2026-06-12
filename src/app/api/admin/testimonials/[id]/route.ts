import { NextResponse } from "next/server";
import {
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} from "@/server/services/testimonial.service";
import { updateTestimonialSchema } from "@/server/validation/testimonial";
import { handle, notFound } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const doc = await getTestimonialById(ctx.params.id);
    if (!doc) return notFound("Testimonial");
    return NextResponse.json(doc);
  });
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = updateTestimonialSchema.parse(await req.json());
    const doc = await updateTestimonial(ctx.params.id, data);
    if (!doc) return notFound("Testimonial");
    return NextResponse.json(doc);
  });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    await deleteTestimonial(ctx.params.id);
    return NextResponse.json({ ok: true });
  });
}
