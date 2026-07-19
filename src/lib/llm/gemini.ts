import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { env } from "../env";
import type { LlmClient, LlmUsage } from "./types";
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

function usageFromResponse(response: {
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
}): LlmUsage {
  return {
    inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
  };
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
      return {
        text: result.response.text().trim(),
        usage: usageFromResponse(result.response),
      };
    },

    async classify({ system, text }) {
      const genModel = getClient().getGenerativeModel({
        model,
        systemInstruction: system,
        generationConfig: {
          maxOutputTokens: 200,
          responseMimeType: "application/json",
          responseSchema: CLASSIFIER_RESPONSE_SCHEMA,
        },
      });

      const result = await genModel.generateContent(text);
      const usage = usageFromResponse(result.response);

      try {
        const parsed = JSON.parse(result.response.text()) as {
          safe: boolean;
          category?: string;
          reason?: string;
        };
        return { result: { safe: parsed.safe, category: parsed.category, reason: parsed.reason }, usage };
      } catch {
        return { result: { safe: false, reason: "moderation_classifier_failed" }, usage };
      }
    },
  };
}
