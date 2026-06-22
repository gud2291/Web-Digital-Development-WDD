import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Quotation from "@/server/models/Quotation";

export interface CreateQuotationRecord {
  quotationNo: string;
  clientName: string;
  phone?: string;
  email?: string;
  serviceSlug?: string;
  serviceTitle?: string;
  costRange?: string;
  sentVia: "download" | "email" | "whatsapp";
  pdfUrl?: string;
}

export async function createQuotationRecord(data: CreateQuotationRecord) {
  await connectDB();
  return Quotation.create(data);
}

export async function listQuotations(opts: { page?: number; limit?: number } = {}) {
  await connectDB();
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(500, Math.max(1, opts.limit ?? 200));
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Quotation.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Quotation.countDocuments({}),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}
