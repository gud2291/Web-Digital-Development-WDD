/**
 * Infinite client-name marquee (CLAUDE.md §12.10). Replaces the static trust
 * strip. The track is rendered twice and animated -50% via CSS keyframes
 * (see globals.css `.trust-marquee`), pauses on hover, and fades at both edges
 * with a mask. Reduced-motion users see a static, centered strip.
 */
export function TrustMarquee({ logos, label }: { logos: string[]; label?: string }) {
  const items = logos.length ? [...logos, ...logos] : [];
  return (
    <div className="trust-bar">
      <div className="container trust-marquee__row">
        {label && <span className="trust-bar__label">{label}</span>}
        <div className="trust-marquee">
          <div className="trust-marquee__track" aria-hidden="true">
            {items.map((b, i) => (
              <span key={`${b}-${i}`} className="trust-bar__logo">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
