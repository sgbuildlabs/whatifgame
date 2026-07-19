function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export type LlmProvider = "anthropic" | "gemini";

function parseProvider(name: string, value: string | undefined): LlmProvider | undefined {
  if (!value) return undefined;
  if (value === "anthropic" || value === "gemini") return value;
  throw new Error(`Invalid ${name}: "${value}" (expected "anthropic" or "gemini")`);
}

export const env = {
  get anthropicApiKey() {
    return required("ANTHROPIC_API_KEY");
  },
  get geminiApiKey() {
    return required("GEMINI_API_KEY");
  },
  get answerProvider(): LlmProvider {
    return parseProvider("WHATIF_PROVIDER", process.env.WHATIF_PROVIDER) ?? "anthropic";
  },
  get answerModel() {
    return required("WHATIF_MODEL");
  },
  get moderationProvider(): LlmProvider {
    return parseProvider("WHATIF_MODERATION_PROVIDER", process.env.WHATIF_MODERATION_PROVIDER) ?? this.answerProvider;
  },
  get moderationModel() {
    return process.env.WHATIF_MODERATION_MODEL || required("WHATIF_MODEL");
  },
  get openverseApiKey() {
    return process.env.OPENVERSE_API_KEY || undefined;
  },
  get imageProvider() {
    return process.env.WHATIF_IMAGE_PROVIDER || undefined;
  },
  get imageModel() {
    return process.env.WHATIF_IMAGE_MODEL || undefined;
  },
  get imageApiKey() {
    return process.env.WHATIF_IMAGE_API_KEY || undefined;
  },
};
