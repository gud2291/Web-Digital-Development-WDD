"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import Link from "next/link";
import { Btn } from "@/components/ui";
import { Icon } from "@/components/Icon";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: Values) => {
    try {
      const res = await fetch("/api/admin/password/reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }
      setSent(true);
      toast.success("Check your email for a reset link");
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
          <span style={{ fontWeight: 700, fontSize: 18 }}>Forgot Password</span>
        </div>
        <p className="t-small" style={{ marginTop: 8 }}>
          Enter your admin email and we&apos;ll send you a password reset link.
        </p>

        {sent ? (
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#DCFCE7",
                color: "#166534",
                padding: "14px 16px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <Icon name="check" size={18} />
              <span>
                If an account exists for that email, a reset link has been sent.
                Check your inbox (and spam folder).
              </span>
            </div>
            <Link
              href="/admin/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 18,
                color: "#2563EB",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <Icon name="arrowLeft" size={14} />
              Back to Sign in
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ marginTop: 20, display: "grid", gap: 14 }}
            noValidate
          >
            <div className="field">
              <label className="field__label">Email Address</label>
              <input
                className="input"
                type="email"
                autoComplete="email"
                placeholder="admin@webdigitaldevelopment.com"
                {...register("email")}
              />
              {errors.email && (
                <span className="admin-form-err">{errors.email.message}</span>
              )}
            </div>
            <Btn size="lg" iconRight="arrowRight" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Send Reset Link"}
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
        )}
      </div>
    </div>
  );
}
