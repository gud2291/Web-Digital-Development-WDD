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

  const [showPassword, setShowPassword] = React.useState(false);

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
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-[#F4F8FF] to-white p-5">
      <div className="card max-w-[420px] w-full p-8">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.png" alt="Web Digital Development" className="h-8" />
          <span className="font-bold text-lg">Admin Sign-in</span>
        </div>
        <p className="t-small mt-2">
          Restricted area — authorised staff only.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-3.5" noValidate>
          <div className="field">
            <label className="field__label">Email</label>
            <input className="input" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <span className="admin-form-err">{errors.email.message}</span>}
          </div>
          <div className="field">
            <div className="flex justify-between items-center">
              <label className="field__label">Password</label>
              <Link
                href="/admin/forgot-password"
                className="text-xs text-[#2563EB] font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input className="input pr-9" type={showPassword ? "text" : "password"} autoComplete="current-password" {...register("password")} />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0 flex items-center text-gray-400"
              >
                {showPassword ? (
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M1 1l22 22" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /></svg>
                ) : (
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
            {errors.password && <span className="admin-form-err">{errors.password.message}</span>}
          </div>
          <Btn size="lg" iconRight="arrowRight" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Btn>
        </form>

        <div className="flex items-center gap-2.5 my-[18px]">
          <div className="flex-1 h-px bg-[var(--c-border)]" />
          <span className="t-small text-xs">OR</span>
          <div className="flex-1 h-px bg-[var(--c-border)]" />
        </div>
        <Btn variant="secondary" size="lg" type="button" onClick={onGoogle} className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 mr-2 flex-shrink-0"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24c0-1.65-.15-3.22-.42-4.75H24v9h12.75c-.55 2.96-2.22 5.48-4.73 7.16l7.37 5.71C43.7 36.43 46.5 30.76 46.5 24z"/><path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.37-5.71c-2.11 1.41-4.8 2.27-8.52 2.27-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg> Continue with Google
        </Btn>
        <p className="t-small text-center mt-3.5 text-xs">
          Public site? <a href="/" className="text-[#2563EB] font-semibold">Go to homepage</a>
        </p>
      </div>
    </div>
  );
}
