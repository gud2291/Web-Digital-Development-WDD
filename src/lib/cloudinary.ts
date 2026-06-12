/**
 * Inject Cloudinary delivery transformations into a `res.cloudinary.com` URL.
 * For non-Cloudinary URLs (or already-transformed ones) the input is returned unchanged.
 *
 * `f_auto,q_auto` lets Cloudinary serve the best format (AVIF/WebP) at the best
 * quality for the requesting browser — the single highest-leverage perf win.
 */
export function cldOptimize(url: string, extra?: string): string {
  if (!url) return url;
  if (!url.includes("res.cloudinary.com")) return url;
  if (!url.includes("/upload/")) return url;

  const transforms = ["f_auto", "q_auto", ...(extra ? [extra] : [])].join(",");

  // If transforms are already injected, leave them alone — don't double-apply.
  const afterUpload = url.split("/upload/")[1] ?? "";
  if (/^[a-z]_[^/]+(,|\/)/i.test(afterUpload.split("/")[0] ?? "")) {
    return url;
  }
  return url.replace("/upload/", `/upload/${transforms}/`);
}

/**
 * Convenience helper for a fixed-width responsive image. Returns a URL with
 * f_auto,q_auto,w_<n> baked in. Used in places where we know the rendered width.
 */
export function cldWidth(url: string, width: number): string {
  return cldOptimize(url, `w_${width}`);
}

/**
 * Tiny blurred variant of a Cloudinary image (§12.18), used as next/image
 * `blurDataURL` for a blur-up placeholder. Returns "" for non-Cloudinary URLs.
 */
export function cldBlur(url: string): string {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return "";
  return url.replace("/upload/", "/upload/e_blur:1000,q_auto:low,f_auto,w_24/");
}
