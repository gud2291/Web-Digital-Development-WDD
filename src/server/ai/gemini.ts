import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/server/utils/logger";

/**
 * Lazy Gemini client. We construct on first use so that build-time page-data
 * collection doesn't blow up when GEMINI_API_KEY is absent. The route handler
 * surfaces a friendly error to the user if generation throws.
 */

const MODEL_ID = "gemini-2.0-flash";

let _client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (_client) return _client;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  _client = new GoogleGenerativeAI(key);
  return _client;
}

export interface GenerateInput {
  systemPrompt: string;
  userMessage: string;
}

/**
 * Single-shot generation. Returns the assistant's text response.
 * Throws on network / auth / quota errors — caller decides how to surface.
 */
export async function generateAnswer({ systemPrompt, userMessage }: GenerateInput): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: MODEL_ID,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.6,
      topP: 0.9,
      maxOutputTokens: 600,
    },
  });

  const result = await model.generateContent(userMessage);
  const text = result.response.text().trim();
  if (!text) {
    throw new Error("Empty response from model");
  }
  return text;
}

/**
 * Streaming generation — async generator yielding text chunks as they arrive.
 * Available for future SSE/streaming routes; not used by the current handler
 * (the UI does a fake character-by-character "typing" effect on the client).
 */
export async function* streamAnswer({ systemPrompt, userMessage }: GenerateInput): AsyncGenerator<string> {
  const model = getClient().getGenerativeModel({
    model: MODEL_ID,
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.6, topP: 0.9, maxOutputTokens: 600 },
  });

  try {
    const stream = await model.generateContentStream(userMessage);
    for await (const chunk of stream.stream) {
      const piece = chunk.text();
      if (piece) yield piece;
    }
  } catch (err) {
    logger.error({ err }, "gemini stream failure");
    throw err;
  }
}
