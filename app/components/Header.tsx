"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Language = "vi" | "en";

export default function Header() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "vi";
    }

    const savedLanguage = localStorage.getItem("huyen-language");

    return savedLanguage === "vi" || savedLanguage === "en"
      ? savedLanguage
      : "vi";
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<Language>;

      if (
        customEvent.detail === "vi" ||
        customEvent.detail === "en"
      ) {
        setLanguage(customEvent.detail);
      }
    };

    window.addEventListener(
      "language-change",
      handleLanguageChange
    );

    return () => {
      window.removeEventListener(
        "language-change",
        handleLanguageChange
      );
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [mobileMenuOpen]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);

    localStorage.setItem("huyen-language", lang);

    window.dispatchEvent(
      new CustomEvent<Language>("language-change", {
        detail: lang,
      })
    );
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isVi = language === "vi";

  return (
    <header className="absolute left-0 top-0 z-50 w-full">
      <div className="px-4 pt-0 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-1 py-2 sm:px-2">
          {/* =====================================================
              LOGO
              ===================================================== */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex shrink-0 items-center drop-shadow-lg"
            aria-label="Huyen's Hotels & Stays"
          >
            <Image
              src="/images/huyen-hotel-logo-v1.png"
              alt="Huyen's Hotels & Stays"
              width={180}
              height={60}
              priority
              className="h-auto w-[90px] sm:w-[105px] lg:w-[120px]"
            />
          </Link>

          {/* =====================================================
              DESKTOP MENU
              ===================================================== */}
          <nav
            className="hidden items-center gap-5 text-[11px] font-bold tracking-wide text-white drop-shadow-lg lg:flex xl:gap-7"
            aria-label={
              isVi
                ? "Điều hướng chính"
                : "Main navigation"
            }
          >
            <Link
              href="/"
              className="transition hover:text-white"
            >
              {isVi ? "TRANG CHỦ" : "HOME"}
            </Link>

            <Link
              href="/#hotels"
              className="transition hover:text-white"
            >
              {isVi ? "KHÁCH SẠN" : "HOTELS"}
            </Link>

            <Link
              href="/phong"
              className="transition hover:text-white"
            >
              {isVi
                ? "PHÒNG & GIÁ"
                : "ROOMS & RATES"}
            </Link>

            <Link
              href="/trai-nghiem"
              className="transition hover:text-white"
            >
              {isVi
                ? "TRẢI NGHIỆM"
                : "EXPERIENCES"}
            </Link>

            <Link
              href="/blog"
              className="transition hover:text-white"
            >
              BLOG
            </Link>

            <Link
              href="/lien-he"
              className="transition hover:text-white"
            >
              {isVi ? "LIÊN HỆ" : "CONTACT"}
            </Link>
          </nav>

          {/* =====================================================
              LANGUAGE
              ===================================================== */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              {/* VI */}
              <button
                type="button"
                onClick={() => changeLanguage("vi")}
                aria-label="Tiếng Việt"
                className={`flex items-center gap-1.5 transition ${
                  language === "vi"
                    ? "text-sm font-bold text-white"
                    : "text-xs font-normal text-white/50 hover:text-white"
                }`}
              >
                <svg
                  viewBox="0 0 28 20"
                  className={
                    language === "vi"
                      ? "h-5 w-7"
                      : "h-4 w-5"
                  }
                  aria-hidden="true"
                >
                  <rect
                    width="28"
                    height="20"
                    rx="2"
                    fill="#DA251D"
                  />

                  <path
                    d="M14 3.5L15.55 8.25H20.55L16.5 11.15L18.05 15.9L14 12.95L9.95 15.9L11.5 11.15L7.45 8.25H12.45L14 3.5Z"
                    fill="#FFDD00"
                  />
                </svg>

                <span>VI</span>
              </button>

              <span className="text-white/30">|</span>

              {/* EN */}
              <button
                type="button"
                onClick={() => changeLanguage("en")}
                aria-label="English"
                className={`flex items-center gap-1.5 transition ${
                  language === "en"
                    ? "text-sm font-bold text-white"
                    : "text-xs font-normal text-white/50 hover:text-white"
                }`}
              >
                <svg
                  viewBox="0 0 28 20"
                  className={
                    language === "en"
                      ? "h-5 w-7"
                      : "h-4 w-5"
                  }
                  aria-hidden="true"
                >
                  <rect
                    width="28"
                    height="20"
                    rx="2"
                    fill="#012169"
                  />

                  <path
                    d="M0 0L28 20M28 0L0 20"
                    stroke="#FFFFFF"
                    strokeWidth="4"
                  />

                  <path
                    d="M0 0L28 20M28 0L0 20"
                    stroke="#C8102E"
                    strokeWidth="2"
                  />

                  <path
                    d="M14 0V20M0 10H28"
                    stroke="#FFFFFF"
                    strokeWidth="6"
                  />

                  <path
                    d="M14 0V20M0 10H28"
                    stroke="#C8102E"
                    strokeWidth="3"
                  />
                </svg>

                <span>EN</span>
              </button>
            </div>

            {/* ===================================================
                MOBILE MENU BUTTON
                =================================================== */}
            <button
              ref={mobileButtonRef}
              type="button"
              onClick={() =>
                setMobileMenuOpen((value) => !value)
              }
              aria-label={
                mobileMenuOpen
                  ? "Close menu"
                  : "Open menu"
              }
              aria-expanded={mobileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-neutral-900 shadow-md transition hover:bg-neutral-100 lg:hidden"
            >
              <span className="relative block h-5 w-5">
                <span
                  className={`absolute left-0 top-1 block h-0.5 w-5 bg-neutral-900 transition ${
                    mobileMenuOpen
                      ? "translate-y-2 rotate-45"
                      : ""
                  }`}
                />

                <span
                  className={`absolute left-0 top-2.5 block h-0.5 w-5 bg-neutral-900 transition ${
                    mobileMenuOpen
                      ? "opacity-0"
                      : "opacity-100"
                  }`}
                />

                <span
                  className={`absolute left-0 top-4 block h-0.5 w-5 bg-neutral-900 transition ${
                    mobileMenuOpen
                      ? "-translate-y-1 -rotate-45"
                      : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          MOBILE MENU
          ========================================================= */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute right-4 top-[calc(100%+8px)] w-60 overflow-hidden rounded-xl border border-white/20 bg-black/85 shadow-xl backdrop-blur-md sm:right-6 lg:hidden"
        >
          <nav className="flex flex-col">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="border-b border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 hover:text-white"
            >
              {isVi ? "TRANG CHỦ" : "HOME"}
            </Link>

            <Link
              href="/#hotels"
              onClick={closeMobileMenu}
              className="border-b border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 hover:text-white"
            >
              {isVi ? "KHÁCH SẠN" : "HOTELS"}
            </Link>

            <Link
              href="/phong"
              onClick={closeMobileMenu}
              className="border-b border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 hover:text-white"
            >
              {isVi
                ? "PHÒNG & GIÁ"
                : "ROOMS & RATES"}
            </Link>

            <Link
              href="/trai-nghiem"
              onClick={closeMobileMenu}
              className="border-b border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 hover:text-white"
            >
              {isVi
                ? "TRẢI NGHIỆM"
                : "EXPERIENCES"}
            </Link>

            <Link
              href="/blog"
              onClick={closeMobileMenu}
              className="border-b border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 hover:text-white"
            >
              BLOG
            </Link>

            <Link
              href="/lien-he"
              onClick={closeMobileMenu}
              className="border-b border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 hover:text-white"
            >
              {isVi ? "LIÊN HỆ" : "CONTACT"}
            </Link>

            {/* =================================================
                MOBILE LANGUAGE
                ================================================= */}
            <div className="flex items-center gap-3 border-t border-white/10 px-5 py-3">
              <button
                type="button"
                onClick={() => changeLanguage("vi")}
                className={`flex items-center gap-2 ${
                  language === "vi"
                    ? "font-bold text-white"
                    : "text-white/50"
                }`}
              >
                <svg
                  viewBox="0 0 28 20"
                  className="h-5 w-7"
                  aria-hidden="true"
                >
                  <rect
                    width="28"
                    height="20"
                    rx="2"
                    fill="#DA251D"
                  />

                  <path
                    d="M14 3.5L15.55 8.25H20.55L16.5 11.15L18.05 15.9L14 12.95L9.95 15.9L11.5 11.15L7.45 8.25H12.45L14 3.5Z"
                    fill="#FFDD00"
                  />
                </svg>

                <span>VI</span>
              </button>

              <span className="text-white/30">|</span>

              <button
                type="button"
                onClick={() => changeLanguage("en")}
                className={`flex items-center gap-2 ${
                  language === "en"
                    ? "font-bold text-white"
                    : "text-white/50"
                }`}
              >
                <svg
                  viewBox="0 0 28 20"
                  className="h-5 w-7"
                  aria-hidden="true"
                >
                  <rect
                    width="28"
                    height="20"
                    rx="2"
                    fill="#012169"
                  />

                  <path
                    d="M0 0L28 20M28 0L0 20"
                    stroke="#FFFFFF"
                    strokeWidth="4"
                  />

                  <path
                    d="M0 0L28 20M28 0L0 20"
                    stroke="#C8102E"
                    strokeWidth="2"
                  />

                  <path
                    d="M14 0V20M0 10H28"
                    stroke="#FFFFFF"
                    strokeWidth="6"
                  />

                  <path
                    d="M14 0V20M0 10H28"
                    stroke="#C8102E"
                    strokeWidth="3"
                  />
                </svg>

                <span>EN</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}