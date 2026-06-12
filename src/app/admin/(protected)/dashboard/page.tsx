import { PageHeader } from "@/components/admin/PageHeader";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Welcome back, here's what's happening today." />
      <DashboardClient />
    </>
  );
}
