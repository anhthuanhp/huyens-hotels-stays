"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Language = "vi" | "en";

export default function Header() {
  const [language, setLanguage] = useState<Language>("vi");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");

    if (savedLanguage === "vi" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }

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

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);

    localStorage.setItem("language", lang);

    window.dispatchEvent(
      new CustomEvent<Language>("language-change", {
        detail: lang,
      })
    );
  };

  const isVi = language === "vi";

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="absolute left-0 top-0 z-50 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
        {/* =====================================================
            LOGO
            ===================================================== */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex flex-col leading-none"
        >
          <span className="text-xl font-semibold tracking-tight text-white">
            Huyen&apos;s
          </span>

          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.22em] text-white/80">
            Hotels &amp; Stays
          </span>
        </Link>

        {/* =====================================================
            MENU DESKTOP
            ===================================================== */}
        <nav className="hidden items-center gap-8 md:flex">
          {/* TRANG CHỦ */}
          <Link
            href="/"
            className="text-sm font-medium text-white transition hover:text-sky-300"
          >
            {isVi ? "Trang chủ" : "Home"}
          </Link>

          {/* KHÁCH SẠN */}
          <Link
            href="/#hotels"
            className="text-sm font-medium text-white transition hover:text-sky-300"
          >
            {isVi ? "Khách sạn" : "Hotels"}
          </Link>

          {/* PHÒNG */}
          <Link
            href="/phong"
            className="text-sm font-medium text-white transition hover:text-sky-300"
          >
            {isVi ? "Phòng" : "Rooms"}
          </Link>

          {/* TRẢI NGHIỆM */}
          <Link
            href="/trai-nghiem"
            className="text-sm font-medium text-white transition hover:text-sky-300"
          >
            {isVi ? "Trải nghiệm" : "Experiences"}
          </Link>

          {/* BLOG */}
          <Link
            href="/blog"
            className="text-sm font-medium text-white transition hover:text-sky-300"
          >
            Blog
          </Link>

          {/* LIÊN HỆ */}
          <Link
            href="/lien-he"
            className="text-sm font-medium text-white transition hover:text-sky-300"
          >
            {isVi ? "Liên hệ" : "Contact"}
          </Link>
        </nav>

        {/* =====================================================
            RIGHT
            ===================================================== */}
        <div className="flex items-center gap-3">
          {/* ===================================================
              LANGUAGE DESKTOP
              =================================================== */}
          <div className="hidden items-center gap-2 md:flex">
            {/* TIẾNG VIỆT */}
            <button
              type="button"
              onClick={() => changeLanguage("vi")}
              aria-label="Tiếng Việt"
              className={`flex items-center gap-1.5 transition ${
                language === "vi"
                  ? "text-sm font-bold text-white"
                  : "text-xs font-normal text-white/50 hover:text-white/80"
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

            <span className="text-white/30">
              |
            </span>

            {/* TIẾNG ANH */}
            <button
              type="button"
              onClick={() => changeLanguage("en")}
              aria-label="English"
              className={`flex items-center gap-1.5 transition ${
                language === "en"
                  ? "text-sm font-bold text-white"
                  : "text-xs font-normal text-white/50 hover:text-white/80"
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

                {/* WHITE DIAGONALS */}
                <path
                  d="M0 0L28 20M28 0L0 20"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                />

                {/* RED DIAGONALS */}
                <path
                  d="M0 0L28 20M28 0L0 20"
                  stroke="#C8102E"
                  strokeWidth="2"
                />

                {/* WHITE CROSS */}
                <path
                  d="M14 0V20M0 10H28"
                  stroke="#FFFFFF"
                  strokeWidth="6"
                />

                {/* RED CROSS */}
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
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/30 md:hidden"
          >
            <span className="relative block h-5 w-5">
              <span
                className={`absolute left-0 top-1 block h-0.5 w-5 bg-white transition ${
                  mobileMenuOpen
                    ? "translate-y-2 rotate-45"
                    : ""
                }`}
              />

              <span
                className={`absolute left-0 top-2.5 block h-0.5 w-5 bg-white transition ${
                  mobileMenuOpen
                    ? "opacity-0"
                    : "opacity-100"
                }`}
              />

              <span
                className={`absolute left-0 top-4 block h-0.5 w-5 bg-white transition ${
                  mobileMenuOpen
                    ? "-translate-y-1 -rotate-45"
                    : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* =======================================================
          MOBILE MENU
          ======================================================= */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-black/75 px-4 pb-5 pt-3 backdrop-blur-md md:hidden">
          <nav className="flex flex-col">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="border-b border-white/10 py-3 text-sm font-medium text-white transition hover:text-sky-300"
            >
              {isVi ? "Trang chủ" : "Home"}
            </Link>

            <Link
              href="/#hotels"
              onClick={closeMobileMenu}
              className="border-b border-white/10 py-3 text-sm font-medium text-white transition hover:text-sky-300"
            >
              {isVi ? "Khách sạn" : "Hotels"}
            </Link>

            <Link
              href="/phong"
              onClick={closeMobileMenu}
              className="border-b border-white/10 py-3 text-sm font-medium text-white transition hover:text-sky-300"
            >
              {isVi ? "Phòng" : "Rooms"}
            </Link>

            <Link
              href="/trai-nghiem"
              onClick={closeMobileMenu}
              className="border-b border-white/10 py-3 text-sm font-medium text-white transition hover:text-sky-300"
            >
              {isVi ? "Trải nghiệm" : "Experiences"}
            </Link>

            <Link
              href="/blog"
              onClick={closeMobileMenu}
              className="border-b border-white/10 py-3 text-sm font-medium text-white transition hover:text-sky-300"
            >
              Blog
            </Link>

            <Link
              href="/lien-he"
              onClick={closeMobileMenu}
              className="border-b border-white/10 py-3 text-sm font-medium text-white transition hover:text-sky-300"
            >
              {isVi ? "Liên hệ" : "Contact"}
            </Link>

            {/* MOBILE LANGUAGE */}
            <div className="flex items-center gap-3 pt-4">
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

              <span className="text-white/30">
                |
              </span>

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