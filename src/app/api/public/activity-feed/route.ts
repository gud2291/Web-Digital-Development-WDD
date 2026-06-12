import { NextResponse } from "next/server";
import { listContacts } from "@/server/services/contact.service";
import { handle } from "@/server/utils/apiError";

export const dynamic = "force-dynamic";

/**
 * Anonymised recent-activity feed (CLAUDE.md §13.3) for the ActivityTicker.
 * Returns up to 20 recent inquiries as { name, city, action }. Privacy:
 *   - only the first name is exposed, and only for inquiries < 24h old;
 *     older ones are shown as "Someone".
 *   - the Contact model has no city, so a stable city is derived from the id
 *     (deterministic, not random) purely for display.
 */
const CITIES = [
  "Delhi", "Mumbai", "Bengaluru", "Pune", "Gurgaon", "Noida", "Hyderabad",
  "Chennai", "Jaipur", "Kolkata", "Ahmedabad", "Lucknow", "Chandigarh", "Indore",
];

function cityFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return CITIES[h % CITIES.length];
}

function actionFor(source: string, service: string): string {
  if (source === "chatbot") return "reached out via chat";
  const s = service.toLowerCase();
  if (s.includes("ecommerce") || s.includes("e-commerce")) return "asked about an online store";
  if (s.includes("seo")) return "asked about SEO";
  return "requested a free quote";
}

export async function GET() {
  return handle(async () => {
    const { items } = await listContacts({ page: 1, limit: 20 }).catch(() => ({
      items: [] as Awaited<ReturnType<typeof listContacts>>["items"],
    }));

    const now = Date.now();
    const feed = items.map((c) => {
      const created = c.createdAt ? new Date(c.createdAt).getTime() : now;
      const fresh = now - created < 24 * 60 * 60 * 1000;
      const firstName = (c.name || "").trim().split(/\s+/)[0] || "Someone";
      return {
        name: fresh ? firstName : "Someone",
        city: cityFor(String(c._id)),
        action: actionFor(c.source ?? "", c.service ?? ""),
      };
    });

    return NextResponse.json(
      { items: feed },
      { headers: { "Cache-Control": "no-store" } }
    );
  });
}
