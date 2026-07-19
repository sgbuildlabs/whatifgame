import { env } from "../env";
import type { AskImage } from "../types";

// A bundled, always-available bright illustration used when no AI image
// provider is configured, or the provider call fails. Keeps the pipeline
// from ever showing a broken image to a kid. Free - no cost.
const FALLBACK_IMAGE: AskImage = {
  url: "/placeholder-illustration.svg",
  source: "generated",
};

function buildPrompt(question: string, answer: string): string {
  return (
    `A bright, colorful, friendly cartoon illustration for a children's educational app, ` +
    `depicting: "what if ${question}". Inspired by this real explanation: ${answer.slice(0, 300)}. ` +
    `Style: cheerful, whimsical, storybook illustration, bright cheerful colors, no text, no violence, no scary imagery.`
  );
}

async function generateWithOpenAI(prompt: string): Promise<AskImage | null> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.imageApiKey}`,
    },
    body: JSON.stringify({
      model: env.imageModel || "gpt-image-1",
      prompt,
      size: "1024x1024",
      n: 1,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const item = data?.data?.[0];
  const url: string | undefined = item?.url;
  const b64: string | undefined = item?.b64_json;
  if (url) return { url, source: "generated" };
  if (b64) return { url: `data:image/png;base64,${b64}`, source: "generated" };
  return null;
}

export async function generateImage(
  question: string,
  answer: string
): Promise<{ image: AskImage; costCents: number }> {
  if (!env.imageProvider || !env.imageApiKey) {
    return { image: FALLBACK_IMAGE, costCents: 0 };
  }

  const prompt = buildPrompt(question, answer);

  try {
    switch (env.imageProvider) {
      case "openai": {
        const result = await generateWithOpenAI(prompt);
        return result
          ? { image: result, costCents: env.imageGenerationCostCents }
          : { image: FALLBACK_IMAGE, costCents: 0 };
      }
      default:
        return { image: FALLBACK_IMAGE, costCents: 0 };
    }
  } catch {
    return { image: FALLBACK_IMAGE, costCents: 0 };
  }
}
