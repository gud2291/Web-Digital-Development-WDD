import type { Metadata } from "next";
import { AdminProviders } from "@/components/admin/AdminProviders";

export const metadata: Metadata = {
  title: "Admin · Web Digital Development",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// §14.18 — pre-paint admin theme (own key, default LIGHT, no OS auto-dark).
// Runs after the root layout's public script so the admin preference wins on
// /admin pages without a flash.
const ADMIN_THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('wdd-admin-theme');var d=t==='dark';document.documentElement.classList.toggle('dark',d);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();`;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: ADMIN_THEME_SCRIPT }} />
      <AdminProviders>{children}</AdminProviders>
    </>
  );
}
