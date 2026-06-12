import { NextResponse } from "next/server";
import { getDashboardStats } from "@/server/services/contact.service";
import { connectDB } from "@/server/db/mongodb";
import Blog from "@/server/models/Blog";
import Service from "@/server/models/Service";
import Project from "@/server/models/Project";
import Testimonial from "@/server/models/Testimonial";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    await connectDB();
    const daysParam = Number(new URL(req.url).searchParams.get("days"));
    const days = [7, 30, 90, 365].includes(daysParam) ? daysParam : 30;
    const [contactStats, blogs, services, projects, testimonials] = await Promise.all([
      getDashboardStats(days),
      Blog.countDocuments({}),
      Service.countDocuments({}),
      Project.countDocuments({}),
      Testimonial.countDocuments({}),
    ]);
    const { last30, prev30 } = contactStats;
    const pct =
      prev30 === 0 ? (last30 > 0 ? 100 : 0) : Math.round(((last30 - prev30) / prev30) * 100);

    return NextResponse.json({
      counts: {
        contacts: contactStats.totalContacts,
        newContacts: contactStats.newContacts,
        blogs,
        services,
        projects,
        testimonials,
      },
      inquiriesDelta: { pct, dir: pct > 0 ? "up" : pct < 0 ? "down" : "flat" },
      statusBreakdown: contactStats.statusBreakdown,
      chartDays: contactStats.chartDays,
      dailyInquiries: contactStats.dailyAgg,
      recentInquiries: contactStats.recent,
    });
  });
}
