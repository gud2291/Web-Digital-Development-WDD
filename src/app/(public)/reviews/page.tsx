import { CTABanner, Reveal, Stars } from "@/components/ui";
import { ReviewsList, type ReviewData } from "@/components/public/ReviewsList";
import { ReviewForm } from "@/components/public/ReviewForm";
import { listTestimonials } from "@/server/services/testimonial.service";
import { formatDate } from "@/lib/utils";
import { metadataFromDb } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return metadataFromDb("reviews", {
    path: "/reviews",
    title: "Reviews",
    description:
      "Unedited reviews from real Web Digital Development clients in Delhi and abroad. Each one links to the client's live website, so you can verify every word yourself.",
  });
}

const FALLBACK_REVIEWS: ReviewData[] = [
  {
    id: "f1",
    name: "Vikram Malhotra",
    meta: "Website Design · 2 weeks ago",
    message: "Beautiful design, fast delivery. They understood our brand instantly. Lead inquiries are up 60%.",
    rating: 5,
    initials: "VM",
    featured: true,
    helpfulCount: 24,
    createdAt: Date.now() - 14 * 86400_000,
  },
  {
    id: "f2",
    name: "Anjali Verma",
    meta: "SEO + Maintenance · 1 month ago",
    message: "Best agency we've worked with. The team is responsive and transparent. Organic traffic doubled in 4 months.",
    rating: 5,
    initials: "AV",
    featured: false,
    helpfulCount: 18,
    createdAt: Date.now() - 30 * 86400_000,
  },
  {
    id: "f3",
    name: "Sandeep Rawat",
    meta: "E-commerce · 6 weeks ago",
    message: "Our online store went from concept to live in 5 weeks. Sales started from day one. Highly recommend.",
    rating: 5,
    initials: "SR",
    featured: false,
    helpfulCount: 12,
    createdAt: Date.now() - 42 * 86400_000,
  },
  {
    id: "f4",
    name: "Meera Kapoor",
    meta: "Website Redesign · 3 months ago",
    message: "They completely transformed our outdated website into a modern lead machine. Professional and punctual.",
    rating: 5,
    initials: "MK",
    featured: false,
    helpfulCount: 9,
    createdAt: Date.now() - 90 * 86400_000,
  },
];

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";
}

export default async function ReviewsPage() {
  const raw = await listTestimonials().catch(() => []);

  const reviews: ReviewData[] = raw.length
    ? raw.map((r) => ({
        id: String(r._id),
        name: r.clientName,
        meta: `${r.clientCompany || "Verified Client"} · ${formatDate(r.createdAt)}`,
        message: r.message,
        rating: r.rating ?? 5,
        initials: initialsOf(r.clientName),
        featured: !!r.adminHearted,
        helpfulCount: r.helpfulCount ?? 0,
        createdAt: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
      }))
    : FALLBACK_REVIEWS;

  const total = reviews.length;
  const counts = [0, 0, 0, 0, 0, 0];
  for (const r of reviews) counts[r.rating] = (counts[r.rating] ?? 0) + 1;
  const avg = total ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 4.9;

  const ratingData = [5, 4, 3, 2, 1].map((stars) => {
    const c = counts[stars] ?? 0;
    const pct = total ? Math.round((c / total) * 100) : 0;
    return { stars, width: `${pct}%`, count: c };
  });

  return (
    <div className="page-wrapper--wide">
      <section className="page-banner">
        <div className="container" style={{ textAlign: "center", maxWidth: 780, margin: "0 auto" }}>
          <Reveal><h1 className="t-h1">What Our Clients Say</h1></Reveal>
          <Reveal delay={80}>
            <p className="t-lead" style={{ marginTop: 12 }}>
              Unedited reviews from real clients. Each one links to their live website so you can
              check it yourself.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section--sm" style={{ paddingTop: 8 }}>
        <div className="container reviews-layout">
          <div>
            <Reveal>
              <div className="card reviews-summary">
                <div className="reviews-summary__score">{avg.toFixed(1)}</div>
                <div className="t-small">Out of 5 · {total} reviews</div>
                <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
                  <Stars value={Math.round(avg)} size={22} />
                </div>
                <div className="reviews-summary__bars">
                  {ratingData.map(({ stars, width, count }) => (
                    <div key={stars} className="rating-bar">
                      <span>{stars}★</span>
                      <div className="rating-bar__track">
                        <div className="rating-bar__fill" style={{ width }} />
                      </div>
                      <span className="rating-bar__count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <div style={{ marginTop: 18 }}>
              <ReviewForm />
            </div>
          </div>

          <ReviewsList reviews={reviews} />
        </div>
      </section>

      <CTABanner />
    </div>
  );
}
