
import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenstays.vercel.app";

const canonicalUrl =
  `${siteUrl.replace(/\/+$/, "")}/blog`;

export const metadata: Metadata = {
  title:
    "Blog du lịch, lưu trú & trải nghiệm TP.HCM | Huyen's Hotels & Stays",

  description:
    "Khám phá ẩm thực, cuộc sống địa phương, kinh nghiệm lưu trú và những trải nghiệm thú vị tại TP.HCM trên Blog của Huyen's Hotels & Stays.",

  keywords: [
    "blog du lịch TP.HCM",
    "blog du lịch Hồ Chí Minh",
    "kinh nghiệm du lịch TP.HCM",
    "kinh nghiệm lưu trú TP.HCM",
    "du lịch Quận 1",
    "ẩm thực TP.HCM",
    "địa điểm ăn uống TP.HCM",
    "cuộc sống địa phương TP.HCM",
    "trải nghiệm TP.HCM",
    "khách sạn TP.HCM",
    "homestay TP.HCM",
    "guesthouse TP.HCM",
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
      "Blog du lịch, lưu trú & trải nghiệm TP.HCM | Huyen's Hotels & Stays",

    description:
      "Khám phá ẩm thực, cuộc sống địa phương, kinh nghiệm lưu trú và những trải nghiệm thú vị tại TP.HCM.",

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
      "Blog du lịch, lưu trú & trải nghiệm TP.HCM | Huyen's Hotels & Stays",

    description:
      "Câu chuyện, kinh nghiệm lưu trú, ẩm thực và trải nghiệm khám phá TP.HCM.",

    images: [
      `${siteUrl.replace(/\/+$/, "")}/hero/hero-1.webp`,
    ],
  },
};

export default function BlogLayout({
  children,
}: LayoutProps) {
  return children;
}
