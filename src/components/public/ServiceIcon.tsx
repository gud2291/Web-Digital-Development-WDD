import {
  Palette,
  Code2,
  Search,
  TrendingUp,
  ShoppingCart,
  PenTool,
  Globe,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

/**
 * Service card icon (CLAUDE.md §12.6): a lucide icon in a tinted circle whose
 * colour comes from the service's `accentColor`. Plain (server-safe) component.
 */
export type AccentColor = "blue" | "green" | "orange" | "pink" | "purple" | "teal";

const ICONS: Record<string, LucideIcon> = {
  Palette,
  Code2,
  Search,
  TrendingUp,
  ShoppingCart,
  PenTool,
  Globe,
  Smartphone,
};

const ACCENT_HEX: Record<AccentColor, string> = {
  blue: "#2563EB",
  green: "#22C55E",
  orange: "#F59E0B",
  pink: "#EC4899",
  purple: "#8B5CF6",
  teal: "#14B8A6",
};

export function ServiceIcon({
  iconName,
  accentColor,
  size = 26,
}: {
  iconName?: string;
  accentColor?: string;
  size?: number;
}) {
  const LucideIco = ICONS[iconName ?? "Globe"] ?? Globe;
  const color = ACCENT_HEX[(accentColor as AccentColor) ?? "blue"] ?? ACCENT_HEX.blue;
  return (
    <div className="svc-icon" style={{ background: `${color}18`, color }}>
      <LucideIco size={size} />
    </div>
  );
}
