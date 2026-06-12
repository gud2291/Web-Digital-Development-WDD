import { NextResponse } from "next/server";
import {
  listChatbotEntries,
  createChatbotEntry,
} from "@/server/services/chatbot.service";
import { createChatbotSchema } from "@/server/validation/chatbot";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") ?? undefined;
    const items = await listChatbotEntries({ category });
    return NextResponse.json({ items });
  });
}

export async function POST(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const data = createChatbotSchema.parse(await req.json());
    const doc = await createChatbotEntry(data);
    return NextResponse.json(doc, { status: 201 });
  });
}
