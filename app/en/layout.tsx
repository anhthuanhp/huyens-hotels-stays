import { RouteLanguage } from "../lib/use-language";

// Reuse the exact Vietnamese design tree; only the translation source changes.
export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <RouteLanguage language="en"><div lang="en">{children}</div></RouteLanguage>;
}
