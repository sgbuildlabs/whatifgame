function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get anthropicApiKey() {
    return required("ANTHROPIC_API_KEY");
  },
  get answerModel() {
    return required("WHATIF_MODEL");
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
