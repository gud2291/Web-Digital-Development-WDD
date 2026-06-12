import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const LoginLogSchema = new Schema(
  {
    ip: { type: String, required: true },
    browser: { type: String, default: "" },
    os: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AdminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["owner", "editor"], default: "owner" },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: null },
    recoveryCodeHash: { type: String, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    emergencyLocked: { type: Boolean, default: false },
    loginLogs: { type: [LoginLogSchema], default: [] },
    lastPasswordChange: { type: Date, default: Date.now },
    passwordResetHash: { type: String, default: null },
    passwordResetExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

export type Admin = InferSchemaType<typeof AdminSchema> & { _id: string };
const AdminModel: Model<Admin> = (models.Admin as Model<Admin>) || model<Admin>("Admin", AdminSchema);
export default AdminModel;
