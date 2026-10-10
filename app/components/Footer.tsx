
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Phone,
  MessageCircle,
  MessageSquare,
  Mail,
} from "lucide-react";

type Language = "vi" | "en";

declare global {
  interface WindowEventMap {
    "language-change": CustomEvent<Language>;
  }
}

export default function Footer() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "vi";
    }

    const savedLanguage = localStorage.getItem("huyen-language");

    return savedLanguage === "vi" || savedLanguage === "en"
      ? savedLanguage
      : "vi";
  });

  useEffect(() => {
    const handleLanguageChange = (
      event: CustomEvent<Language>
    ) => {
      if (
        event.detail === "vi" ||
        event.detail === "en"
      ) {
        setLanguage(event.detail);
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

  const isVi = language === "vi";

  return (
    <footer className="border-t border-sky-700 bg-sky-900 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* THÔNG TIN HUYEN'S */}
          <div>
            <Link href="/" className="block">
              <div
                className="text-xl font-semibold tracking-tight text-white"
                style={{
                  fontFamily:
                    'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
                }}
              >
                Huyen&apos;s Hotels &amp; Stays
              </div>
            </Link>

            <div className="mt-5 space-y-2 text-sm leading-6 text-white/75">
              <p>
                {isVi
                  ? "Công ty TNHH Huyen Group"
                  : "Huyen Group Company Limited"}
              </p>

              <p>
                {isVi
                  ? "Mã số thuế: 0318433728"
                  : "Tax ID: 0318433728"}
              </p>

              <p>
                {isVi ? (
                  <>
                    Địa chỉ: 18A/139 Nguyễn Thị Minh Khai,
                    <br />
                    Sài Gòn, Hồ Chí Minh
                  </>
                ) : (
                  <>
                    Address: 18A/139 Nguyen Thi Minh Khai,
                    <br />
                    Saigon, Ho Chi Minh City
                  </>
                )}
              </p>
            </div>
          </div>

          {/* CHÍNH SÁCH */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              {isVi ? "Chính sách" : "Policies"}
            </h3>

            <div className="mt-4 space-y-3 text-sm text-white/75">
              <Link
                href="/chinh-sach-dat-phong"
                className="block transition hover:text-white"
              >
                {isVi
                  ? "Chính sách đặt phòng"
                  : "Booking Policy"}
              </Link>

              <Link
                href="/chinh-sach-huy-phong"
                className="block transition hover:text-white"
              >
                {isVi
                  ? "Chính sách hủy phòng"
                  : "Cancellation Policy"}
              </Link>

              <Link
                href="/chinh-sach-bao-mat"
                className="block transition hover:text-white"
              >
                {isVi
                  ? "Chính sách bảo mật"
                  : "Privacy Policy"}
              </Link>

              <Link
                href="/chinh-sach-khac"
                className="block transition hover:text-white"
              >
                {isVi
                  ? "Các chính sách khác"
                  : "Other Policies"}
              </Link>
            </div>
          </div>

          {/* THÔNG TIN LIÊN HỆ */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              {isVi
                ? "Thông tin liên hệ"
                : "Contact Information"}
            </h3>

            <div className="mt-4 space-y-3 text-sm text-white/75">
              <div className="flex items-center gap-3">
                <Phone
                  className="h-4 w-4 shrink-0 text-white"
                  strokeWidth={1.8}
                />
                <span>
                  <span className="font-medium">
                    Hotline:
                  </span>{" "}
                  +84 902095669
                </span>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle
                  className="h-4 w-4 shrink-0 text-white"
                  strokeWidth={1.8}
                />
                <span>
                  <span className="font-medium">
                    WhatsApp:
                  </span>{" "}
                  +84 902095669
                </span>
              </div>

              <div className="flex items-center gap-3">
                <MessageSquare
                  className="h-4 w-4 shrink-0 text-white"
                  strokeWidth={1.8}
                />
                <span>
                  <span className="font-medium">
                    Zalo:
                  </span>{" "}
                  +84 902095669
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail
                  className="h-4 w-4 shrink-0 text-white"
                  strokeWidth={1.8}
                />
                <span className="break-all">
                  <span className="font-medium">
                    Email:
                  </span>{" "}
                  contact@huyenhotels.com; reception@huyenhotels.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-10 border-t border-white/20 pt-6">
          <div className="flex flex-col gap-3 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Huyen Group.{" "}
              {isVi
                ? "Bảo lưu mọi quyền."
                : "All rights reserved."}
            </p>

            <p>
              Huyen&apos;s Hotels &amp; Stays
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
