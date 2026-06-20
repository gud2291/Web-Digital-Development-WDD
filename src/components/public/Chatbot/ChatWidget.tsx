"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/Icon";
import { CldImage } from "@/components/CldImage";
import { useChatbotStore } from "@/store/chatbot";
import { ChatWindow } from "./ChatWindow";

interface ChatConfig {
  name: string;
  avatar: string;
  welcome: string;
  placeholder: string;
  quickActions: { label: string; payload: string }[];
}

const FALLBACK_CONFIG: ChatConfig = {
  name: "Aria",
  avatar: "/assets/aria-avatar.jpg",
  welcome: "Hi! I'm Aria, the Web Digital Development assistant. How can I help?",
  placeholder: "Type a message…",
  quickActions: [
    { label: "What services do you offer?", payload: "What services do you offer?" },
    { label: "Start my project", payload: "I'd like to start a project" },
    { label: "Talk to Human", payload: "action:talk-to-human" },
  ],
};

/**
 * Floating chat bubble (bottom-right) + the chat window. Lives in the public
 * layout so it persists across all routes. The window itself is rendered via
 * AnimatePresence so opening/closing is smooth, and the entire widget hydrates
 * to a noop on first paint until config has loaded — keeping initial CLS at 0.
 */
export function ChatWidget() {
  const open = useChatbotStore((s) => s.open);
  const setOpen = useChatbotStore((s) => s.setOpen);
  const hasUnread = useChatbotStore((s) => s.hasUnread);
  const [config, setConfig] = React.useState<ChatConfig | null>(null);
  const [mounted, setMounted] = React.useState(false);

  // Defer config fetch until after the first paint so the BrandLoader's first
  // 2.4s isn't fighting with this XHR.
  React.useEffect(() => {
    setMounted(true);
    const t = window.setTimeout(() => {
      fetch("/api/public/chatbot-config")
        .then((r) => (r.ok ? (r.json() as Promise<ChatConfig>) : FALLBACK_CONFIG))
        .then((cfg) => setConfig(cfg))
        .catch(() => setConfig(FALLBACK_CONFIG));
    }, 1200);
    return () => window.clearTimeout(t);
  }, []);

  if (!mounted) return null;

  const effectiveConfig = config ?? FALLBACK_CONFIG;

  return (
    <>
      <AnimatePresence>
        {open && <ChatWindow config={effectiveConfig} onClose={() => setOpen(false)} />}
      </AnimatePresence>

      <motion.button
        type="button"
        className="chat-bubble"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        style={{ overflow: "hidden" }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 16 }}
      >
        {/* §14.7 — idle pulse removed; the bubble is static unless interacted with. */}
        {open ? (
          <Icon name="x" size={22} />
        ) : effectiveConfig.avatar ? (
          <CldImage
            src={effectiveConfig.avatar}
            alt="Aria"
            width={56}
            height={56}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Icon name="chat" size={22} />
        )}
        {!open && hasUnread && <span className="chat-bubble__dot" aria-hidden />}
      </motion.button>
    </>
  );
}
