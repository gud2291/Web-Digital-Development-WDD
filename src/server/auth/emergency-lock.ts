import "server-only";
import Admin from "@/server/models/Admin";

/**
 * Emergency lock — sets a flag that blocks all logins regardless of credentials.
 * Used when the owner suspects compromise. Lifted via direct DB access or
 * recovery-code flow.
 */
export async function setEmergencyLock(adminId: string, locked: boolean): Promise<void> {
  await Admin.updateOne({ _id: adminId }, { $set: { emergencyLocked: locked } });
}

export async function isEmergencyLocked(adminId: string): Promise<boolean> {
  const admin = await Admin.findById(adminId).select("emergencyLocked").lean();
  return !!admin?.emergencyLocked;
}
