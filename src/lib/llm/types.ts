import type { ModerationResult } from "../types";

export interface LlmUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface LlmClient {
  generateText(params: {
    system: string;
    prompt: string;
    maxTokens: number;
  }): Promise<{ text: string; usage: LlmUsage }>;

  classify(params: {
    system: string;
    text: string;
  }): Promise<{ result: ModerationResult; usage: LlmUsage }>;
}
