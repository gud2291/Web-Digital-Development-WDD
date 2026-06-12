"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  /** True while the bot's text is being typed out character-by-character. */
  typing?: boolean;
  /** Unix ms — used to order and label messages in the bubble. */
  createdAt: number;
}

interface ChatbotState {
  open: boolean;
  hasUnread: boolean;
  sessionId: string;
  messages: ChatMessage[];

  setOpen: (open: boolean) => void;
  setUnread: (unread: boolean) => void;
  addMessage: (msg: Omit<ChatMessage, "id" | "createdAt">) => string;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  appendToMessage: (id: string, chunk: string) => void;
  clear: () => void;
}

const newSessionId = () => nanoid(16);

/**
 * Zustand store for the public-facing chatbot. Persists `messages`,
 * `sessionId`, and `hasUnread` to `sessionStorage` — so a refresh keeps the
 * conversation, but closing the tab starts fresh. The `open` flag is NOT
 * persisted (re-opening the tab shouldn't reveal the panel automatically).
 */
export const useChatbotStore = create<ChatbotState>()(
  persist(
    (set) => ({
      open: false,
      hasUnread: true,
      sessionId: newSessionId(),
      messages: [],

      setOpen: (open) =>
        set((s) => ({
          open,
          // Reading the panel clears the unread marker.
          hasUnread: open ? false : s.hasUnread,
        })),

      setUnread: (unread) => set({ hasUnread: unread }),

      addMessage: (msg) => {
        const id = nanoid(10);
        const createdAt = Date.now();
        set((s) => ({ messages: [...s.messages, { ...msg, id, createdAt }] }));
        return id;
      },

      updateMessage: (id, patch) =>
        set((s) => ({
          messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),

      appendToMessage: (id, chunk) =>
        set((s) => ({
          messages: s.messages.map((m) => (m.id === id ? { ...m, text: m.text + chunk } : m)),
        })),

      clear: () =>
        set({
          messages: [],
          sessionId: newSessionId(),
          hasUnread: true,
        }),
    }),
    {
      name: "wdd-chatbot",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.sessionStorage
      ),
      partialize: (state) => ({
        sessionId: state.sessionId,
        messages: state.messages,
        hasUnread: state.hasUnread,
      }),
    }
  )
);

// SSR-safe no-op storage for the persist middleware before hydration.
const noopStorage: Storage = {
  length: 0,
  clear: () => undefined,
  getItem: () => null,
  key: () => null,
  removeItem: () => undefined,
  setItem: () => undefined,
};
