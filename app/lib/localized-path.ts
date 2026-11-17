export const supportPaths = [
  "/cau-hoi-thuong-gap",
  "/huong-dan-dat-phong",
  "/huong-dan-thanh-toan",
];

export const localizedInformationPaths = ["/trai-nghiem", "/lien-he"] as const;

export function isLocalizedInformationPath(pathname: string) {
  return localizedInformationPaths.some(path => path === pathname);
}

export function isLocalizedPath(pathname: string) {
  return supportPaths.includes(pathname) || isLocalizedInformationPath(pathname) || pathname === "/" || pathname === "/phong" || pathname === "/blog" || pathname === "/tim-phong" || pathname === "/dat-phong" || /^\/blog\/[^/]+$/.test(pathname) || /^\/khach-san\/[^/]+(?:\/phong\/[^/]+)?$/.test(pathname);
}
export function localizedHref(href: string, language: "vi" | "en") {
  if (language !== "en" || !href.startsWith("/") || href.startsWith("//") || /^\/en(?:[/?#]|$)/.test(href)) return href;
  const pathname = href.split(/[?#]/, 1)[0];
  return isLocalizedPath(pathname) ? "/en" + (pathname === "/" ? href.slice(1) : href) : href;
}
export function languageAlternates(path: string, origin = "https://huyenhotels.com") {
  const vi = origin.replace(/\/$/, "") + (path === "/" ? "" : path);
  // The root URL has a distinct English counterpart at /en.
  if (!isLocalizedPath(path)) return { canonical: vi, languages: { "vi-VN": vi, "x-default": vi } };
  return { canonical: vi, languages: { "vi-VN": vi, en: origin.replace(/\/$/, "") + localizedHref(path, "en"), "x-default": vi } };
}
