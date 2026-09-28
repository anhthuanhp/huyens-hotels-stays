
import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenhotels.com";

const canonicalUrl =
  `${siteUrl.replace(/\/+$/, "")}/trai-nghiem`;

export const metadata: Metadata = {
  title:
    "Trải nghiệm tại TP.HCM | Huyen's Hotels & Stays",

  description:
    "Khám phá những trải nghiệm, hoạt động thú vị và các góc phố đặc trưng tại TP.HCM khi lưu trú tại Huyen's Hotels & Stays.",

  keywords: [
    "trải nghiệm TP.HCM",
    "trải nghiệm Hồ Chí Minh",
    "hoạt động TP.HCM",
    "du lịch TP.HCM",
    "địa điểm vui chơi Quận 1",
    "trải nghiệm Quận 1",
    "khách sạn Quận 1",
    "Huyen's Hotels & Stays",
  ],

  alternates: {
    canonical: canonicalUrl,
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
    url: canonicalUrl,
    siteName: "Huyen's Hotels & Stays",
    title:
      "Trải nghiệm tại TP.HCM | Huyen's Hotels & Stays",
    description:
      "Khám phá những trải nghiệm, hoạt động thú vị và các góc phố đặc trưng tại TP.HCM khi lưu trú tại Huyen's Hotels & Stays.",
    images: [
      {
        url: `${siteUrl.replace(/\/+$/, "")}/hero/hero-1.webp`,
        width: 1200,
        height: 630,
        alt: "Trải nghiệm tại TP.HCM cùng Huyen's Hotels & Stays",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Trải nghiệm tại TP.HCM | Huyen's Hotels & Stays",
    description:
      "Khám phá những hoạt động và trải nghiệm đáng nhớ tại TP.HCM.",
    images: [
      `${siteUrl.replace(/\/+$/, "")}/hero/hero-1.webp`,
    ],
  },
};

export default function TraiNghiemLayout({
  children,
}: LayoutProps) {
  return children;
}
