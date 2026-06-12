import "server-only";
import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";

const ChatbotSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, default: "general", index: true },
    embedding: { type: [Number], default: undefined },
  },
  { timestamps: true }
);

export type Chatbot = InferSchemaType<typeof ChatbotSchema> & { _id: string };
const ChatbotModel: Model<Chatbot> =
  (models.Chatbot as Model<Chatbot>) || model<Chatbot>("Chatbot", ChatbotSchema);
export default ChatbotModel;
