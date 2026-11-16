import { FACEBOOK_PAGE_URL, INSTAGRAM_PAGE_URL, THREADS_PAGE_URL } from "./lib/social";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { RouteLanguage } from "./lib/use-language";
import "./globals.css";
import VisitorTracker from "./components/VisitorTracker";
import GoogleAnalytics from "./components/GoogleAnalytics";
import BackToTopButton from "./components/BackToTopButton";
import LazyWidgets from "./components/LazyWidgets";
import { Suspense } from "react";
import DocumentLanguage from "./components/DocumentLanguage";
import SiteHeader from "./components/SiteHeader";
import Footer from "./components/Footer";
import { DEFAULT_SHARE_IMAGE } from "./lib/seo";

type LayoutProps = {
  children: React.ReactNode;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://huyenhotels.com";
const siteName = "Huyen's Hotels & Stays";

// === Tối ưu Title & Meta chính ===
const defaultTitle = "Khách sạn và homestay TP.HCM | Huyen's Hotels & Stays";
const defaultDescription = "Tìm khách sạn, guesthouse và homestay tại TP.HCM cùng Huyen's Hotels & Stays. Xem vị trí, loại phòng, giá theo đêm và gửi yêu cầu đặt phòng.";

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
        url: DEFAULT_SHARE_IMAGE,
        width: 1346,
        height: 547,
        alt: "Huyen's Hotels — Khách sạn trung tâm Quận 1, gần Bến Thành",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [DEFAULT_SHARE_IMAGE],
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

export default async function RootLayout({ children }: LayoutProps) {
  const language = (await headers()).get("x-huyen-route-language") === "en" ? "en" : "vi";
  return (
    <html
      lang={language}
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900 font-sans">
        {/* === Schema Organization — Nhận diện thương hiệu Huyen's Hotels & Stays === */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${siteUrl}/#organization`,
              name: siteName,
              sameAs: [FACEBOOK_PAGE_URL, INSTAGRAM_PAGE_URL, THREADS_PAGE_URL],
              url: siteUrl,
              telephone: "+84 902095669",
              description:
                "Huyen's Hotels & Stays cung cấp khách sạn, guesthouse và homestay lưu trú theo đêm tại Thành phố Hồ Chí Minh.",
            }),
          }}
        />

        <RouteLanguage language={language}>
          <GoogleAnalytics />
          <VisitorTracker />
          <BackToTopButton />
          <Suspense fallback={null}>
            <DocumentLanguage />
            <SiteHeader />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
          <LazyWidgets />
        </RouteLanguage>
      </body>
    </html>
  );
}
