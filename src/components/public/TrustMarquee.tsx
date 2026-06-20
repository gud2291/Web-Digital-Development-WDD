/**
 * Infinite client-name marquee (CLAUDE.md §12.10). Replaces the static trust
 * strip. The track is rendered twice and animated -50% via CSS keyframes
 * (see globals.css `.trust-marquee`), pauses on hover, and fades at both edges
 * with a mask. Reduced-motion users see a static, centered strip.
 */
import { cldWidth } from "@/lib/cloudinary";

export interface TrustLogo {
  name: string;
  image?: string;
  imageAlt?: string;
}

export function TrustMarquee({ logos, label }: { logos: TrustLogo[]; label?: string }) {
  const items = logos.length ? [...logos, ...logos] : [];
  return (
    <div className="trust-bar">
      <div className="container trust-marquee__row">
        {label && <span className="trust-bar__label">{label}</span>}
        <div className="trust-marquee">
          <div className="trust-marquee__track" aria-hidden="true">
            {items.map((b, i) => (
              <span key={`${b.name}-${i}`} className="trust-bar__logo">
                {b.image ? (
                  // Logos are variable-aspect and sized by CSS (.trust-bar__logo
                  // img → height 36 / width auto), so we keep the element exactly
                  // and just deliver an optimized, right-sized Cloudinary file
                  // (f_auto,q_auto,w_300 for crisp retina at ≤150px wide).
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cldWidth(b.image, 300)}
                    alt={b.imageAlt || b.name}
                    decoding="async"
                  />
                ) : (
                  b.name
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
