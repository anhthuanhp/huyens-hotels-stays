"use client";

import { useSyncExternalStore } from "react";

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
  return useSyncExternalStore(subscribe, readLanguage, serverLanguage);
}
