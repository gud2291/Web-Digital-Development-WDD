import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Testimonial from "@/server/models/Testimonial";
import type {
  CreateTestimonialInput,
  PublicTestimonialInput,
  UpdateTestimonialInput,
} from "@/server/validation/testimonial";

export async function listTestimonials(opts: { includeHidden?: boolean } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (!opts.includeHidden) filter.visible = true;
  return Testimonial.find(filter).sort({ order: 1, createdAt: -1 }).lean();
}

export async function getTestimonialById(id: string) {
  await connectDB();
  return Testimonial.findById(id).lean();
}

export async function createTestimonial(data: CreateTestimonialInput) {
  await connectDB();
  return Testimonial.create(data);
}

export async function submitPublicTestimonial(data: PublicTestimonialInput) {
  await connectDB();
  // Held for moderation — anyone can post here without logging in, so nothing
  // reaches the homepage or /reviews (or the Review JSON-LD) until an admin
  // flips the visibility toggle in /admin/testimonials. This is what the form
  // has always told the visitor: "we'll publish it after a quick review".
  return Testimonial.create({ ...data, visible: false, source: "manual" });
}

export async function updateTestimonial(id: string, data: UpdateTestimonialInput) {
  await connectDB();
  return Testimonial.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteTestimonial(id: string) {
  await connectDB();
  await Testimonial.findByIdAndDelete(id);
  return { ok: true };
}
