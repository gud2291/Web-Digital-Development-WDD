import { listSeoMeta } from "@/server/services/seoMeta.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { SeoClient } from "./SeoClient";

export const dynamic = "force-dynamic";

export default async function SeoAdminPage() {
  const items = await listSeoMeta().catch(() => []);
  const rows = items.map((m) => ({
    _id: String(m._id),
    pageSlug: m.pageSlug,
    title: m.title ?? "",
    description: m.description ?? "",
    keywords: m.keywords ?? [],
    ogImage: m.ogImage ?? "",
    canonical: m.canonical ?? "",
    noIndex: !!m.noIndex,
  }));

  return (
    <>
      <PageHeader
        title="SEO Meta"
        description="Per-page SEO. Slugs match what generateMetadata reads (home, about, services, services/website-design, etc.)."
      />
      <SeoClient initial={rows} />
    </>
  );
}
