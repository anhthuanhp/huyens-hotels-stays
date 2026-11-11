
"use client";

import Image from "next/image";
import Link from "@/app/components/LocalizedLink";
import {
  changeSiteLanguage,
  useLanguage,
} from "@/app/lib/use-language";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Language = "vi" | "en";

const navigation = [
  {
    href: "/",
    vi: "Trang chủ",
    en: "Home",
  },
  {
    href: "/#hotels",
    vi: "Khách sạn",
    en: "Hotels",
  },
  {
    href: "/#hotels",
    vi: "Căn hộ dịch vụ",
    en: "Serviced apartments",
  },
  {
    href: "/trai-nghiem",
    vi: "Trải nghiệm",
    en: "Experiences",
  },
  {
    href: "/blog",
    vi: "Blog",
    en: "Blog",
  },
  {
    href: "/lien-he",
    vi: "Liên hệ",
    en: "Contact",
  },
];

export default function Header() {
  const language = useLanguage();
  const isVi = language === "vi";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        !menuRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const switchLanguage = (value: Language) => {
    changeSiteLanguage(value);
    setMenuOpen(false);
  };

  const languageButtons = (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-full
                 border border-white p-0.5"
      aria-label={isVi ? "Ngôn ngữ" : "Language"}
    >
      {(["vi", "en"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => switchLanguage(value)}
          aria-label={
            value === "vi" ? "Tiếng Việt" : "English"
          }
          aria-pressed={language === value}
          className={`rounded-full px-2.5 py-1 text-xs
                      font-bold transition-colors ${
            language === value
              ? "bg-white text-[#153528]"
              : "bg-transparent text-white hover:bg-white/15"
          }`}
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <header
      data-public-site
      className="absolute inset-x-0 top-0 z-50
                 h-[72px] bg-transparent
                 text-white"
    >
      <div
        className="mx-auto flex h-full w-full max-w-[1100px]
                   items-center justify-between gap-5
                   px-4 sm:px-6 xl:px-0"
      >
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex shrink-0 items-center"
          aria-label="Huyen's Hotels & Stays"
        >
          <Image
            src="/images/huyens-hotels-stays-logo.webp"
            alt="Huyen's Hotels & Stays"
            width={180}
            height={60}
            priority
            className="h-auto w-[100px] object-contain
                       sm:w-[115px]"
          />
        </Link>

        <nav
          className="hidden h-full flex-1 items-center
                     justify-between gap-4 lg:flex"
          aria-label={
            isVi ? "Điều hướng chính" : "Main navigation"
          }
        >
          {navigation.map((item, index) => (
            <Link
              key={`${item.href}-${item.en}`}
              href={item.href}
              className={`group relative flex h-full
                          items-center whitespace-nowrap
                          text-[13px] font-semibold
                          transition-colors hover:text-white ${
                index === 0 ? "text-white" : "text-white/90"
              }`}
            >
              {isVi ? item.vi : item.en}

              <span
                className={`absolute inset-x-0 bottom-[14px]
                            h-[3px] origin-center bg-white
                            transition-transform duration-200
                            group-hover:scale-x-100 ${
                  index === 0
                    ? "scale-x-100"
                    : "scale-x-0"
                }`}
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {languageButtons}

          <button
            ref={buttonRef}
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={
              menuOpen
                ? isVi ? "Đóng menu" : "Close menu"
                : isVi ? "Mở menu" : "Open menu"
            }
            aria-expanded={menuOpen}
            aria-controls="huyen-mobile-menu"
            className="flex h-9 w-9 items-center
                       justify-center rounded-lg
                       border border-white/30 text-white
                       transition hover:bg-white/15 lg:hidden"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="huyen-mobile-menu"
          ref={menuRef}
          className="absolute right-4 top-[calc(100%+8px)]
                     z-50 w-[min(290px,calc(100vw-32px))]
                     overflow-hidden rounded-xl border
                     border-white/15 bg-[#0c1b18]
                     shadow-2xl lg:hidden"
        >
          <nav
            className="flex flex-col p-2"
            aria-label={
              isVi ? "Menu di động" : "Mobile menu"
            }
          >
            {navigation.map((item, index) => (
              <Link
                key={`${item.href}-${item.en}`}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-4 py-3
                            text-sm font-semibold transition
                            hover:bg-white/10 ${
                  index === 0
                    ? "bg-white/10 text-white"
                    : "text-white/90"
                }`}
              >
                {isVi ? item.vi : item.en}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
