"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/Icon";
import { useChatbotStore } from "@/store/chatbot";
import { useChatbot } from "@/hooks/useChatbot";
import { MessageBubble } from "./MessageBubble";
import { QuickActions } from "./QuickActions";

interface ChatConfig {
  name: string;
  avatar: string;
  welcome: string;
  placeholder: string;
  quickActions: { label: string; payload: string }[];
}

interface Props {
  config: ChatConfig;
  onClose: () => void;
}

function botInitials(name: string): string {
  return name.trim().split(/\s+/).map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase() || "A";
}

export function ChatWindow({ config, onClose }: Props) {
  const messages = useChatbotStore((s) => s.messages);
  const { sendMessage, isTyping } = useChatbot();
  const [draft, setDraft] = React.useState("");
  const bodyRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message as the conversation grows.
  React.useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onSend = async (text: string) => {
    if (!text.trim() || isTyping) return;
    setDraft("");
    await sendMessage(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSend(draft);
  };

  return (
    <motion.div
      className="chat-window"
      role="dialog"
      aria-label={`${config.name} chat`}
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      <header className="chat-window__header">
        <div className="chat-window__avatar" aria-hidden>
          {config.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            botInitials(config.name)
          )}
        </div>
        <div>
          <div className="chat-window__title">{config.name}</div>
          <div className="chat-window__sub">
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#22C55E" }} />
            Online
          </div>
        </div>
        <button type="button" className="chat-window__close" onClick={onClose} aria-label="Close chat">
          <Icon name="x" size={16} />
        </button>
      </header>

      <div ref={bodyRef} className="chat-window__body">
        {messages.length === 0 && (
          <div className="msg-row msg-row--bot">
            <div className="msg-avatar" aria-hidden>
              {config.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={config.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                botInitials(config.name)
              )}
            </div>
            <div className="msg-bubble">{config.welcome}</div>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} botName={config.name} botAvatar={config.avatar} />
        ))}
      </div>

      <div className="chat-window__footer">
        <QuickActions actions={config.quickActions} disabled={isTyping} onPick={(p) => void onSend(p)} />
        <form className="chat-window__input-row" onSubmit={handleSubmit}>
          <input
            className="chat-window__input"
            placeholder={config.placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={isTyping}
            autoFocus
            maxLength={1500}
            aria-label="Type a message"
          />
          <button type="submit" className="chat-window__send" disabled={isTyping || !draft.trim()}>
            Send <Icon name="arrowRight" size={12} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
