export function isLocalizedPath(pathname: string) {
  return pathname === "/" || pathname === "/phong" || pathname === "/blog" || pathname === "/tim-phong" || pathname === "/dat-phong" || /^\/blog\/[^/]+$/.test(pathname) || /^\/khach-san\/[^/]+(?:\/phong\/[^/]+)?$/.test(pathname);
}
export function localizedHref(href: string, language: "vi" | "en") {
  if (language !== "en" || !href.startsWith("/") || href.startsWith("//") || /^\/en(?:[/?#]|$)/.test(href)) return href;
  const pathname = href.split(/[?#]/, 1)[0];
  return isLocalizedPath(pathname) ? "/en" + (href === "/" ? "" : href) : href;
}
export function languageAlternates(path: string, origin = "https://huyenhotels.com") {
  const vi = origin.replace(/\/$/, "") + (path === "/" ? "" : path);
  return { canonical: vi, languages: { "vi-VN": vi, en: origin.replace(/\/$/, "") + localizedHref(path, "en"), "x-default": vi } };
}
