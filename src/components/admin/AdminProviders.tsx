"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { ConfirmProvider } from "@/components/admin/ConfirmDialog";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
      {/* §15.8 — admin toasts: top-right, 4s auto-dismiss. */}
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#0F172A",
            color: "#fff",
            fontSize: 14,
            fontFamily: "var(--font-jakarta), system-ui, sans-serif",
            borderRadius: 10,
            padding: "12px 16px",
          },
          success: { iconTheme: { primary: "#22C55E", secondary: "#fff" } },
          error: { iconTheme: { primary: "#DC2626", secondary: "#fff" } },
        }}
      />
    </SessionProvider>
  );
}
