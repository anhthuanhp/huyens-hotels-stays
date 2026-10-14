"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Language = "vi" | "en";
type BackLink = { href: string; label: string };

function getBackLink(pathname: string, language: Language): BackLink {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "khach-san" && segments[2] === "phong") {
    return {
      href: `/khach-san/${segments[1]}`,
      label: language === "vi" ? "Quay lại khách sạn" : "Back to hotel",
    };
  }

  if (segments[0] === "khach-san" && segments[1]) {
    return {
      href: "/#hotels",
      label: language === "vi" ? "Quay về trang chủ" : "Back to home",
    };
  }

  if (segments[0] === "blog" && segments[1]) {
    return {
      href: "/blog",
      label: language === "vi" ? "Quay lại Blog" : "Back to Blog",
    };
  }

  if (segments[0] === "tim-phong" || segments[0] === "dat-phong") {
    return {
      href: "/#booking-search",
      label: language === "vi" ? "Quay lại" : "Go back",
    };
  }

  return {
    href: "/",
    label: language === "vi" ? "Quay về trang chủ" : "Back to home",
  };
}

function VietnamFlag() {
  return (
    <svg
      viewBox="0 0 30 20"
      className="h-[13px] w-[19px] shrink-0 rounded-[2px] shadow-sm"
      aria-hidden="true"
    >
      <rect width="30" height="20" fill="#DA251D" />
      <path
        d="M15 3.5 17.1 9h5.8l-4.7 3.4 1.8 5.6-5-3.5-5 3.5 1.8-5.6L7.1 9h5.8z"
        fill="#FFDD00"
      />
    </svg>
  );
}

function UKFlag() {
  return (
    <svg
      viewBox="0 0 30 20"
      className="h-[13px] w-[19px] shrink-0 rounded-[2px] shadow-sm"
      aria-hidden="true"
    >
      <rect width="30" height="20" fill="#012169" />
      <path
        d="M0 0 30 20 M30 0 0 20"
        stroke="#FFFFFF"
        strokeWidth="4"
      />
      <path
        d="M0 0 30 20 M30 0 0 20"
        stroke="#C8102E"
        strokeWidth="1.5"
      />
      <path d="M15 0v20 M0 10h30" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M15 0v20 M0 10h30" stroke="#C8102E" strokeWidth="3" />
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [language, setLanguage] = useState<Language>("vi");

  useEffect(() => {
    const syncLanguage = (event?: Event) => {
      const detail = (event as CustomEvent<Language> | undefined)?.detail;
      const stored = window.localStorage.getItem("huyen-language");
      const next = detail === "vi" || detail === "en" ? detail : stored;

      if (next === "vi" || next === "en") {
        setLanguage(next);
      }
    };

    syncLanguage();

    window.addEventListener("language-change", syncLanguage);

    return () => {
      window.removeEventListener("language-change", syncLanguage);
    };
  }, []);

  if (
    pathname === "/" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  ) {
    return null;
  }

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    window.localStorage.setItem("huyen-language", nextLanguage);
    window.dispatchEvent(
      new CustomEvent("language-change", { detail: nextLanguage }),
    );
  }

  const back = getBackLink(pathname, language);

  return (
    <header data-public-site className="relative z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Huyen's Hotels & Stays"
          className="flex shrink-0 items-center"
        >
          <Image
            src="/images/huyens-hotels-stays-logo.webp"
            alt="Huyen's Hotels & Stays"
            width={180}
            height={60}
            priority
            className="h-auto w-[90px] sm:w-[105px] lg:w-[120px]"
          />
        </Link>

        <div className="flex min-w-0 items-center gap-2 sm:gap-5">
          <Link
            href={back.href}
            className="inline-flex min-h-12 items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 sm:gap-2 sm:text-sm"
          >
            <span aria-hidden="true">←</span>
            <span className="sm:hidden">{language === "vi" ? "Quay lại" : "Back"}</span>
            <span className="hidden sm:inline">{back.label}</span>
          </Link>

          <nav
            aria-label="Language selection"
            className="flex shrink-0 items-center gap-2 text-sm sm:gap-3"
          >
            <button
              type="button"
              onClick={() => changeLanguage("vi")}
              aria-pressed={language === "vi"}
              className={`inline-flex min-h-12 min-w-12 items-center justify-center gap-1.5 transition sm:gap-2 ${
                language === "vi"
                  ? "font-semibold text-sky-600"
                  : "font-medium text-slate-400 hover:text-slate-700"
              }`}
            >
              <VietnamFlag />
              <span>VI</span>
            </button>

            <span
              aria-hidden="true"
              className="select-none text-slate-300"
            >
              |
            </span>

            <button
              type="button"
              onClick={() => changeLanguage("en")}
              aria-pressed={language === "en"}
              className={`inline-flex min-h-12 items-center gap-1.5 transition sm:gap-2 ${
                language === "en"
                  ? "font-semibold text-sky-600"
                  : "font-medium text-slate-400 hover:text-slate-700"
              }`}
            >
              <UKFlag />
              <span>EN</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}