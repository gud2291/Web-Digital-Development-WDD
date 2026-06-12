import Link from "next/link";
import { listTestimonials } from "@/server/services/testimonial.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { TestimonialsListClient } from "./TestimonialsListClient";
import { Btn } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TestimonialsAdminListPage() {
  const items = await listTestimonials({ includeHidden: true }).catch(() => []);
  const rows = items.map((t) => ({
    _id: String(t._id),
    clientName: t.clientName,
    clientCompany: t.clientCompany ?? "",
    rating: t.rating ?? 5,
    message: t.message,
    visible: !!t.visible,
    adminHearted: !!t.adminHearted,
  }));

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Client reviews. Toggle visibility or feature with the heart."
        actions={
          <Link href="/admin/testimonials/new">
            <Btn iconRight="plus">New testimonial</Btn>
          </Link>
        }
      />
      <TestimonialsListClient initial={rows} />
    </>
  );
}
