import type { Metadata } from "next";
import { englishPage } from "./english-data";
import { canonicalSeoPath } from "./room-seo-slugs";
import { localizedHref } from "./localized-path";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://huyenhotels.com").replace(/\/+$/, "");

export async function englishRouteMetadata(parts: string[]): Promise<Metadata> {
  const data = await englishPage(parts);
  if (!data) return { robots: { index: false, follow: false } };
  const path = canonicalSeoPath(data.path);
  const englishPath = localizedHref(path, "en");
  const enUrl = base + englishPath;
  const viUrl = base + (path === "/" ? "" : path);
  const { title, description } = data;
  return {
    title: title + " | Huyen's Hotels & Stays",
    description,
    alternates: { canonical: enUrl, languages: { en: enUrl, "vi-VN": viUrl, "x-default": viUrl } },
    openGraph: { title, description, url: enUrl, locale: "en_US", siteName: "Huyen's Hotels & Stays" },
    robots: { index: true, follow: true },
  };
}
