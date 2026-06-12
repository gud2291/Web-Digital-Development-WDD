import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  twoFactorCode: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must differ from current",
    path: ["newPassword"],
  });

export const verify2faSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Must be a 6-digit code"),
});

export const recoveryCodeSchema = z.object({
  recoveryCode: z.string().min(8),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const confirmPasswordResetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type Verify2faInput = z.infer<typeof verify2faSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ConfirmPasswordResetInput = z.infer<typeof confirmPasswordResetSchema>;
