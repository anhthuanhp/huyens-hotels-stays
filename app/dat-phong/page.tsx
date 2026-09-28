import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://huyenhotels.com";

const canonicalUrl =
  `${siteUrl.replace(/\/+$/, "")}/dat-phong`;

export const metadata: Metadata = {
  title: "Đặt phòng khách sạn & homestay | Huyen's Hotels & Stays",

  description:
    "Hoàn tất thông tin đặt phòng tại Huyen's Hotels & Stays. Kiểm tra ngày lưu trú, phòng đã chọn và thông tin liên hệ trước khi xác nhận đặt phòng.",

  alternates: {
    canonical: canonicalUrl,
  },

  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
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
    title: "Đặt phòng khách sạn & homestay | Huyen's Hotels & Stays",
    description:
      "Hoàn tất thông tin đặt phòng tại Huyen's Hotels & Stays và xác nhận phòng lưu trú tại TP.HCM.",
    images: [
      {
        url: `${siteUrl.replace(/\/+$/, "")}/hero/hero-1.webp`,
        width: 1200,
        height: 630,
        alt: "Đặt phòng tại Huyen's Hotels & Stays",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Đặt phòng khách sạn & homestay | Huyen's Hotels & Stays",
    description:
      "Hoàn tất thông tin và xác nhận đặt phòng tại Huyen's Hotels & Stays.",
    images: [
      `${siteUrl.replace(/\/+$/, "")}/hero/hero-1.webp`,
    ],
  },
};

export default function DatPhongPage() {
  return null;
}