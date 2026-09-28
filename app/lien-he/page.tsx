
import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenhotels.com";

const canonicalUrl =
  `${siteUrl.replace(/\/+$/, "")}/lien-he`;

export const metadata: Metadata = {
  title:
    "Liên hệ Huyen's Hotels & Stays | Khách sạn & lưu trú TP.HCM",

  description:
    "Liên hệ Huyen's Hotels & Stays để được hỗ trợ về phòng nghỉ, đặt phòng và thông tin lưu trú tại TP.HCM. Hotline, Zalo, WhatsApp và Email.",

  keywords: [
    "liên hệ khách sạn TP.HCM",
    "liên hệ khách sạn Hồ Chí Minh",
    "liên hệ Huyen's Hotels & Stays",
    "đặt phòng khách sạn TP.HCM",
    "khách sạn TP.HCM",
    "guesthouse TP.HCM",
    "homestay TP.HCM",
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
      "Liên hệ Huyen's Hotels & Stays | Khách sạn & lưu trú TP.HCM",

    description:
      "Liên hệ Huyen's Hotels & Stays để được hỗ trợ về phòng nghỉ, đặt phòng và thông tin lưu trú tại TP.HCM.",

    images: [
      {
        url: `${siteUrl.replace(/\/+$/, "")}/hero/hero-1.webp`,
        width: 1200,
        height: 630,
        alt: "Liên hệ Huyen's Hotels & Stays",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Liên hệ Huyen's Hotels & Stays | Khách sạn & lưu trú TP.HCM",

    description:
      "Liên hệ Huyen's Hotels & Stays để được hỗ trợ về phòng nghỉ và đặt phòng tại TP.HCM.",

    images: [
      `${siteUrl.replace(/\/+$/, "")}/hero/hero-1.webp`,
    ],
  },
};

export default function LienHeLayout({
  children,
}: LayoutProps) {
  return children;
}
