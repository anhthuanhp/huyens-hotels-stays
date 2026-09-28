
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenhotels.com";

const siteName = "Huyen's Hotels & Stays";

const defaultTitle =
  "Huyen's Hotels & Stays | Khách sạn & lưu trú tại TP.HCM";

const defaultDescription =
  "Huyen's Hotels & Stays cung cấp khách sạn, guesthouse và homestay tại TP.HCM. Không gian lưu trú tiện nghi, vị trí thuận thuận tiện và đặt phòng trực tiếp.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: defaultTitle,
    template: "%s | Huyen's Hotels & Stays",
  },

  description: defaultDescription,

  applicationName: siteName,

  authors: [
    {
      name: siteName,
    },
  ],

  creator: siteName,
  publisher: siteName,

  verification: {
    google: "O57H556eHBb9rgobX6XVlkAIEeGlPXpWmwD0Wj6shvk",
  },

  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },

  alternates: {
    canonical: siteUrl,
  },

  openGraph: {
    type: "website",
    siteName,
    locale: "vi_VN",
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,

    images: [
      {
        url: "/hero/hero-1.webp",
        width: 1600,
        height: 900,
        alt:
          "Huyen's Hotels & Stays - Khách sạn, guesthouse và homestay tại TP.HCM",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/hero/hero-1.webp"],
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

        <main className="flex-1">
          {children}
        </main>

        <ContactFloat />
      </body>
    </html>
  );
}
