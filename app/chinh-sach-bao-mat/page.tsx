
import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenstays.vercel.app";

const canonicalUrl =
  `${siteUrl.replace(/\/+$/, "")}/chinh-sach-bao-mat`;

export const metadata: Metadata = {
  title:
    "Chính sách bảo mật | Huyen's Hotels & Stays",

  description:
    "Chính sách bảo mật của Huyen's Hotels & Stays, quy định cách thông tin của khách hàng được tiếp nhận, sử dụng và bảo vệ khi sử dụng website.",

  keywords: [
    "chính sách bảo mật",
    "chính sách bảo mật khách sạn",
    "bảo mật thông tin khách hàng",
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
      "Chính sách bảo mật | Huyen's Hotels & Stays",

    description:
      "Tìm hiểu chính sách bảo mật và cách Huyen's Hotels & Stays bảo vệ thông tin của khách hàng.",

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
      "Chính sách bảo mật | Huyen's Hotels & Stays",

    description:
      "Chính sách bảo mật và bảo vệ thông tin khách hàng của Huyen's Hotels & Stays.",

    images: [
      `${siteUrl.replace(/\/+$/, "")}/hero/hero-1.webp`,
    ],
  },
};

export default function PrivacyPolicyLayout({
  children,
}: LayoutProps) {
  return children;
}
