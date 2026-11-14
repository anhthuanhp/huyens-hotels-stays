import { localizedHref } from "./localized-path";
import { canonicalSeoPath } from "./room-seo-slugs";

export type BlogBlock = { type: "heading" | "paragraph"; text: string };
export function parseBlogContent(content: string): BlogBlock[] {
  return content.replace(/\r\n/g, "\n").replace(/\\r\\n|\\n/g, "\n").split(/\n\s*\n/).map(text => text.trim()).filter(Boolean).map(text => ({
    type: /^#{2,3}\s+/.test(text) || (text.length <= 100 && !text.includes("\n") && !splitBlogLinks(text).some(part => part.href) && !/[.!…]$/.test(text)) ? "heading" : "paragraph",
    text: text.replace(/^#{2,3}\s+/, ""),
  }));
}
export function splitBlogLinks(text: string) {
  return text.split(/(https?:\/\/[^\s<>]+|(?<![\w/:])\/[a-z][\w%-]*(?:[/?#][^\s<>]*)?)/gi).filter(Boolean).map(part => {
    if (!/^https?:\/\/|^\/[a-z]/i.test(part)) return { text: part };
    const href = part.replace(/[.,;!?)]*$/, "");
    if (href.startsWith("/")) return { text: href, href, suffix: part.slice(href.length) };
    try { const url = new URL(href);
      if (url.protocol !== "https:" && url.protocol !== "http:") return { text: part };
      return { text: href, href, suffix: part.slice(href.length) };
    } catch { return { text: part }; }
  });
}

export function englishBlogHref(href: string, translatedPaths: readonly string[], siteUrl: string) {
  try {
    const site = new URL(siteUrl);
    const url = new URL(href, site);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return href;
    if (![site.host, "www.huyenhotels.com", "huyenhotels.com"].includes(url.host)) return href;
    const path = canonicalSeoPath(url.pathname.replace(/\/+$/, "") || "/");
    if (!translatedPaths.includes(path) && path !== "/tim-phong" && path !== "/dat-phong") return href;
    return localizedHref(path, "en") + url.search + url.hash;
  } catch {
    return href;
  }
}
