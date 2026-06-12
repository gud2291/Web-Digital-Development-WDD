import "server-only";
import { getServerSession as nextAuthGetServerSession } from "next-auth";
import { authOptions } from "./auth-options";

export async function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}

export async function requireAdminSession() {
  const session = await getServerSession();
  if (!session?.user?.isAdmin) {
    return { ok: false as const, session: null };
  }
  return { ok: true as const, session };
}
