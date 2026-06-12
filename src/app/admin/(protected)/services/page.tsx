import Link from "next/link";
import { listServices } from "@/server/services/service.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { ServicesListClient } from "./ServicesListClient";
import { Btn } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ServicesAdminListPage() {
  const items = await listServices({ includeHidden: true }).catch(() => []);

  const rows = items.map((s) => ({
    _id: String(s._id),
    title: s.title,
    slug: s.slug,
    shortDescription: s.shortDescription ?? "",
    visible: !!s.visible,
  }));

  return (
    <>
      <PageHeader
        title="Services"
        description="Service offerings with pricing tiers and FAQs."
        actions={
          <Link href="/admin/services/new">
            <Btn iconRight="plus">New service</Btn>
          </Link>
        }
      />
      <ServicesListClient initial={rows} />
    </>
  );
}
