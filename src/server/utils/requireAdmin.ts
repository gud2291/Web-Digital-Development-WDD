import "server-only";
import { requireAdminSession } from "@/server/auth/getServerSession";
import { unauthorized } from "./apiError";

/**
 * Guard helper for admin route handlers. Returns a NextResponse if not
 * authorised, otherwise returns the session.
 */
export async function gateAdmin() {
  const result = await requireAdminSession();
  if (!result.ok) return { ok: false as const, response: unauthorized() };
  return { ok: true as const, session: result.session };
}
