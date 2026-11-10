"use client";

import Image from "next/image";
import Link from "@/app/components/LocalizedLink";
import { useLanguage } from "../lib/use-language";
import SocialLinks from "./SocialLinks";
import EmailLink from "./EmailLink";
import {
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
} from "lucide-react";

const policies = [
  {
    href: "/chinh-sach-dat-phong",
    vi: "Chính sách đặt phòng",
    en: "Booking Policy",
  },
  {
    href: "/chinh-sach-huy-phong",
    vi: "Chính sách hủy phòng",
    en: "Cancellation Policy",
  },
  {
    href: "/chinh-sach-bao-mat",
    vi: "Chính sách bảo mật",
    en: "Privacy Policy",
  },
  {
    href: "/chinh-sach-khac",
    vi: "Các chính sách khác",
    en: "Other Policies",
  },
];

const questions = [
  {
    href: "/lien-he",
    vi: "Câu hỏi thường gặp",
    en: "Frequently Asked Questions",
  },
  {
    href: "/lien-he",
    vi: "Hướng dẫn đặt phòng",
    en: "Booking Guide",
  },
  {
    href: "/lien-he",
    vi: "Hướng dẫn thanh toán",
    en: "Payment Guide",
  },
];

export default function Footer() {
  const language = useLanguage();
  const isVi = language === "vi";

  const heading =
    "mb-2 text-[12px] font-bold leading-snug text-white";

  const column =
    "min-w-0 border-b border-white/25 pb-4 " +
    "sm:border-b-0 sm:border-r sm:border-white/40 " +
    "sm:pb-0 sm:pr-4";

  const linkStyle =
    "block py-[3px] text-[11px] leading-[1.45] " +
    "text-white/85 transition hover:text-white hover:underline";

  return (
    <footer
      id="footer"
      className="bg-[#092f20] text-white"
    >
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 xl:px-0">
        <div
          className="grid grid-cols-1 gap-4 py-6
                     sm:grid-cols-2
                     lg:grid-cols-[1.45fr_1fr_1fr_1.1fr_1.05fr]
                     lg:gap-[23px]"
        >
          {/* 1. CONG TY */}
          <div className={column}>
            <Link
              href="/"
              className="mb-2 block"
            >
              <h2 className={heading}>
                Huyen Group Company Limited
              </h2>
            </Link>

            <p className="mb-1 text-[11px] leading-[1.45] text-white/85">
              {isVi
                ? "Mã số thuế: 0318433728"
                : "Tax ID: 0318433728"}
            </p>

            <p className="text-[11px] leading-[1.45] text-white/85">
              {isVi
                ? "Địa chỉ: 18A/139 Nguyễn Thị Minh Khai, Sài Gòn, TP. Hồ Chí Minh"
                : "Address: 18A/139 Nguyen Thi Minh Khai, Saigon, Ho Chi Minh City"}
            </p>
          </div>

          {/* 2. CHINH SACH */}
          <div className={column}>
            <h3 className={heading}>
              {isVi ? "Chính sách" : "Policies"}
            </h3>

            <nav
              aria-label={isVi ? "Chính sách" : "Policies"}
            >
              {policies.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkStyle}
                >
                  {isVi ? item.vi : item.en}
                </Link>
              ))}
            </nav>
          </div>

          {/* 3. CAC CAU HOI */}
          <div className={column}>
            <h3 className={heading}>
              {isVi ? "Các câu hỏi" : "Questions"}
            </h3>

            <nav
              aria-label={isVi ? "Các câu hỏi" : "Questions"}
            >
              {questions.map((item) => (
                <Link
                  key={item.vi}
                  href={item.href}
                  className={linkStyle}
                >
                  {isVi ? item.vi : item.en}
                </Link>
              ))}
            </nav>
          </div>

          {/* 4. LIEN HE */}
          <div className={column}>
            <h3 className={heading}>
              {isVi ? "Liên hệ" : "Contact"}
            </h3>

            <div className="space-y-2 text-[11px] leading-[1.45] text-white/85">
              <p className="flex items-start gap-2">
                <MapPin
                  size={14}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {isVi
                    ? "TP. Hồ Chí Minh, Việt Nam"
                    : "Ho Chi Minh City, Vietnam"}
                </span>
              </p>

              <a
                href="tel:+84902095669"
                className="flex items-center gap-2 hover:text-white hover:underline"
              >
                <Phone size={14} aria-hidden="true" />
                +84 902 095 669
              </a>

              <a
                href="https://wa.me/84902095669"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white hover:underline"
              >
                <Image
                  src="/icons/whatsapp.svg"
                  alt=""
                  width={15}
                  height={15}
                />
                WhatsApp
              </a>

              <p className="flex items-center gap-2">
                <MessageSquare
                  size={14}
                  aria-hidden="true"
                />
                Zalo: +84 902 095 669
              </p>

              <div className="flex items-start gap-2">
                <Mail
                  size={14}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0 break-all">
                  <div>
                    <EmailLink address="contact@huyenhotels.com" />
                  </div>
                  <div>
                    <EmailLink address="reception@huyenhotels.com" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. KET NOI */}
          <div className="min-w-0">
            <h3 className={heading}>
              {isVi ? "Kết nối" : "Connect"}
            </h3>

            <div className="mt-2">
              <SocialLinks
                label={isVi ? "Mạng xã hội" : "Social media"}
              />
            </div>

            <div
              className="mt-4 flex items-center gap-2
                         rounded-[18px] border border-[#5eaa58]
                         px-2.5 py-1.5"
            >
              <ShieldCheck
                size={22}
                className="shrink-0 text-[#b1eb9f]"
                aria-hidden="true"
              />

              <span className="text-[10px] leading-[1.35] text-white/90">
                {isVi ? (
                  <>
                    Đặt phòng an toàn
                    <span className="block">
                      Thanh toán bảo mật
                    </span>
                  </>
                ) : (
                  <>
                    Safe booking
                    <span className="block">
                      Secure payment
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div
          className="flex flex-col gap-1 border-t border-white/40
                     py-3 text-[10px] text-white/75
                     sm:flex-row sm:items-center
                     sm:justify-between"
        >
          <p>
            © {new Date().getFullYear()} Huyen&apos;s
            Hotels &amp; Stays.
            {" "}
            {isVi
              ? "Bảo lưu mọi quyền."
              : "All rights reserved."}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/chinh-sach-bao-mat"
              className="hover:underline"
            >
              {isVi ? "Chính sách riêng tư" : "Privacy policy"}
            </Link>

            <span aria-hidden="true">|</span>

            <Link
              href="/chinh-sach-khac"
              className="hover:underline"
            >
              {isVi ? "Điều khoản sử dụng" : "Terms of use"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}