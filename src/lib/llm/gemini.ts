import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { env } from "../env";
import type { ModerationResult } from "../types";
import type { LlmClient } from "./types";
import { SAFETY_CATEGORIES } from "./classifierSchema";

const CLASSIFIER_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    safe: { type: SchemaType.BOOLEAN },
    category: { type: SchemaType.STRING, format: "enum", enum: [...SAFETY_CATEGORIES] },
    reason: { type: SchemaType.STRING },
  },
  required: ["safe", "category"],
};

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(env.geminiApiKey);
  }
  return client;
}

export function createGeminiClient(model: string): LlmClient {
  return {
    async generateText({ system, prompt, maxTokens }) {
      const genModel = getClient().getGenerativeModel({
        model,
        systemInstruction: system,
        generationConfig: { maxOutputTokens: maxTokens },
      });
      const result = await genModel.generateContent(prompt);
      return result.response.text().trim();
    },

    async classify({ system, text }): Promise<ModerationResult> {
      const genModel = getClient().getGenerativeModel({
        model,
        systemInstruction: system,
        generationConfig: {
          maxOutputTokens: 200,
          responseMimeType: "application/json",
          responseSchema: CLASSIFIER_RESPONSE_SCHEMA,
        },
      });

      try {
        const result = await genModel.generateContent(text);
        const parsed = JSON.parse(result.response.text()) as {
          safe: boolean;
          category?: string;
          reason?: string;
        };
        return { safe: parsed.safe, category: parsed.category, reason: parsed.reason };
      } catch {
        return { safe: false, reason: "moderation_classifier_failed" };
      }
    },
  };
}
