"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
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
  );
}
