import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env";
import type { LlmClient, LlmUsage } from "./types";
import { SAFETY_CATEGORIES } from "./classifierSchema";

const CLASSIFIER_TOOL = {
  name: "content_safety_classification",
  description: "Classify text for kid safety.",
  input_schema: {
    type: "object" as const,
    properties: {
      safe: { type: "boolean" as const },
      category: { type: "string" as const, enum: [...SAFETY_CATEGORIES] },
      reason: { type: "string" as const },
    },
    required: ["safe", "category"],
  },
};

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: env.anthropicApiKey });
  }
  return client;
}

function textFromMessage(message: Anthropic.Messages.Message): string {
  return message.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

function usageFromMessage(message: Anthropic.Messages.Message): LlmUsage {
  return {
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  };
}

export function createAnthropicClient(model: string): LlmClient {
  return {
    async generateText({ system, prompt, maxTokens }) {
      const message = await getClient().messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }],
      });
      return { text: textFromMessage(message).trim(), usage: usageFromMessage(message) };
    },

    async classify({ system, text }) {
      const message = await getClient().messages.create({
        model,
        max_tokens: 200,
        system,
        messages: [{ role: "user", content: text }],
        tools: [CLASSIFIER_TOOL],
        tool_choice: { type: "tool", name: CLASSIFIER_TOOL.name },
      });

      const usage = usageFromMessage(message);
      const toolUse = message.content.find(
        (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use"
      );

      if (!toolUse) {
        return { result: { safe: false, reason: "moderation_classifier_failed" }, usage };
      }

      const input = toolUse.input as { safe: boolean; category?: string; reason?: string };
      return {
        result: { safe: input.safe, category: input.category, reason: input.reason },
        usage,
      };
    },
  };
}
