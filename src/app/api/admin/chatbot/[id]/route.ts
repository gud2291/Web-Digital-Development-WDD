import { NextResponse } from "next/server";
import {
  getChatbotEntryById,
  updateChatbotEntry,
  deleteChatbotEntry,
} from "@/server/services/chatbot.service";
import { updateChatbotSchema } from "@/server/validation/chatbot";
import { handle, notFound } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const doc = await getChatbotEntryById(ctx.params.id);
    if (!doc) return notFound("Chatbot entry");
    return NextResponse.json(doc);
  });
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = updateChatbotSchema.parse(await req.json());
    const doc = await updateChatbotEntry(ctx.params.id, data);
    if (!doc) return notFound("Chatbot entry");
    return NextResponse.json(doc);
  });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    await deleteChatbotEntry(ctx.params.id);
    return NextResponse.json({ ok: true });
  });
}
