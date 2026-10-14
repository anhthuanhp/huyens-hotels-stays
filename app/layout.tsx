import type { Metadata } from "next";
import "./globals.css";
import VisitorTracker from "./components/VisitorTracker";
import BackToTopButton from "./components/BackToTopButton";
import LazyWidgets from "./components/LazyWidgets";
import { Suspense } from "react";
import SiteHeader from "./components/SiteHeader";

type LayoutProps = {
  children: React.ReactNode;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://huyenhotels.com";
const siteName = "Huyen's Hotels & Stays";

// === Tối ưu Title & Meta chính ===
const defaultTitle = "Khách sạn và homestay TP.HCM | Huyen's Hotels & Stays";
const defaultDescription = "Tìm khách sạn, guesthouse và homestay tại TP.HCM cùng Huyen's Hotels & Stays. Xem vị trí, loại phòng, giá ngày hoặc tháng và gửi yêu cầu đặt phòng.";

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
        url: "/images/huyens-hotels-stays-logo.webp",
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
    images: ["/images/huyens-hotels-stays-logo.webp"],
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
    <html
      lang="vi"
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
              "@id": `${siteUrl}#organization`,
              name: siteName,
              url: siteUrl,
              telephone: "+84 902095669",
              description:
                "Huyen's Hotels & Stays cung cấp khách sạn, homestay và căn hộ dịch vụ tại trung tâm Thành phố Hồ Chí Minh.",
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