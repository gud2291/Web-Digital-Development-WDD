"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { useChatbotStore, type ChatMessage } from "@/store/chatbot";

const TALK_TO_HUMAN_PAYLOAD = "action:talk-to-human";

interface SendOptions {
  /** Suppress the optimistic user bubble — used by quick actions that should not show in the transcript. */
  silent?: boolean;
}

interface BotApiResponse {
  reply: string;
  error?: string;
}

/**
 * Drives the chatbot: optimistic user message → POST to /api/public/chatbot
 * → render bot reply with a character-by-character typing effect.
 *
 * Returns `sendMessage(text, opts?)`, `escalate()`, and `isTyping` so the
 * UI can lock the input and show a "writing" indicator.
 */
export function useChatbot() {
  const [isTyping, setIsTyping] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  // Read store actions imperatively to avoid re-renders on every message change.
  const addMessage = useChatbotStore((s) => s.addMessage);
  const updateMessage = useChatbotStore((s) => s.updateMessage);
  const appendToMessage = useChatbotStore((s) => s.appendToMessage);
  const setUnread = useChatbotStore((s) => s.setUnread);

  React.useEffect(() => () => abortRef.current?.abort(), []);

  const escalate = React.useCallback(async () => {
    const { sessionId, messages } = useChatbotStore.getState();
    const history = messages.slice(-30).map((m) => ({ role: m.role, text: m.text }));

    addMessage({ role: "user", text: "Connect me to a human" });
    setIsTyping(true);
    const botMsgId = addMessage({ role: "bot", text: "", typing: true });

    try {
      const res = await fetch("/api/public/chatbot/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, history }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Escalation failed");
      }
      await typeOut(
        "Thanks! I've notified our team — someone will reach out within 1 hour. Anything else I can help with in the meantime?",
        (chunk) => appendToMessage(botMsgId, chunk)
      );
      updateMessage(botMsgId, { typing: false });
      toast.success("We'll reach out within 1 hour");
    } catch (err) {
      updateMessage(botMsgId, {
        text: "I couldn't notify the team automatically — please use the contact form or WhatsApp.",
        typing: false,
      });
      toast.error(err instanceof Error ? err.message : "Could not escalate");
    } finally {
      setIsTyping(false);
    }
  }, [addMessage, updateMessage, appendToMessage]);

  const sendMessage = React.useCallback(
    async (text: string, opts: SendOptions = {}) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      // Talk-to-human is a special quick action — divert to the escalate flow.
      if (trimmed === TALK_TO_HUMAN_PAYLOAD) {
        await escalate();
        return;
      }

      if (!opts.silent) {
        addMessage({ role: "user", text: trimmed });
      }

      setIsTyping(true);
      // Placeholder bot bubble we'll stream characters into.
      const botMsgId = addMessage({ role: "bot", text: "", typing: true });

      const { sessionId, messages } = useChatbotStore.getState();
      // Send the conversation *before* the current request — last 16 turns.
      const history = messages
        .slice(0, opts.silent ? messages.length : -1)
        .slice(-16)
        .map((m) => ({ role: m.role, text: m.text }));

      const ctrl = new AbortController();
      abortRef.current?.abort();
      abortRef.current = ctrl;

      try {
        const res = await fetch("/api/public/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, sessionId, history }),
          signal: ctrl.signal,
        });

        if (res.status === 429) {
          updateMessage(botMsgId, {
            text: "Slow down a bit — try again in 30 sec.",
            typing: false,
          });
          return;
        }

        const data = (await res.json()) as BotApiResponse;
        if (!res.ok) {
          const friendly = data.error || "Something went wrong. Try the contact form instead.";
          updateMessage(botMsgId, { text: friendly, typing: false });
          return;
        }

        await typeOut(data.reply, (chunk) => appendToMessage(botMsgId, chunk));
        updateMessage(botMsgId, { typing: false });
        setUnread(true);
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") {
          updateMessage(botMsgId, { typing: false });
          return;
        }
        updateMessage(botMsgId, {
          text: "Couldn't reach the chat service. Please try again.",
          typing: false,
        });
      } finally {
        setIsTyping(false);
      }
    },
    [escalate, addMessage, updateMessage, appendToMessage, setUnread, isTyping]
  );

  return { sendMessage, escalate, isTyping };
}

/**
 * Character-by-character typing effect. Roughly 25ms/char for short replies,
 * scaling down for longer ones so we don't make the user wait forever.
 */
async function typeOut(text: string, onChunk: (chunk: string) => void): Promise<void> {
  const stepMs = text.length > 200 ? 8 : text.length > 100 ? 14 : 22;
  for (let i = 0; i < text.length; i++) {
    onChunk(text[i]);
    if (i < text.length - 1) {
      await new Promise<void>((resolve) => setTimeout(resolve, stepMs));
    }
  }
}

export { TALK_TO_HUMAN_PAYLOAD };
export type { ChatMessage };
