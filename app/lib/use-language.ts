"use client";

import { createContext, createElement, useContext, useSyncExternalStore, type ReactNode } from "react";

export type Language = "vi" | "en";
let currentLanguage: Language | undefined;
const RouteLanguageContext = createContext<Language | null>(null);

export function RouteLanguage({ language, children }: { language: Language; children: ReactNode }) {
  return createElement(RouteLanguageContext.Provider, { value: language }, children);
}

function readLanguage(): Language {
  if (currentLanguage) return currentLanguage;
  // Always start on the requested language for indexed English paths.
  if (typeof window !== "undefined" && /^\/en(?:\/|$)/.test(window.location.pathname)) return "en";
  try {
    for (const key of ["huyen-language", "language"]) {
      const saved = localStorage.getItem(key);
      if (saved === "vi" || saved === "en") return saved;
    }
  } catch {
    // Fall back to memory when browser storage is unavailable.
  }
  return "vi";
}

function subscribe(onChange: () => void) {
  const handleChange = (event: Event) => {
    const detail: unknown = (event as CustomEvent<unknown>).detail;
    currentLanguage = detail === "vi" || detail === "en" ? detail : undefined;
    if (currentLanguage) persistLanguage(currentLanguage);
    onChange();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === "huyen-language" || event.key === "language") {
      currentLanguage = undefined;
      onChange();
    }
  };
  window.addEventListener("language-change", handleChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener("language-change", handleChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function persistLanguage(language: Language) {
  try {
    localStorage.setItem("huyen-language", language);
    localStorage.setItem("language", language);
  } catch {
    // Keep switching languages when browser storage is unavailable.
  }
}

export function setLanguage(language: Language) {
  currentLanguage = language;
  persistLanguage(language);
  window.dispatchEvent(new CustomEvent("language-change", { detail: language }));
}

const serverLanguage = (): Language => "vi";

export function useLanguage() {
  const routeLanguage = useContext(RouteLanguageContext);
  const saved = useSyncExternalStore(subscribe, readLanguage, () => routeLanguage ?? serverLanguage());
  return saved;
}

/*
 * Đổi ngôn ngữ ngay trên trang đang xem bằng state dùng chung.
 * Không điều hướng, không đổi pathname/query/hash, không reload:
 * Header, SiteHeader và các nút VI/EN khác đều gọi hàm này.
 */
export function changeSiteLanguage(language: Language) {
  setLanguage(language);
}
