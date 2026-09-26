import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "./components/ConditionalHeader";
import ContactFloat from "./components/ContactFloat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

type LayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Huyen's Hotels & Stays — Khách sạn & Lưu trú tại Quận 1, TP.HCM",
  description:
    "Khách sạn, guesthouse & homestay tại trung tâm TP.HCM. Không gian sạch sẽ, tiện nghi, riêng tư. Đặt phòng trực tiếp.",
  keywords: [
    "khách sạn quận 1",
    "homestay tphcm",
    "guesthouse quận 1",
    "lưu trú trung tâm",
    "Huyen's Hotels",
  ],
  openGraph: {
    title: "Huyen's Hotels & Stays",
    description: "Lưu trú tiện nghi tại Quận 1, TP.HCM",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: LayoutProps) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900 font-sans">
        <ConditionalHeader />

        <main className="flex-1">{children}</main>

        <ContactFloat />
      </body>
    </html>
  );
}