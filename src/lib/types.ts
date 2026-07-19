export type ImageSource = "wikimedia" | "openverse" | "generated";

export interface AskImage {
  url: string;
  source: ImageSource;
  attribution?: string;
}

export type AskResponse =
  | { status: "ok"; question: string; answer: string; image: AskImage }
  | { status: "unsafe"; message: string }
  | { status: "error"; message: string };

export interface ModerationResult {
  safe: boolean;
  category?: string;
  reason?: string;
}
