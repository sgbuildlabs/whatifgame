import { env } from "../env";
import type { AskImage } from "../types";

const MIN_DIMENSION = 300;

interface OpenverseResult {
  mature?: boolean;
  width?: number;
  height?: number;
  url?: string;
  title?: string;
  creator?: string;
  license?: string;
}

export async function searchOpenverse(term: string): Promise<AskImage | null> {
  const url = new URL("https://api.openverse.org/v1/images/");
  url.searchParams.set("q", term);
  url.searchParams.set("license_type", "commercial,modification");
  url.searchParams.set("mature", "false");
  url.searchParams.set("page_size", "5");

  try {
    const headers: Record<string, string> = {};
    if (env.openverseApiKey) {
      headers.Authorization = `Bearer ${env.openverseApiKey}`;
    }
    const res = await fetch(url.toString(), { headers });
    if (!res.ok) return null;
    const data = await res.json();
    const results: OpenverseResult[] = data?.results ?? [];

    for (const result of results) {
      if (result.mature) continue;
      if (result.width && result.width < MIN_DIMENSION) continue;
      if (result.height && result.height < MIN_DIMENSION) continue;
      if (!result.url) continue;

      const attribution = [result.title, result.creator ? `by ${result.creator}` : null, result.license]
        .filter(Boolean)
        .join(" ");

      return { url: result.url, source: "openverse", attribution: attribution || "Openverse" };
    }
    return null;
  } catch {
    return null;
  }
}
