"use client";

import { create } from "zustand";

/**
 * Shared search state between the topbar input and whatever list the current
 * admin page is rendering. The contract:
 *   - DataTable (the only consumer in the admin) reads `query` from this store
 *     and writes back via `setQuery` from its own inline search input. When the
 *     topbar input changes, it updates the same `query` — so both inputs stay
 *     in sync and either one filters the visible page.
 *   - On mount, DataTable registers a context-appropriate placeholder via
 *     `setPlaceholder` ("Search posts…", "Search inquiries…", etc.). On
 *     unmount, it calls `reset()` so the next page starts fresh.
 *   - Pages that don't use DataTable (settings, homepage editor, etc.) leave
 *     the placeholder at its default "Search anything…" and the topbar input
 *     simply doesn't affect anything on those pages — a known, accepted noop.
 */
interface AdminSearchState {
  query: string;
  placeholder: string;
  setQuery: (q: string) => void;
  setPlaceholder: (p: string) => void;
  reset: () => void;
}

const DEFAULT_PLACEHOLDER = "Search anything…";

export const useAdminSearchStore = create<AdminSearchState>((set) => ({
  query: "",
  placeholder: DEFAULT_PLACEHOLDER,
  setQuery: (query) => set({ query }),
  setPlaceholder: (placeholder) => set({ placeholder: placeholder || DEFAULT_PLACEHOLDER }),
  reset: () => set({ query: "", placeholder: DEFAULT_PLACEHOLDER }),
}));
