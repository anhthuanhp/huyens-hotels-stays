import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "./components/ConditionalHeader";
import ContactFloat from "./components/ContactFloat";
import VisitorTracker from "./components/VisitorTracker";

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

const siteUrl = "https://huyenstays.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Huyen's Hotels & Stays | Khách sạn & Lưu trú tại Quận 1, TP.HCM",
    template: "%s | Huyen's Hotels & Stays",
  },

  description:
    "Khách sạn, guesthouse và homestay tại trung tâm Quận 1, TP.HCM. Không gian sạch sẽ, tiện nghi, riêng tư. Đặt phòng trực tiếp tại Huyen's Hotels & Stays.",

  keywords: [
    "khách sạn Quận 1",
    "khách sạn Quận 1 TP.HCM",
    "khách sạn trung tâm TP.HCM",
    "homestay TP.HCM",
    "homestay Quận 1",
    "guesthouse Quận 1",
    "lưu trú Quận 1",
    "chỗ ở Quận 1",
    "khách sạn Hồ Chí Minh",
    "Huyen's Hotels & Stays",
  ],

  authors: [
    {
      name: "Huyen's Hotels & Stays",
    },
  ],

  creator: "Huyen's Hotels & Stays",
  publisher: "Huyen's Hotels & Stays",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: "Huyen's Hotels & Stays",
    title: "Huyen's Hotels & Stays | Khách sạn & Lưu trú tại Quận 1, TP.HCM",
    description:
      "Khách sạn, guesthouse và homestay tại trung tâm Quận 1, TP.HCM. Không gian sạch sẽ, tiện nghi, riêng tư. Đặt phòng trực tiếp.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Huyen's Hotels & Stays | Khách sạn & Lưu trú tại Quận 1, TP.HCM",
    description:
      "Khách sạn, guesthouse và homestay tại trung tâm Quận 1, TP.HCM. Đặt phòng trực tiếp tại Huyen's Hotels & Stays.",
  },

  category: "travel",
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
        <VisitorTracker />

        <ConditionalHeader />

        <main className="flex-1">{children}</main>

        <ContactFloat />
      </body>
    </html>
  );
}