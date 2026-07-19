import type { LlmProvider } from "../env";
import type { LlmClient } from "./types";
import { createAnthropicClient } from "./anthropic";
import { createGeminiClient } from "./gemini";

const cache = new Map<string, LlmClient>();

export function getLlmClient(provider: LlmProvider, model: string): LlmClient {
  const key = `${provider}:${model}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const client =
    provider === "gemini" ? createGeminiClient(model) : createAnthropicClient(model);
  cache.set(key, client);
  return client;
}
