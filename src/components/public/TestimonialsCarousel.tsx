"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "@/components/Icon";
import { Stars, SectionHead } from "@/components/ui";

/**
 * Testimonials carousel (CLAUDE.md §12.12). Embla with 7s autoplay that pauses
 * on hover; 2 cards on desktop, 1 on mobile; big quote, amber stars, avatar,
 * name + company, with the focused card brought forward via opacity.
 */
export interface TestimonialSlide {
  name: string;
  role: string;
  quote: string;
  initials: string;
  color: string;
  rating: number;
  photo: string;
}

export function TestimonialsCarousel({ testimonials, title }: { testimonials: TestimonialSlide[]; title: string }) {
  const autoplay = React.useRef(Autoplay({ delay: 7000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true }, [autoplay.current]);
  const [selected, setSelected] = React.useState(0);
  const [snaps, setSnaps] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    setSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  if (!testimonials.length) return null;

  return (
    <section className="section section--alt">
      <div className="container">
        <SectionHead kicker="REVIEWS" title={title} />
        <div className="embla embla--testi">
          <div className="embla__viewport" ref={emblaRef}>
            <div className="embla__container">
              {testimonials.map((t, idx) => (
                <div className="embla__slide" key={t.name + idx}>
                  <div className={`card testimonial-card card--interactive embla__fade ${idx === selected ? "is-selected" : ""}`} style={{ height: "100%" }}>
                    <Icon name="quote" size={28} color="#94A3B8" />
                    <p style={{ fontSize: 19, lineHeight: 1.6, marginTop: 14, fontWeight: 500, color: "var(--c-text)" }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div style={{ marginTop: 16 }}>
                      <Stars value={t.rating} size={18} />
                    </div>
                    <div className="testimonial-card__author">
                      {t.photo ? (
                        <div className="avatar" style={{ overflow: "hidden", position: "relative" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={t.photo} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ) : (
                        <div className="avatar" style={{ background: t.color }}>{t.initials}</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.name}</div>
                        <div className="t-small">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="button" className="embla__arrow embla__arrow--prev" onClick={() => emblaApi?.scrollPrev()} aria-label="Previous review">
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="embla__arrow embla__arrow--next" onClick={() => emblaApi?.scrollNext()} aria-label="Next review">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="embla__dots">
          {snaps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to review ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`embla__dot ${i === selected ? "embla__dot--active" : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
