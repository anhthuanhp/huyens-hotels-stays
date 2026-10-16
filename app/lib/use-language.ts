"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { isLocalizedPath, localizedHref } from "./localized-path";

export type Language = "vi" | "en";
let currentLanguage: Language | undefined;

function readLanguage(): Language {
  try {
    for (const key of ["huyen-language", "language"]) {
      const saved = localStorage.getItem(key);
      if (saved === "vi" || saved === "en") return saved;
    }
  } catch {
    // Fall back to memory when browser storage is unavailable.
  }
  return currentLanguage ?? "vi";
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
  const pathname = usePathname();
  const saved = useSyncExternalStore(subscribe, readLanguage, serverLanguage);
  return /^\/en(?:\/|$)/.test(pathname || "") ? "en" : saved;
}

export function changeSiteLanguage(language: Language) {
  setLanguage(language);
  const current = window.location.pathname;
  const base = current.replace(/^\/en(?=\/|$)/, "") || "/";
  if (!isLocalizedPath(base)) return;
  const target = language === "en" ? localizedHref(base, "en") : base;
  if (target !== current) window.location.assign(target + window.location.search + window.location.hash);
}
