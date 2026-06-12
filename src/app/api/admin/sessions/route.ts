import { NextResponse } from "next/server";
import { findAdminById } from "@/server/services/admin.service";
import { handle } from "@/server/utils/apiError";
import { gateAdmin } from "@/server/utils/requireAdmin";

export const dynamic = "force-dynamic";

/**
 * Returns the current admin's recent login activity. With NextAuth's JWT
 * strategy there's no per-session record in the DB to terminate — the
 * logout flow is owned by the client (NextAuth signOut).
 */
export async function GET() {
  const gate = await gateAdmin();
  if (!gate.ok) return gate.response;
  return handle(async () => {
    const admin = await findAdminById(gate.session.user.id);
    if (!admin) return NextResponse.json({ logs: [] });
    return NextResponse.json({ logs: admin.loginLogs ?? [] });
  });
}
