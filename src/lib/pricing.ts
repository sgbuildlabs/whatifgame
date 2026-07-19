import type { LlmUsage } from "./llm/types";

interface ModelPricing {
  inputPerMillion: number; // USD per 1M input tokens
  outputPerMillion: number; // USD per 1M output tokens
}

// Best-effort published pricing for models this app is likely to be
// configured with. Used only to enforce the cost-based rate limit, not for
// billing - an unrecognized model falls back to a conservative estimate.
const PRICING: Record<string, ModelPricing> = {
  "claude-opus-4-8": { inputPerMillion: 15, outputPerMillion: 75 },
  "claude-sonnet-5": { inputPerMillion: 3, outputPerMillion: 15 },
  "claude-haiku-4-5": { inputPerMillion: 0.8, outputPerMillion: 4 },
  "gemini-2.0-flash": { inputPerMillion: 0.1, outputPerMillion: 0.4 },
  "gemini-1.5-flash": { inputPerMillion: 0.075, outputPerMillion: 0.3 },
  "gemini-1.5-pro": { inputPerMillion: 1.25, outputPerMillion: 5 },
};

const FALLBACK_PRICING: ModelPricing = { inputPerMillion: 5, outputPerMillion: 20 };

export function computeCostCents(model: string, usage: LlmUsage): number {
  const pricing = PRICING[model] ?? FALLBACK_PRICING;
  const dollars =
    (usage.inputTokens / 1_000_000) * pricing.inputPerMillion +
    (usage.outputTokens / 1_000_000) * pricing.outputPerMillion;
  return dollars * 100;
}
