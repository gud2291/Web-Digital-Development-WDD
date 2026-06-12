/** Shared admin types. */

/** A single searchable resource surfaced in the Cmd+K palette (§15.1). */
export interface AdminSearchItem {
  id: string;
  label: string;
  type: "Blog" | "Project" | "Service" | "Team" | "Testimonial";
  href: string;
}
