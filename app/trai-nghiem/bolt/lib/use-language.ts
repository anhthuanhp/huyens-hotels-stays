import { useLanguage as useSiteLanguage } from "@/app/lib/use-language";

export type Language = "vi" | "en";
export function useLanguage(): { language: Language } {
  return { language: useSiteLanguage() };
}
