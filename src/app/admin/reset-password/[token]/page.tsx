"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";
import Link from "next/link";
import { Btn } from "@/components/ui";
import { Icon } from "@/components/Icon";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: Values) => {
    setError(null);
    try {
      const res = await fetch("/api/admin/password/reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: values.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reset failed");
        return;
      }
      toast.success("Password updated — please sign in");
      router.replace("/admin/login");
    } catch {
      toast.error("Network error — try again");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(180deg,#F4F8FF 0%,#fff 60%)",
        padding: 20,
      }}
    >
      <div className="card" style={{ maxWidth: 420, width: "100%", padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="Web Digital Development" style={{ height: 32 }} />
          <span style={{ fontWeight: 700, fontSize: 18 }}>Reset Password</span>
        </div>
        <p className="t-small" style={{ marginTop: 8 }}>
          Choose a strong new password for your admin account.
        </p>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#FEE2E2",
              color: "#DC2626",
              padding: "14px 16px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              marginTop: 16,
            }}
          >
            <Icon name="x" size={18} />
            <div>
              <div>{error}</div>
              <Link
                href="/admin/forgot-password"
                style={{ color: "#DC2626", fontWeight: 600, textDecoration: "underline", fontSize: 13 }}
              >
                Request a new reset link
              </Link>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ marginTop: 20, display: "grid", gap: 14 }}
          noValidate
        >
          <div className="field">
            <label className="field__label">New Password</label>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="Min 12 chars, uppercase, lowercase, number"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <span className="admin-form-err">{errors.newPassword.message}</span>
            )}
          </div>
          <div className="field">
            <label className="field__label">Confirm Password</label>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <span className="admin-form-err">{errors.confirmPassword.message}</span>
            )}
          </div>
          <Btn size="lg" iconRight="arrowRight" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating…" : "Set New Password"}
          </Btn>
          <Link
            href="/admin/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginTop: 4,
              color: "#2563EB",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <Icon name="arrowLeft" size={14} />
            Back to Sign in
          </Link>
        </form>
      </div>
    </div>
  );
}
