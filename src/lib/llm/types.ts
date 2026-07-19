import type { ModerationResult } from "../types";

export interface LlmClient {
  generateText(params: { system: string; prompt: string; maxTokens: number }): Promise<string>;
  classify(params: { system: string; text: string }): Promise<ModerationResult>;
}
