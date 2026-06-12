"use client";

import { motion } from "framer-motion";
import type { ChatMessage } from "@/store/chatbot";
import { TypingDots } from "./TypingDots";

interface Props {
  message: ChatMessage;
  botName: string;
  botAvatar?: string;
}

function botInitials(name: string): string {
  return name.trim().split(/\s+/).map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase() || "A";
}

export function MessageBubble({ message, botName, botAvatar }: Props) {
  const isUser = message.role === "user";
  return (
    <motion.div
      className={`msg-row msg-row--${isUser ? "user" : "bot"}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {!isUser && (
        <div className="msg-avatar" aria-hidden>
          {botAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={botAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            botInitials(botName)
          )}
        </div>
      )}
      <div className="msg-bubble">
        {message.typing && message.text.length === 0 ? <TypingDots /> : message.text}
      </div>
    </motion.div>
  );
}
