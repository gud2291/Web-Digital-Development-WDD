"use client";

import * as React from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Icon, type IconName } from "@/components/Icon";
import { Badge, Btn, Eyebrow } from "@/components/ui";

/**
 * Swipeable projects carousel (CLAUDE.md §12.11). Embla with 4s autoplay that
 * pauses on hover; 3 cards + peek on desktop, 2 on tablet, 1 on mobile;
 * drag/snap, prev/next arrows and dot indicators.
 */
export interface ProjectSlide {
  title: string;
  category: string;
  bg: string;
  icon: IconName;
  liveUrl: string;
  description: string;
  image: string;
}

export function ProjectsCarousel({ projects, title }: { projects: ProjectSlide[]; title: string }) {
  const autoplay = React.useRef(Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true }, [autoplay.current]);
  const [selected, setSelected] = React.useState(0);
  const [snaps, setSnaps] = React.useState<number[]>([]);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelected(emblaApi.selectedScrollSnap());
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    setSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  if (!projects.length) return null;

  return (
    <section className="section section--alt">
      <div className="container">
        <div className="section-header-row">
          <div>
            <Eyebrow>PORTFOLIO</Eyebrow>
            <h2 className="t-h2" style={{ marginTop: 14 }}>{title}</h2>
          </div>
          <Link href="/projects" className="svc-link" style={{ marginTop: 0 }}>
            View All <Icon name="arrowRight" size={14} />
          </Link>
        </div>

        <div className="embla">
          <div className="embla__viewport" ref={emblaRef}>
            <div className="embla__container">
              {projects.map((p, idx) => (
                <div className="embla__slide" key={p.title + idx}>
                  <article className="card project-card card--interactive" style={{ height: "100%" }}>
                    <div className="project-card__img" style={{ background: p.bg, position: "relative", overflow: "hidden" }}>
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div className="project-card__icon-wrap">
                          <Icon name={p.icon} size={36} />
                        </div>
                      )}
                      <Badge kind="neutral" style={{ position: "absolute", top: 14, left: 14 }}>
                        {p.category}
                      </Badge>
                    </div>
                    <div className="project-card__body">
                      <h4 className="t-h4">{p.title}</h4>
                      <p className="t-small" style={{ marginTop: 6 }}>{p.description}</p>
                      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                        {p.liveUrl ? (
                          <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">
                            <Btn size="sm" variant="outline" iconRight="arrowRight">Live Preview</Btn>
                          </a>
                        ) : (
                          <Btn size="sm" variant="outline" iconRight="arrowRight">Live Preview</Btn>
                        )}
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="embla__arrow embla__arrow--prev"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            aria-label="Previous projects"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="embla__arrow embla__arrow--next"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            aria-label="Next projects"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="embla__dots">
          {snaps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`embla__dot ${i === selected ? "embla__dot--active" : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
