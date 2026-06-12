/* eslint-disable no-console */
import "server-only";
import pino from "pino";

/**
 * Structured logger — pretty-prints synchronously in dev (no worker threads, 100% stable during HMR),
 * JSON in production (fastest for Vercel/Render).
 */
export const logger = process.env.NODE_ENV === "production"
  ? pino({
      level: process.env.LOG_LEVEL || "info",
    })
  : {
      info: (msg: unknown, ...args: unknown[]) => {
        const text = typeof msg === "object" ? JSON.stringify(msg, null, 2) : msg;
        console.log(`\x1b[32m[INFO]\x1b[0m ${text}`, ...args);
      },
      debug: (msg: unknown, ...args: unknown[]) => {
        const text = typeof msg === "object" ? JSON.stringify(msg, null, 2) : msg;
        console.log(`\x1b[36m[DEBUG]\x1b[0m ${text}`, ...args);
      },
      warn: (msg: unknown, ...args: unknown[]) => {
        const text = typeof msg === "object" ? JSON.stringify(msg, null, 2) : msg;
        console.warn(`\x1b[33m[WARN]\x1b[0m ${text}`, ...args);
      },
      error: (msg: unknown, ...args: unknown[]) => {
        const text = typeof msg === "object" ? JSON.stringify(msg, null, 2) : msg;
        console.error(`\x1b[31m[ERROR]\x1b[0m ${text}`, ...args);
      },
      fatal: (msg: unknown, ...args: unknown[]) => {
        const text = typeof msg === "object" ? JSON.stringify(msg, null, 2) : msg;
        console.error(`\x1b[35m[FATAL]\x1b[0m ${text}`, ...args);
      },
      trace: (msg: unknown, ...args: unknown[]) => {
        const text = typeof msg === "object" ? JSON.stringify(msg, null, 2) : msg;
        console.log(`\x1b[90m[TRACE]\x1b[0m ${text}`, ...args);
      },
    } as unknown as pino.Logger;

