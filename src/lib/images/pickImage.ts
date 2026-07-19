import { deriveImageSearchTerm } from "./searchTerm";
import { searchWikimedia } from "./wikimedia";
import { searchOpenverse } from "./openverse";
import { generateImage } from "./generate";
import type { AskImage } from "../types";

export async function pickImage(
  question: string,
  answer: string
): Promise<{ image: AskImage; costCents: number }> {
  const term = deriveImageSearchTerm(question);

  const wiki = await searchWikimedia(term);
  if (wiki) return { image: wiki, costCents: 0 };

  const openverse = await searchOpenverse(term);
  if (openverse) return { image: openverse, costCents: 0 };

  return generateImage(question, answer);
}
