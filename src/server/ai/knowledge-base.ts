import "server-only";
import { connectDB } from "@/server/db/mongodb";
import Chatbot from "@/server/models/Chatbot";

/**
 * Lightweight RAG lookup against the Chatbot KB collection.
 *
 * Strategy (good enough for our scale; no embeddings yet):
 *   1. Tokenise the user's message — keep alpha words of length 4+
 *      (drops "the", "is", "and", "what", etc. without a stop-word list).
 *   2. Build a case-insensitive regex OR-clause for title + content.
 *   3. Return up to 4 docs ranked by how many distinct tokens they hit.
 *
 * Returns an empty array if no DB or no matches — the route then asks Gemini
 * with an empty KB context.
 */

const MAX_TOKENS = 8;
const MAX_RESULTS = 4;

interface KbDoc {
  title: string;
  content: string;
  category: string;
}

export async function lookupKnowledge(message: string): Promise<KbDoc[]> {
  const tokens = extractTokens(message);
  if (tokens.length === 0) return [];

  try {
    await connectDB();
  } catch {
    return [];
  }

  const regexes = tokens.map((t) => new RegExp(escapeRegex(t), "i"));
  const orClauses = regexes.flatMap((r) => [{ title: r }, { content: r }]);

  const candidates = await Chatbot.find({ $or: orClauses })
    .select("title content category")
    .limit(20)
    .lean()
    .catch(() => [] as KbDoc[]);

  if (candidates.length === 0) return [];

  // Re-rank by distinct-token hit count, then by title length (shorter ≈ more specific)
  return candidates
    .map((doc) => {
      const hits = regexes.reduce((n, r) => (r.test(doc.title) || r.test(doc.content) ? n + 1 : n), 0);
      return { doc, hits };
    })
    .sort((a, b) => b.hits - a.hits || a.doc.title.length - b.doc.title.length)
    .slice(0, MAX_RESULTS)
    .map(({ doc }) => ({
      title: doc.title,
      content: doc.content,
      category: doc.category ?? "general",
    }));
}

function extractTokens(message: string): string[] {
  const matches = message.toLowerCase().match(/[a-z][a-z']{3,}/g) ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const token of matches) {
    if (seen.has(token)) continue;
    seen.add(token);
    out.push(token);
    if (out.length >= MAX_TOKENS) break;
  }
  return out;
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Format a list of KB docs for inclusion inside the Gemini system prompt.
 * Returns an empty string when no docs — the prompt template handles that gracefully.
 */
export function formatKbContext(docs: KbDoc[]): string {
  if (docs.length === 0) return "(no relevant KB documents found)";
  return docs
    .map((d, i) => `[${i + 1}] ${d.title} (${d.category})\n${d.content}`)
    .join("\n\n");
}
