import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Contact from "@/server/models/Contact";
import type {
  ContactQuery,
  CreateContactInput,
  UpdateContactStatusInput,
} from "@/server/validation/contact";

export async function createContact(data: CreateContactInput & { ip?: string }) {
  await connectDB();
  return Contact.create(data);
}

export async function listContacts(query: ContactQuery) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
    Contact.countDocuments(filter),
  ]);
  return { items, total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) };
}

export async function getContactById(id: string) {
  await connectDB();
  return Contact.findById(id).lean();
}

export async function updateContactStatus(id: string, data: UpdateContactStatusInput) {
  await connectDB();
  return Contact.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteContact(id: string) {
  await connectDB();
  await Contact.findByIdAndDelete(id);
  return { ok: true };
}

export async function getDashboardStats(days = 30) {
  await connectDB();
  // Chart window (selectable: 7/30/90/365). Delta always compares 30-day windows.
  const chartDays = Math.min(Math.max(days, 1), 365);
  const since = new Date();
  since.setDate(since.getDate() - chartDays);
  // Prior 30-day window (days 31–60 ago) for period-over-period deltas.
  const prevSince = new Date();
  prevSince.setDate(prevSince.getDate() - 60);
  const last30Since = new Date();
  last30Since.setDate(last30Since.getDate() - 30);

  const [totalContacts, newContacts, recent, dailyAgg, statusAgg, last30, prev30] =
    await Promise.all([
      Contact.countDocuments({}),
      Contact.countDocuments({ status: "new" }),
      Contact.find({}).sort({ createdAt: -1 }).limit(6).lean(),
      Contact.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Contact.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Contact.countDocuments({ createdAt: { $gte: last30Since } }),
      Contact.countDocuments({ createdAt: { $gte: prevSince, $lt: last30Since } }),
    ]);

  const statusBreakdown = { new: 0, viewed: 0, replied: 0, closed: 0 };
  for (const s of statusAgg as { _id: string; count: number }[]) {
    if (s._id in statusBreakdown) statusBreakdown[s._id as keyof typeof statusBreakdown] = s.count;
  }

  return { totalContacts, newContacts, recent, dailyAgg, statusBreakdown, last30, prev30, chartDays };
}
