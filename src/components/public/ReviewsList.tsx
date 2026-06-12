"use client";

import * as React from "react";
import { Icon } from "@/components/Icon";
import { Badge, Reveal, Stars } from "@/components/ui";

export interface ReviewData {
  id: string;
  name: string;
  meta: string;
  message: string;
  rating: number;
  initials: string;
  featured: boolean;
  helpfulCount: number;
  createdAt: number;
}

const FILTERS = ["All", "5 ★", "4 ★", "Featured", "Recent"] as const;

interface Props {
  reviews: ReviewData[];
}

export function ReviewsList({ reviews }: Props) {
  const [active, setActive] = React.useState<(typeof FILTERS)[number]>("All");

  const visible = React.useMemo(() => {
    switch (active) {
      case "5 ★":
        return reviews.filter((r) => r.rating === 5);
      case "4 ★":
        return reviews.filter((r) => r.rating === 4);
      case "Featured":
        return reviews.filter((r) => r.featured);
      case "Recent":
        return [...reviews].sort((a, b) => b.createdAt - a.createdAt);
      default:
        return reviews;
    }
  }, [active, reviews]);

  return (
    <div className="reviews-list">
      <div className="filter-pills" style={{ padding: 0, marginBottom: 20 }}>
        {FILTERS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setActive(p)}
            className={`pill ${p === active ? "pill--active" : ""}`}
          >
            {p}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <p className="t-small">No reviews match this filter.</p>
        </div>
      ) : (
        visible.map((r, idx) => (
          <Reveal key={r.id} delay={(idx % 6) * 60}>
            <div className="card review-card card--interactive">
              <div className="review-card__header">
                <div className="review-card__author">
                  <div className="avatar">{r.initials}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div className="t-small" style={{ fontSize: 12 }}>{r.meta}</div>
                  </div>
                </div>
                {r.featured && (
                  <Badge kind="accent">
                    <Icon name="heart" size={10} /> Featured
                  </Badge>
                )}
              </div>
              <div style={{ marginTop: 12 }}><Stars value={r.rating} /></div>
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#334155" }}>
                &ldquo;{r.message}&rdquo;
              </p>
              <div className="review-card__actions">
                <span>
                  <Icon name="heart" size={14} /> {r.helpfulCount} found helpful
                </span>
                <span>Was this helpful?</span>
                <a style={{ color: "#2563EB", fontWeight: 600 }}>Yes</a>
                <a style={{ color: "#64748B" }}>No</a>
              </div>
            </div>
          </Reveal>
        ))
      )}
    </div>
  );
}
