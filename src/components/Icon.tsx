import * as React from "react";

export type IconName =
  | "monitor" | "code" | "search" | "cart" | "megaphone" | "smartphone"
  | "rocket" | "star" | "check" | "chevRight" | "chevDown" | "arrowRight" | "arrowLeft" | "arrowUp"
  | "user" | "users" | "mail" | "phone" | "map" | "clock" | "home" | "heart"
  | "target" | "zap" | "award" | "shield" | "chat" | "sparkle" | "badgeCheck"
  | "play" | "quote" | "whatsapp" | "menu" | "x" | "download" | "file"
  | "facebook" | "linkedin" | "instagram" | "youtube" | "plus" | "filter" | "layers" | "google" | "eye";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  color?: string;
  style?: React.CSSProperties;
}

const PATHS: Record<IconName, React.ReactNode> = {
  monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>,
  code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  cart: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></>,
  megaphone: <><path d="M3 11l18-7v16L3 13Z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></>,
  smartphone: <><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h0" /></>,
  rocket: <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2 2 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22 22 0 0 1-4 2z" /></>,
  star: <polygon points="12 2 15 8.6 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.6 12 2" />,
  check: <polyline points="20 6 9 17 4 12" />,
  chevRight: <polyline points="9 18 15 12 9 6" />,
  chevDown: <polyline points="6 9 12 15 18 9" />,
  arrowRight: <><path d="M5 12h14" /><polyline points="12 5 19 12 12 19" /></>,
  arrowLeft: <><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></>,
  arrowUp: <><path d="M12 19V5" /><polyline points="5 12 12 5 19 12" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  users: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-6-7" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  phone: <path d="M22 16.92V21a1 1 0 0 1-1.1 1A19 19 0 0 1 2 4.1 1 1 0 0 1 3 3h4l2 5-3 2a14 14 0 0 0 7 7l2-3 5 2z" />,
  map: <><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><path d="M9 3v15M15 6v15" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></>,
  home: <path d="M3 11l9-8 9 8v10a2 2 0 0 1-2 2h-4v-7H10v7H6a2 2 0 0 1-2-2V11z" />,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  award: <><circle cx="12" cy="8" r="7" /><polyline points="8 14 7 22 12 19 17 22 16 14" /></>,
  shield: <path d="M12 2 4 5v6c0 5 3.5 9.4 8 11 4.5-1.6 8-6 8-11V5l-8-3z" />,
  chat: <path d="M21 11.5a8.4 8.4 0 0 1-9.2 8.3L3 21l1.3-3.4A8.4 8.4 0 1 1 21 11.5z" />,
  sparkle: <><path d="M12 3l1.6 4.7L18 9.3l-4.4 1.6L12 15.6 10.4 11 6 9.3l4.4-1.6z" /><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" /></>,
  badgeCheck: <><path d="M12 2l2 2 3-1 1 3 3 1-1 3 1 3-3 1-1 3-3-1-2 2-2-2-3 1-1-3-3-1 1-3-1-3 3-1 1-3 3 1z" /><polyline points="9 12 11 14 15 10" /></>,
  play: <polygon points="6 4 20 12 6 20 6 4" />,
  quote: <path d="M3 17V11a4 4 0 0 1 4-4M13 17v-6a4 4 0 0 1 4-4" />,
  whatsapp: (
    <path
      fill="currentColor"
      stroke="none"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
    />
  ),
  menu: <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  download: <><path d="M12 3v12" /><polyline points="6 11 12 17 18 11" /><line x1="4" y1="21" x2="20" y2="21" /></>,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><polyline points="14 3 14 8 19 8" /></>,
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  linkedin: <><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M8 10v8M8 7v.01M12 18v-5a3 3 0 0 1 6 0v5" /></>,
  instagram: <><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" /></>,
  youtube: <><rect x="2" y="6" width="20" height="12" rx="3" /><polygon points="10 9 16 12 10 15" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  filter: <polygon points="22 3 2 3 10 12 10 19 14 21 14 12 22 3" />,
  layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
  google: <><path d="M12 2C6.48 2 2 6.48 2 12c0 4.99 3.66 9.12 8.5 9.93v-7.01H8.33V12h3.17v-2.08c0-3.1 1.86-4.79 4.66-4.79 1.36 0 2.68.25 2.68.25v2.96h-1.51c-1.49 0-1.95.93-1.95 1.88V12h3.33l-.53 2.92h-2.8v7.01C18.34 21.12 22 16.99 22 12c0-5.52-4.48-10-10-10z"/></>,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
};

export function Icon({ name, size = 20, stroke = 1.75, color = "currentColor", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "0 0 auto", ...style }}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
