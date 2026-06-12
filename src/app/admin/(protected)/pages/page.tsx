import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Btn } from "@/components/ui";

export const dynamic = "force-dynamic";

interface PageEntry {
  title: string;
  href: string;
  hint: string;
  sections: { name: string; where: string }[];
}

// §3 — the content admin mirrors the public site: one card per public page,
// sections listed in the SAME order they appear on the site.
const PAGES: PageEntry[] = [
  {
    title: "Home",
    href: "/admin/homepage",
    hint: "The main landing page.",
    sections: [
      { name: "Hero Slider", where: "Homepage" },
      { name: "Trusted-By Strip", where: "Homepage" },
      { name: "Quick Stats", where: "Homepage" },
      { name: "About Blurb", where: "Site Content" },
      { name: "Services Grid", where: "Services" },
      { name: "Portfolio Slider", where: "Projects" },
      { name: "How We Work", where: "fixed design" },
      { name: "Reviews", where: "Testimonials" },
      { name: "Latest Insights", where: "Blog" },
      { name: "Bottom Call-To-Action", where: "Homepage" },
    ],
  },
  {
    title: "About",
    href: "/admin/site-content",
    hint: "Studio story, timeline and team.",
    sections: [
      { name: "Story & Why-Choose-Us", where: "Site Content" },
      { name: "Timeline", where: "Site Content" },
      { name: "Team Grid", where: "Team" },
    ],
  },
  {
    title: "Services",
    href: "/admin/services",
    hint: "Service cards + detail pages.",
    sections: [
      { name: "Service Cards", where: "Services" },
      { name: "FAQs & features", where: "inside each service" },
    ],
  },
  {
    title: "Contact",
    href: "/admin/site-content",
    hint: "Promises, budget ranges, map.",
    sections: [
      { name: "Quick Promises", where: "Site Content" },
      { name: "Budget Ranges", where: "Site Content" },
      { name: "Business Hours & Social", where: "Settings" },
    ],
  },
  {
    title: "Blog",
    href: "/admin/blog",
    hint: "Articles shown on /blog and the homepage.",
    sections: [{ name: "Posts", where: "Blog Manager" }],
  },
  {
    title: "Reviews",
    href: "/admin/testimonials",
    hint: "Client reviews shown on /reviews and the homepage.",
    sections: [{ name: "Testimonials", where: "Testimonials" }],
  },
];

export default function PagesIndex() {
  return (
    <>
      <PageHeader
        title="Pages"
        description="Your website, page by page — click a page to edit its sections in the order they appear on the site."
      />
      <div className="pages-grid">
        {PAGES.map((p) => (
          <div key={p.title} className="admin-card">
            <h3>{p.title}</h3>
            <p className="t-small" style={{ marginTop: 4 }}>{p.hint}</p>
            <ol>
              {p.sections.map((s, i) => (
                <li key={s.name}>
                  <span className="section-card__num" style={{ width: 20, height: 20, fontSize: 11 }}>{i + 1}</span>
                  <b>{s.name}</b>
                  <span>· {s.where}</span>
                </li>
              ))}
            </ol>
            <div style={{ marginTop: 16 }}>
              <Link href={p.href}>
                <Btn size="sm" iconRight="arrowRight">Edit this page</Btn>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
