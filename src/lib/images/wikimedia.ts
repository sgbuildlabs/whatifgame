import type { AskImage } from "../types";

const MIN_DIMENSION = 300;

export async function searchWikimedia(term: string): Promise<AskImage | null> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrsearch", `${term} filetype:bitmap`);
  url.searchParams.set("gsrlimit", "5");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|extmetadata|size");
  url.searchParams.set("origin", "*");

  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "WhatIfGame/1.0 (kids education app)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;

    for (const page of Object.values(pages) as Array<{
      imageinfo?: Array<{
        url?: string;
        width?: number;
        height?: number;
        mime?: string;
        extmetadata?: { Artist?: { value?: string }; LicenseShortName?: { value?: string } };
      }>;
    }>) {
      const info = page.imageinfo?.[0];
      if (!info?.url) continue;
      if ((info.width ?? 0) < MIN_DIMENSION || (info.height ?? 0) < MIN_DIMENSION) continue;

      if (info.mime && !info.mime.startsWith("image/")) continue;

      const artist = info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, "");
      const licenseShort = info.extmetadata?.LicenseShortName?.value;
      const attribution = [artist, licenseShort].filter(Boolean).join(" - ") || "Wikimedia Commons";

      return { url: info.url, source: "wikimedia", attribution };
    }
    return null;
  } catch {
    return null;
  }
}
