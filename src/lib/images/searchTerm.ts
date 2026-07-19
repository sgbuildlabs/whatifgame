const STOPWORDS = new Set([
  "what", "if", "the", "a", "an", "is", "are", "was", "were", "would",
  "could", "will", "to", "of", "in", "on", "at", "and", "or", "but",
  "for", "with", "did", "do", "does", "we", "you", "i", "it", "its",
  "there", "never", "ever", "all", "no", "not", "so", "really", "then",
]);

export function deriveImageSearchTerm(question: string): string {
  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));

  const term = words.slice(0, 4).join(" ").trim();
  return term || question.trim();
}
