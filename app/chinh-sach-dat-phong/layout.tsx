
import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenstays.vercel.app";

const canonicalUrl =
  `${siteUrl.replace(/\/+$/, "")}/chinh-sach-dat-phong`;

export const metadata: Metadata = {
  title: "Chính sách đặt phòng | Huyen's Hotels & Stays",

  description:
    "Chính sách đặt phòng của Huyen's Hotels & Stays, bao gồm các quy định và thông tin cần biết khi đặt phòng tại khách sạn, guesthouse và homestay.",

  keywords: [
    "chính sách đặt phòng",
    "quy định đặt phòng khách sạn",
    "điều khoản đặt phòng",
    "đặt phòng khách sạn TP.HCM",
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
    title: "Chính sách đặt phòng | Huyen's Hotels & Stays",
    description:
      "Tìm hiểu các quy định và thông tin cần biết khi đặt phòng tại Huyen's Hotels & Stays.",
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
    title: "Chính sách đặt phòng | Huyen's Hotels & Stays",
    description:
      "Các quy định và thông tin cần biết khi đặt phòng tại Huyen's Hotels & Stays.",
    images: [
      `${siteUrl.replace(/\/+$/, "")}/hero/hero-1.webp`,
    ],
  },
};

export default function BookingPolicyLayout({
  children,
}: LayoutProps) {
  return children;
}

