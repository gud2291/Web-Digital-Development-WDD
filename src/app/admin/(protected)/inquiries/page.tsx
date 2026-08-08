import { listContacts } from "@/server/services/contact.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { InquiriesClient } from "./InquiriesClient";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const { items } = await listContacts({ page: 1, limit: 200 }).catch(() => ({
    items: [] as Awaited<ReturnType<typeof listContacts>>["items"],
  }));

  const serialised = items.map((i) => ({
    _id: String(i._id),
    name: i.name,
    email: i.email,
    phone: i.phone ?? "",
    service: i.service ?? "",
    budget: i.budget ?? "",
    message: i.message,
    status: i.status as "new" | "viewed" | "replied" | "closed",
    suspicious: Boolean(i.suspicious),
    spamReasons: i.spamReasons ?? [],
    createdAt: i.createdAt ? new Date(i.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <>
      <PageHeader title="Inquiries" description="Contact-form submissions and exit-intent leads." />
      <InquiriesClient initial={serialised} />
    </>
  );
}
