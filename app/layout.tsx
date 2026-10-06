import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import VisitorTracker from "./components/VisitorTracker";
import BackToTopButton from "./components/BackToTopButton";
import LazyWidgets from "./components/LazyWidgets";
import { Suspense } from "react";
import SiteHeader from "./components/SiteHeader";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://huyenhotels.com";
const siteName = "Huyen's Hotels & Stays";

// === Tối ưu Title & Meta chính ===
const defaultTitle = "Huyen's Hotels & Stays | Khách sạn Quận 1 TP.HCM — Gần Bến Thành, Nguyễn Huệ";
const defaultDescription = "Khách sạn, homestay, căn hộ dịch vụ tại trung tâm Quận 1 TP.HCM. Gần chợ Bến Thành, phố đi bộ Nguyễn Huệ. Phòng sạch, giá tốt, đặt phòng trực tiếp.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: defaultTitle,
  description: defaultDescription,
  applicationName: siteName,
  authors: [{ name: siteName }],
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
        alt: "Huyen's Hotels — Khách sạn trung tâm Quận 1, gần Bến Thành",
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

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-900 font-sans">
        {/* === Schema Hotel — Google hiểu ngay thông tin === */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Hotel",
              name: "Huyen's Hotels & Stays",
              url: siteUrl,
              address: {
                "@type": "PostalAddress",
                streetAddress: "18A/139 Nguyễn Thị Minh Khai",
                addressLocality: "Thành phố Hồ Chí Minh",
                addressRegion: "Quận 1",
                addressCountry: "VN",
              },
              telephone: "+84 902095669",
              priceRange: "$$",
              description: "Khách sạn, homestay và căn hộ dịch vụ tại trung tâm Quận 1 TP.HCM, gần chợ Bến Thành và phố đi bộ Nguyễn Huệ.",
            }),
          }}
        />

        <VisitorTracker />
        <BackToTopButton />
        <Suspense fallback={null}>
          <SiteHeader />
        </Suspense>
        <main className="flex-1">
          {children}
        </main>
        <LazyWidgets />
      </body>
    </html>
  );
}