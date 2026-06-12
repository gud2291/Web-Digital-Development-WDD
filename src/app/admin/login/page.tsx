"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";
import Link from "next/link";
import { Btn } from "@/components/ui";
import { Icon } from "@/components/Icon";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password required"),
  twoFactorCode: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/admin/dashboard";

  // Security: strip any sensitive params leaked into the URL
  React.useEffect(() => {
    const url = new URL(window.location.href);
    const sensitive = ["password", "email", "token", "secret"];
    let dirty = false;
    for (const key of sensitive) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        dirty = true;
      }
    }
    if (dirty) {
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", twoFactorCode: "" },
  });

  const onSubmit = async (values: Values) => {
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      twoFactorCode: values.twoFactorCode || "",
      redirect: false,
      callbackUrl,
    });

    if (!res) {
      toast.error("Sign in failed");
      return;
    }

    if (res.error) {
      if (res.error === "2FA_REQUIRED") {
        // Store credentials temporarily for 2FA page
        sessionStorage.setItem(
          "wdd-2fa-pending",
          JSON.stringify({ email: values.email, password: values.password })
        );
        router.push("/admin/2fa/verify");
        return;
      }
      toast.error(res.error);
      return;
    }

    toast.success("Welcome back!");
    router.replace(res.url || callbackUrl);
    router.refresh();
  };

  const onGoogle = () => signIn("google", { callbackUrl });

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
          <span style={{ fontWeight: 700, fontSize: 18 }}>Admin Sign-in</span>
        </div>
        <p className="t-small" style={{ marginTop: 8 }}>
          Restricted area — authorised staff only.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 20, display: "grid", gap: 14 }} noValidate>
          <div className="field">
            <label className="field__label">Email</label>
            <input className="input" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <span className="admin-form-err">{errors.email.message}</span>}
          </div>
          <div className="field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="field__label">Password</label>
              <Link
                href="/admin/forgot-password"
                style={{ fontSize: 12, color: "#2563EB", fontWeight: 600 }}
              >
                Forgot password?
              </Link>
            </div>
            <input className="input" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <span className="admin-form-err">{errors.password.message}</span>}
          </div>
          <Btn size="lg" iconRight="arrowRight" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Btn>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--c-border)" }} />
          <span className="t-small" style={{ fontSize: 12 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "var(--c-border)" }} />
        </div>
        <Btn variant="secondary" size="lg" type="button" onClick={onGoogle} style={{ width: "100%" }}>
          <Icon name="users" size={16} /> Sign in with Google
        </Btn>
        <p className="t-small" style={{ textAlign: "center", marginTop: 14, fontSize: 12 }}>
          Public site? <a href="/" style={{ color: "#2563EB", fontWeight: 600 }}>Go to homepage</a>
        </p>
      </div>
    </div>
  );
}
