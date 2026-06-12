import type { IconName } from "@/components/Icon";

const VALID_ICONS: ReadonlySet<IconName> = new Set<IconName>([
  "monitor", "code", "search", "cart", "megaphone", "smartphone",
  "rocket", "star", "check", "chevRight", "chevDown", "arrowRight", "arrowUp",
  "user", "users", "mail", "phone", "map", "clock", "home", "heart",
  "target", "zap", "award", "shield", "chat", "sparkle", "badgeCheck",
  "play", "quote", "whatsapp", "menu", "x", "download", "file",
  "facebook", "linkedin", "instagram", "youtube", "plus", "filter", "layers",
]);

/**
 * Safely coerce an arbitrary string from the DB into a known IconName.
 * Falls back to the supplied default so the UI never breaks on bad data.
 */
export function safeIcon(value: string | undefined | null, fallback: IconName = "monitor"): IconName {
  if (!value) return fallback;
  return VALID_ICONS.has(value as IconName) ? (value as IconName) : fallback;
}
