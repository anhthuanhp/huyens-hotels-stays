import type { Metadata } from "next";
import { englishPage } from "./english-data";
import { canonicalSeoPath } from "./room-seo-slugs";
import { localizedHref } from "./localized-path";
import { DEFAULT_SHARE_IMAGE, SITE_NAME } from "./seo";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://huyenhotels.com").replace(/\/+$/, "");

export async function englishRouteMetadata(parts: string[]): Promise<Metadata> {
  const data = await englishPage(parts);
  if (!data) return { robots: { index: false, follow: false } };
  const path = canonicalSeoPath(data.path);
  const englishPath = localizedHref(path, "en");
  const enUrl = base + englishPath;
  const viUrl = base + (path === "/" ? "" : path);
  const { description } = data;
  const title = data.title;
  const image = data.post?.image?.trim() || data.room?.image?.trim() || data.hotel?.image?.trim() || DEFAULT_SHARE_IMAGE;
  const social = { title, description, url: enUrl, locale: "en_US", siteName: SITE_NAME, images: [{ url: new URL(image, base).href, alt: data.title }] };
  return {
    title,
    description,
    alternates: { canonical: enUrl, languages: { en: enUrl, "vi-VN": viUrl, "x-default": viUrl } },
    openGraph: data.kind === "article" ? { ...social, type: "article" } : { ...social, type: "website" },
    twitter: { card: "summary_large_image", title, description, images: social.images },
    robots: { index: true, follow: true },
  };
}
