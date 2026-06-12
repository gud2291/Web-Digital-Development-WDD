import { listChatbotEntries } from "@/server/services/chatbot.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { ChatbotClient } from "./ChatbotClient";

export const dynamic = "force-dynamic";

export default async function ChatbotAdminPage() {
  const items = await listChatbotEntries().catch(() => []);
  const rows = items.map((c) => ({
    _id: String(c._id),
    title: c.title,
    content: c.content,
    category: c.category ?? "general",
  }));

  return (
    <>
      <PageHeader
        title="Chatbot Knowledge Base"
        description="Topical entries the assistant can draw on. Future RAG-ready."
      />
      <ChatbotClient initial={rows} />
    </>
  );
}
