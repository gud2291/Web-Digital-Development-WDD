import { PageHeader } from "@/components/admin/PageHeader";
import { TestimonialForm } from "../TestimonialForm";

export const dynamic = "force-dynamic";

export default function NewTestimonialPage() {
  return (
    <>
      <PageHeader title="New testimonial" />
      <TestimonialForm />
    </>
  );
}
