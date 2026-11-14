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
  // Property-specific sharing image for English hotel pages.
  const rawImage = data.kind === "hotel" ? data.hotel?.image?.trim() : undefined;
  const image = rawImage
    ? /^https?:\/\//i.test(rawImage)
      ? rawImage
      : new URL(rawImage.startsWith("/") ? rawImage : `/${rawImage}`, base).toString()
    : undefined;
  return {
    title: title + " | Huyen's Hotels & Stays",
    description,
    alternates: { canonical: enUrl, languages: { en: enUrl, "vi-VN": viUrl, "x-default": viUrl } },
    openGraph: { title, description, url: enUrl, locale: "en_US", siteName: "Huyen's Hotels & Stays", ...(image ? { images: [{ url: image, alt: data.hotel?.name_en || title }] } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [image] } : {}) },
    robots: { index: true, follow: true },
  };
}
