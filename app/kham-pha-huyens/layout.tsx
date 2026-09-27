
import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenstays.vercel.app";

const canonicalUrl =
  `${siteUrl.replace(/\/+$/, "")}/kham-pha-huyens`;

export const metadata: Metadata = {
  title:
    "Về Huyen's Hotels & Stays | Khách sạn, Guesthouse & Homestay TP.HCM",

  description:
    "Tìm hiểu về Huyen's Hotels & Stays, hệ thống khách sạn, guesthouse và homestay tại TP.HCM với những không gian lưu trú riêng biệt, tiện nghi và thuận tiện cho mỗi hành trình.",

  keywords: [
    "Huyen's Hotels & Stays",
    "Huyen's Hotels",
    "Huyen's Stays",
    "khách sạn TP.HCM",
    "khách sạn Hồ Chí Minh",
    "guesthouse TP.HCM",
    "homestay TP.HCM",
    "hệ thống khách sạn TP.HCM",
    "hệ thống lưu trú TP.HCM",
    "khách sạn Quận 1",
    "guesthouse Quận 1",
    "homestay Quận 1",
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
      "Về Huyen's Hotels & Stays | Khách sạn, Guesthouse & Homestay TP.HCM",

    description:
      "Tìm hiểu về Huyen's Hotels & Stays và hệ thống khách sạn, guesthouse, homestay tại TP.HCM.",

    images: [
      {
        url: `${siteUrl.replace(/\/+$/, "")}/hero/hero-1.webp`,
        width: 1200,
        height: 630,
        alt: "Huyen's Hotels & Stays",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Về Huyen's Hotels & Stays | Khách sạn, Guesthouse & Homestay TP.HCM",

    description:
      "Tìm hiểu về Huyen's Hotels & Stays và hệ thống lưu trú tại TP.HCM.",

    images: [
      `${siteUrl.replace(/\/+$/, "")}/hero/hero-1.webp`,
    ],
  },
};

export default function KhamPhaHuyensLayout({
  children,
}: LayoutProps) {
  return children;
}
