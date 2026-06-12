"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";
import Link from "next/link";
import { Btn } from "@/components/ui";
import { Icon } from "@/components/Icon";

const schema = z.object({
  code: z.string().regex(/^\d{6}$/, "Must be a 6-digit code"),
});

type Values = z.infer<typeof schema>;

export default function TwoFactorVerifyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = React.useState(["", "", "", "", "", ""]);

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });

  // Read credentials from sessionStorage (set by login page)
  const getCredentials = React.useCallback(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("wdd-2fa-pending");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as { email: string; password: string };
    } catch {
      return null;
    }
  }, []);

  const doSubmit = React.useCallback(
    async (code: string) => {
      const creds = getCredentials();
      if (!creds) {
        toast.error("Session expired — please sign in again");
        router.replace("/admin/login");
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await signIn("credentials", {
          email: creds.email,
          password: creds.password,
          twoFactorCode: code,
          redirect: false,
          callbackUrl: "/admin/dashboard",
        });

        if (!res) {
          toast.error("Verification failed");
          setIsSubmitting(false);
          return;
        }

        if (res.error) {
          toast.error(res.error === "Invalid 2FA code" ? "Invalid code — try again" : res.error);
          // Clear digits for retry
          setDigits(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
          setIsSubmitting(false);
          return;
        }

        // Clear pending credentials
        sessionStorage.removeItem("wdd-2fa-pending");
        toast.success("Welcome back!");
        router.replace(res.url || "/admin/dashboard");
        router.refresh();
      } catch {
        toast.error("Network error — try again");
        setIsSubmitting(false);
      }
    },
    [getCredentials, router]
  );

  const handleDigitChange = React.useCallback(
    (index: number, value: string) => {
      // Only allow digits
      const digit = value.replace(/\D/g, "").slice(-1);
      const newDigits = [...digits];
      newDigits[index] = digit;
      setDigits(newDigits);

      const code = newDigits.join("");
      setValue("code", code);

      // Auto-focus next input
      if (digit && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all 6 digits entered
      if (code.length === 6 && /^\d{6}$/.test(code)) {
        doSubmit(code);
      }
    },
    [digits, setValue, doSubmit]
  );

  const handleKeyDown = React.useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits]
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      if (!text) return;
      const newDigits = [...digits];
      for (let i = 0; i < text.length; i++) {
        newDigits[i] = text[i];
      }
      setDigits(newDigits);
      const code = newDigits.join("");
      setValue("code", code);

      if (code.length === 6 && /^\d{6}$/.test(code)) {
        doSubmit(code);
      } else {
        inputRefs.current[Math.min(text.length, 5)]?.focus();
      }
    },
    [digits, setValue, doSubmit]
  );

  // Auto-focus first input
  React.useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // If no pending credentials, redirect to login
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem("wdd-2fa-pending");
    if (!raw) {
      router.replace("/admin/login");
    }
  }, [router]);

  const onFormSubmit = handleSubmit((values) => doSubmit(values.code));

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
          <span style={{ fontWeight: 700, fontSize: 18 }}>2FA Verification</span>
        </div>
        <p className="t-small" style={{ marginTop: 8 }}>
          Enter the 6-digit code from your authenticator app.
        </p>

        <form onSubmit={onFormSubmit} style={{ marginTop: 24 }} noValidate>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
            }}
            onPaste={handlePaste}
          >
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={isSubmitting}
                autoComplete="one-time-code"
                style={{
                  width: 48,
                  height: 56,
                  borderRadius: 10,
                  border: `1.5px solid ${digit ? "#2563EB" : "#E5EAF2"}`,
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#0F172A",
                  background: "#fff",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
              />
            ))}
          </div>
          {errors.code && (
            <p className="admin-form-err" style={{ textAlign: "center", marginTop: 8 }}>
              {errors.code.message}
            </p>
          )}

          <Btn
            size="lg"
            iconRight="arrowRight"
            type="submit"
            disabled={isSubmitting}
            style={{ width: "100%", marginTop: 20 }}
          >
            {isSubmitting ? "Verifying…" : "Verify & Continue"}
          </Btn>
        </form>

        <div style={{ marginTop: 18, textAlign: "center" }}>
          <Link
            href="/admin/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#2563EB",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <Icon name="arrowLeft" size={14} />
            Back to Sign in
          </Link>
        </div>

        <p className="t-small" style={{ textAlign: "center", marginTop: 14, fontSize: 12 }}>
          <Icon name="shield" size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
          Secure admin access with 2FA protection
        </p>
      </div>
    </div>
  );
}
