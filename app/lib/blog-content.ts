export type BlogBlock = { type: "heading" | "paragraph"; text: string };
export function parseBlogContent(content: string): BlogBlock[] {
  return content.replace(/\r\n/g, "\n").replace(/\\n/g, "\n").split(/\n\s*\n/).map(text => text.trim()).filter(Boolean).map(text => ({
    type: /^#{2,3}\s+/.test(text) || (text.length <= 100 && !text.includes("\n") && !/https?:\/\//.test(text) && !/[.!…]$/.test(text)) ? "heading" : "paragraph",
    text: text.replace(/^#{2,3}\s+/, ""),
  }));
}
export function splitBlogLinks(text: string) {
  return text.split(/(https?:\/\/[^\s<>]+)/g).filter(Boolean).map(part => {
    if (!/^https?:\/\//.test(part)) return { text: part };
    const href = part.replace(/[.,;!?)]*$/, "");
    try { const url = new URL(href);
      if (url.protocol !== "https:" && url.protocol !== "http:") return { text: part };
      return { text: href, href, suffix: part.slice(href.length) };
    } catch { return { text: part }; }
  });
}
