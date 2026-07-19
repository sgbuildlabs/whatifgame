import { deriveImageSearchTerm } from "./searchTerm";
import { searchWikimedia } from "./wikimedia";
import { searchOpenverse } from "./openverse";
import { generateImage } from "./generate";
import type { AskImage } from "../types";

export async function pickImage(question: string, answer: string): Promise<AskImage> {
  const term = deriveImageSearchTerm(question);

  const wiki = await searchWikimedia(term);
  if (wiki) return wiki;

  const openverse = await searchOpenverse(term);
  if (openverse) return openverse;

  return generateImage(question, answer);
}
