"use client";

import toast from "react-hot-toast";
import { Icon } from "@/components/Icon";

/**
 * Social share row for blog posts (CLAUDE.md §14.6): WhatsApp, LinkedIn, X,
 * Facebook (open the right share URL in a new tab) + Copy Link (clipboard +
 * toast). Twitter/X and copy use inline SVGs (not in the project icon set).
 */
export function BlogShareButtons({ url, title }: { url: string; title: string }) {
  const e = encodeURIComponent;
  const links = {
    whatsapp: `https://wa.me/?text=${e(`${title} ${url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${e(url)}&text=${e(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <span className="t-small">Share:</span>
      <a className="share-btn" href={links.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
        <Icon name="whatsapp" size={15} />
      </a>
      <a className="share-btn" href={links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
        <Icon name="linkedin" size={15} />
      </a>
      <a className="share-btn" href={links.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on X (Twitter)">
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.8l-5.3-6.93L4.8 22H1.54l8.02-9.17L1 2h6.97l4.79 6.33L18.244 2Zm-1.19 18h1.88L7.03 4H5.02l12.03 16Z" />
        </svg>
      </a>
      <a className="share-btn" href={links.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
        <Icon name="facebook" size={15} />
      </a>
      <button type="button" className="share-btn" onClick={copy} aria-label="Copy link">
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
          <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
        </svg>
      </button>
    </div>
  );
}
