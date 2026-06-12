import { getHomepage } from "@/server/services/homepage.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { HomepageForm } from "./HomepageForm";

export const dynamic = "force-dynamic";

export default async function HomepageAdminPage() {
  const doc = await getHomepage().catch(() => null);

  return (
    <>
      <PageHeader
        title="Homepage"
        description="Edit hero slides, stats, client logos, CTA banner and section titles."
      />
      <HomepageForm
        initial={{
          heroSlides: (doc?.heroSlides ?? []).map((s) => ({
            type: (s.type as "image" | "video") ?? "image",
            image: s.image ?? "",
            video: s.video ?? "",
            title: s.title ?? "",
            subtitle: s.subtitle ?? "",
            ctaText: s.ctaText ?? "",
            ctaUrl: s.ctaUrl ?? "",
          })),
          stats: doc?.stats ?? [],
          clientLogos: (doc?.clientLogos ?? []).map((l) => ({
            name: l.name,
            image: l.image,
            visible: l.visible ?? true,
          })),
          ctaBanner: {
            title: doc?.ctaBanner?.title ?? "",
            sub: doc?.ctaBanner?.sub ?? "",
          },
          sectionTitles: {
            portfolio: doc?.sectionTitles?.portfolio ?? "Our Portfolio",
            services: doc?.sectionTitles?.services ?? "Our Services",
            testimonials: doc?.sectionTitles?.testimonials ?? "Client Love",
            badge: doc?.sectionTitles?.badge ?? "",
          },
        }}
      />
    </>
  );
}
