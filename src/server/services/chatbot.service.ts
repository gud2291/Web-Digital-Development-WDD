import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Chatbot from "@/server/models/Chatbot";
import type { CreateChatbotInput, UpdateChatbotInput } from "@/server/validation/chatbot";

export async function listChatbotEntries(opts: { category?: string } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (opts.category) filter.category = opts.category;
  return Chatbot.find(filter).sort({ createdAt: -1 }).lean();
}

export async function getChatbotEntryById(id: string) {
  await connectDB();
  return Chatbot.findById(id).lean();
}

export async function createChatbotEntry(data: CreateChatbotInput) {
  await connectDB();
  return Chatbot.create(data);
}

export async function updateChatbotEntry(id: string, data: UpdateChatbotInput) {
  await connectDB();
  return Chatbot.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteChatbotEntry(id: string) {
  await connectDB();
  await Chatbot.findByIdAndDelete(id);
  return { ok: true };
}
