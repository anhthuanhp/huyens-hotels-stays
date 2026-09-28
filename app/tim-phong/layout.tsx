
import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenhotels.com";

const canonicalUrl =
  `${siteUrl.replace(/\/+$/, "")}/tim-phong`;

export const metadata: Metadata = {
  title:
    "Tìm phòng khách sạn & homestay | Huyen's Hotels & Stays",

  description:
    "Tìm và chọn phòng khách sạn, guesthouse và homestay tại Huyen's Hotels & Stays ở TP.HCM. Xem thông tin phòng và lựa chọn phù hợp với lịch lưu trú của bạn.",

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

    title:
      "Tìm phòng khách sạn & homestay | Huyen's Hotels & Stays",

    description:
      "Tìm và chọn phòng khách sạn, guesthouse và homestay tại Huyen's Hotels & Stays ở TP.HCM.",

    images: [
      {
        url: `${siteUrl.replace(/\/+$/, "")}/hero/hero-1.webp`,
        width: 1200,
        height: 630,
        alt: "Tìm phòng tại Huyen's Hotels & Stays",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Tìm phòng khách sạn & homestay | Huyen's Hotels & Stays",

    description:
      "Tìm và chọn phòng phù hợp cho chuyến lưu trú tại Huyen's Hotels & Stays.",

    images: [
      `${siteUrl.replace(/\/+$/, "")}/hero/hero-1.webp`,
    ],
  },
};

export default function TimPhongLayout({
  children,
}: LayoutProps) {
  return children;
}
