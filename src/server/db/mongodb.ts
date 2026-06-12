import "server-only";
import mongoose from "mongoose";
import { serverEnv } from "@/config/env";

/**
 * MongoDB connection — pooled, cached across hot reloads in dev.
 * Uses Mongoose's global connection so we never open multiple connections
 * in a serverless environment.
 */

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const cached = global.__mongoose ?? { conn: null, promise: null };
global.__mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(serverEnv.MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      .then((m) => {
        // eslint-disable-next-line no-console
        console.log("[mongodb] connected");
        return m;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
