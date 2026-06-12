import { NextResponse } from "next/server";
import { confirmPasswordReset } from "@/server/services/admin.service";
import { confirmPasswordResetSchema } from "@/server/validation/auth";
import { badRequest, handle } from "@/server/utils/apiError";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const data = confirmPasswordResetSchema.parse(await req.json());
    try {
      const result = await confirmPasswordReset(data.token, data.newPassword);
      return NextResponse.json(result);
    } catch (err) {
      return badRequest(err instanceof Error ? err.message : "Reset failed");
    }
  });
}
