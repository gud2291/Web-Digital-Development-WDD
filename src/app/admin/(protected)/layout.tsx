import { redirect } from "next/navigation";
import { getServerSession } from "@/server/auth/getServerSession";
import { AdminShell } from "@/components/admin/AdminShell";
import { connectDB } from "@/server/db/mongodb";
import Contact from "@/server/models/Contact";

export const dynamic = "force-dynamic";

async function getNewInquiryCount(): Promise<number> {
  // Best-effort: never block the whole admin if the count fails — just hide the badge.
  try {
    await connectDB();
    return await Contact.countDocuments({ status: "new" });
  } catch {
    return 0;
  }
}

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session?.user?.isAdmin) {
    redirect("/admin/login");
  }

  const unreadInquiries = await getNewInquiryCount();

  return <AdminShell unreadInquiries={unreadInquiries}>{children}</AdminShell>;
}
