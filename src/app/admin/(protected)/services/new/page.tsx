import { PageHeader } from "@/components/admin/PageHeader";
import { ServiceForm } from "../ServiceForm";

export const dynamic = "force-dynamic";

export default function NewServicePage() {
  return (
    <>
      <PageHeader title="New service" description="Add a service offering." />
      <ServiceForm />
    </>
  );
}
