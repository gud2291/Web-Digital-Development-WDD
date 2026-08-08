import "server-only";
import { clientEnv } from "@/config/env";
import { HONEYPOT_FIELD, ELAPSED_FIELD, MIN_FORM_MS } from "@/config/antiSpam";
import { logger } from "./logger";

/**
 * 🛡️ Spam / bot guard for PUBLIC write endpoints (contact, leads, newsletter,
 * testimonials, chatbot escalation).
 *
 * Layered defence — a bot has to beat every layer, a human never notices any:
 *
 *  1. Honeypot      — a hidden input real users can't see. Auto-fillers fill it.
 *  2. Timing        — the client reports ms spent on the form. Under
 *                     `minElapsedMs` (or missing entirely, i.e. a script POSTing
 *                     straight at the API) is not a human.
 *  3. Origin        — browsers always send `Origin` on a fetch POST. A wrong
 *                     origin is a cross-site script; a missing one is a bot.
 *  4. Content score — gibberish names (`XMStNqpetTrIGCUYBAB`), gmail dot-alias
 *                     abuse (`k.end.r.acl.iv.e3.5@gmail.com`), link spam,
 *                     disposable inboxes, SEO/casino keywords, Cyrillic.
 *
 * Verdict semantics:
 *   `blocked`    → drop it. Callers return a FAKE 201 so the bot marks the
 *                  target as "delivered" and moves on instead of mutating its
 *                  payload until something gets through.
 *   `suspicious` → borderline. Save it (so a false positive is never lost) but
 *                  skip the auto-reply email — bogus addresses bounce, and
 *                  bounces are what get our sending domain marked as spam.
 */

export { HONEYPOT_FIELD, ELAPSED_FIELD };

/** Score at/above which we drop the submission entirely. */
const BLOCK_SCORE = 5;
/** Score at/above which we save but treat the sender as untrusted. */
const SUSPICIOUS_SCORE = 3;

export interface SpamVerdict {
  blocked: boolean;
  suspicious: boolean;
  score: number;
  reasons: string[];
}

export interface SpamCheckInput {
  req: Request;
  body: unknown;
  name?: string;
  email?: string;
  message?: string;
  /** Minimum time a human plausibly needs on this form. Default `MIN_FORM_MS`. */
  minElapsedMs?: number;
}

// ── Signals ────────────────────────────────────────────────────────────────

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "temp-mail.org", "throwawaymail.com", "yopmail.com", "sharklasers.com",
  "getnada.com", "trashmail.com", "maildrop.cc", "dispostable.com",
  "fakeinbox.com", "mailnesia.com", "spam4.me", "grr.la", "guerrillamail.info",
  "emailondeck.com", "moakt.com", "tempr.email", "mohmal.com", "inboxkitten.com",
]);

/**
 * Deliberately narrow. We SELL web design and SEO, so a genuine enquiry says
 * "I need seo services" or "rank my website" — those phrases must never score.
 * Only outbound-spam wording that no customer would write belongs here.
 */
const SPAM_KEYWORDS = [
  "casino", "viagra", "cialis", "porn", "escort", "xanax", "payday loan",
  "binary option", "forex signal", "crypto invest", "bitcoin invest",
  "buy backlinks", "cheap backlinks", "link building service", "adult dating",
  "webcam", "make money fast", "hacking service", "recover your funds",
  "hot singles", "enlargement",
];

const URL_RE = /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|org|ru|xyz|top|info|biz|click|link|site|online|shop)\b/gi;
const BBCODE_RE = /\[url[=\]]|<a\s+href=|\[link[=\]]/i;
const CYRILLIC_RE = /[Ѐ-ӿ]/;
const VOWELS = /[aeiouy]/i;

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

/**
 * "qwertyuiopasdf", "asdfgh", "mnbvcxz" — mashed keyboard walks have normal
 * vowel ratios, so they slip past every other signal. Runs of 5 (not 4) so real
 * surnames that happen to contain a short run — "Ewerton" holds "wert" — pass.
 */
function hasKeyboardWalk(lowerToken: string): boolean {
  for (const row of KEYBOARD_ROWS) {
    const reversed = [...row].reverse().join("");
    for (let i = 0; i + 5 <= row.length; i++) {
      if (lowerToken.includes(row.slice(i, i + 5))) return true;
      if (lowerToken.includes(reversed.slice(i, i + 5))) return true;
    }
  }
  return false;
}

/**
 * Gibberish score for a single word. Tuned so real names — including Indian,
 * transliterated and all-caps ones ("Putul Yadav", "RAHUL SHARMA", "Ng Wei") —
 * score 0, while keyboard-mash bot names score well past the threshold.
 */
function tokenGibberishScore(rawToken: string): number {
  const token = rawToken.replace(/[^A-Za-z]/g, "");
  if (token.length < 5) return 0;

  let score = 0;
  if (hasKeyboardWalk(token.toLowerCase())) score += 3;

  const hasUpper = /[A-Z]/.test(token);
  const hasLower = /[a-z]/.test(token);
  const mixedCase = hasUpper && hasLower;

  const vowelCount = (token.match(/[aeiouyAEIOUY]/g) ?? []).length;

  // No vowel at all in a long word — not a word in any language we serve.
  if (vowelCount === 0) score += 3;
  else if (token.length >= 8) {
    const ratio = vowelCount / token.length;
    if (ratio < 0.15) score += 2;
    else if (ratio < 0.25) score += 1;
  }

  // Long consonant runs ("XMStNq…").
  const longestConsonantRun = Math.max(
    0,
    ...(token.match(/[^aeiouyAEIOUY]+/g) ?? []).map((r) => r.length)
  );
  if (longestConsonantRun >= 6) score += 2;
  else if (longestConsonantRun >= 5) score += 1;

  if (mixedCase) {
    // Repeated lower→UPPER flips inside one word ("petTrIGCUY"). One flip is
    // normal ("McDonald", "DeShawn"); two or more is machine output.
    const flips = (token.match(/[a-z][A-Z]/g) ?? []).length;
    if (flips >= 2) score += 2;
    // A run of capitals embedded in a mixed-case word ("…IGCUYBAB").
    if (/[A-Z]{3,}/.test(token)) score += 2;
  }

  return score;
}

/** True when a display name looks machine-generated rather than human. */
export function isGibberishName(name: string): boolean {
  const tokens = name.trim().split(/\s+/);
  if (tokens.length === 0) return false;
  const worst = Math.max(...tokens.map(tokenGibberishScore));
  return worst >= 3;
}

/**
 * Canonical form of an address, used for duplicate detection. Gmail ignores
 * dots and everything after `+`, so one bot inbox can mint infinite unique-
 * looking addresses; this collapses them back to one key.
 */
export function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0) return trimmed;
  let local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const plus = local.indexOf("+");
  if (plus > 0) local = local.slice(0, plus);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.replace(/\./g, "");
    return `${local}@gmail.com`;
  }
  return `${local}@${domain}`;
}

function allowedHosts(): Set<string> {
  const hosts = new Set<string>(["localhost", "127.0.0.1"]);
  for (const url of [clientEnv.NEXT_PUBLIC_SITE_URL, process.env.NEXTAUTH_URL, process.env.VERCEL_URL]) {
    if (!url) continue;
    try {
      hosts.add(new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, ""));
    } catch {
      /* ignore malformed env value */
    }
  }
  return hosts;
}

function originIsForeign(req: Request): boolean | null {
  const origin = req.headers.get("origin") || req.headers.get("referer");
  if (!origin) return null; // absent — scored, not an outright block
  try {
    const host = new URL(origin).hostname.replace(/^www\./, "");
    return !allowedHosts().has(host);
  } catch {
    return true;
  }
}

// ── Main entry point ───────────────────────────────────────────────────────

export function checkSpam(input: SpamCheckInput): SpamVerdict {
  const { req, body, minElapsedMs = MIN_FORM_MS } = input;
  const reasons: string[] = [];
  let score = 0;
  const bump = (n: number, why: string) => {
    score += n;
    reasons.push(why);
  };

  const fields = (body ?? {}) as Record<string, unknown>;

  // 1. Honeypot — any value at all means a machine filled a field humans can't see.
  const honeypot = fields[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    bump(10, "honeypot-filled");
  }

  // 2. Timing — the field only exists in our JS, so "missing" means the POST
  //    never went through the real form.
  const elapsed = Number(fields[ELAPSED_FIELD]);
  if (!Number.isFinite(elapsed) || elapsed <= 0) bump(10, "no-timing-token");
  else if (elapsed < minElapsedMs) bump(10, `submitted-in-${elapsed}ms`);

  // 3. Origin.
  const foreign = originIsForeign(req);
  if (foreign === true) bump(10, "foreign-origin");
  else if (foreign === null) bump(2, "missing-origin");

  // 4. Content.
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim().toLowerCase();
  const message = (input.message ?? "").trim();

  if (name && isGibberishName(name)) bump(5, "gibberish-name");
  if (name && CYRILLIC_RE.test(name)) bump(4, "cyrillic-name");

  if (email) {
    const at = email.lastIndexOf("@");
    const local = at > 0 ? email.slice(0, at) : email;
    const domain = at > 0 ? email.slice(at + 1) : "";

    if (DISPOSABLE_DOMAINS.has(domain)) bump(3, "disposable-email");

    // Gmail dot-alias abuse: "k.end.r.acl.iv.e3.5.52.565@gmail.com".
    const dots = (local.match(/\./g) ?? []).length;
    if ((domain === "gmail.com" || domain === "googlemail.com") && dots >= 4) {
      bump(4, "gmail-dot-alias-abuse");
    } else if (dots >= 5) {
      bump(2, "dot-stuffed-local-part");
    }

    if (isGibberishName(local.replace(/[._-]/g, " "))) bump(2, "gibberish-email-local");
  }

  if (message) {
    const urls = message.match(URL_RE) ?? [];
    if (urls.length >= 3) bump(5, "link-spam");
    else if (urls.length === 2) bump(3, "two-links");
    else if (urls.length === 1) bump(1, "one-link");

    if (BBCODE_RE.test(message)) bump(5, "markup-links");
    if (CYRILLIC_RE.test(message)) bump(4, "cyrillic-message");
    if (!VOWELS.test(message)) bump(3, "vowelless-message");

    const lower = message.toLowerCase();
    const hits = SPAM_KEYWORDS.filter((k) => lower.includes(k));
    if (hits.length > 0) bump(Math.min(5, 3 * hits.length), `keywords:${hits.slice(0, 3).join(",")}`);

    // URLs are long letter-soup tokens — strip them before judging prose.
    const prose = message.replace(URL_RE, " ").trim();
    if (prose.length >= 10 && prose.length < 200 && isGibberishName(prose)) {
      bump(4, "gibberish-message");
    }
  }

  return {
    blocked: score >= BLOCK_SCORE,
    suspicious: score >= SUSPICIOUS_SCORE,
    score,
    reasons,
  };
}

/**
 * Log a dropped submission at warn level. Nothing is written to the DB, so this
 * log line is the only record — keep the payload in it so a false positive can
 * still be recovered from the logs.
 */
export function logBlocked(
  endpoint: string,
  verdict: SpamVerdict,
  meta: Record<string, unknown>
) {
  logger.warn({ endpoint, score: verdict.score, reasons: verdict.reasons, ...meta }, "spam blocked");
}
