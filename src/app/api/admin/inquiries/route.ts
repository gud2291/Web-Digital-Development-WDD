import { NextResponse } from "next/server";
import { listContacts } from "@/server/services/contact.service";
import { contactQuerySchema } from "@/server/validation/contact";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const url = new URL(req.url);
    const query = contactQuerySchema.parse(Object.fromEntries(url.searchParams));
    const result = await listContacts(query);
    return NextResponse.json(result);
  });
}
