import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * On-demand ISR revalidation for the public pages that were converted from
 * `force-dynamic` to static/ISR (DRAFTMODE-ISR-PLAN). The pages cache for 1h,
 * but each admin save calls the matching entry below so published edits appear
 * on the live (cached) pages immediately — preserving the instant-freshness the
 * pages had while they were dynamic.
 *
 * `revalidatePath(route, "page")` purges every page under a dynamic segment
 * (e.g. all `/services/*` detail pages) in a single call, so the [id]/reorder
 * routes don't need to know the affected slug.
 *
 * Must only be called from a request scope (route handler) — never from
 * `generateStaticParams`/build, where `revalidatePath` is unavailable.
 */
export const revalidatePublic = {
  /** Homepage doc → the home page. */
  homepage() {
    revalidatePath("/");
  },
  /** Shared site-content → home, about, contact. */
  siteContent() {
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
  },
  /** Business/settings → contact (footer/social are handled by the "settings" tag). */
  settings() {
    revalidatePath("/contact");
  },
  /** Services → the service detail pages, the list, and the home "what we do" grid.
   *  The "services" tag also refreshes the cached header/mobile nav dropdown. */
  services() {
    revalidatePath("/services/[slug]", "page");
    revalidatePath("/services");
    revalidatePath("/");
    revalidateTag("services");
  },
  /** Blog → the post pages, the list, and the home "latest posts" row. */
  blog() {
    revalidatePath("/blog/[slug]", "page");
    revalidatePath("/blog");
    revalidatePath("/");
  },
  /** Legal → the policy pages and their list. */
  legal() {
    revalidatePath("/legal/[slug]", "page");
    revalidatePath("/legal");
  },
  /** Projects → the project pages, the list, and the home projects carousel. */
  projects() {
    revalidatePath("/projects/[slug]", "page");
    revalidatePath("/projects");
    revalidatePath("/");
  },
  /** Testimonials → the reviews page and the home testimonials carousel. */
  testimonials() {
    revalidatePath("/reviews");
    revalidatePath("/");
  },
  /** Team → the about page team grid. */
  team() {
    revalidatePath("/about");
  },
  /**
   * SEO meta override → the single page it targets. The admin SEO `pageSlug`
   * maps 1:1 to the public path ("home" → "/", otherwise "/<pageSlug>", e.g.
   * "about" → "/about", "services/website-design" → "/services/website-design"),
   * matching the keys the pages pass to `metadataFromDb`.
   */
  seo(pageSlug: string) {
    revalidatePath(pageSlug === "home" ? "/" : `/${pageSlug}`);
  },
};
