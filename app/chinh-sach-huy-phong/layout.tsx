
import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenstays.vercel.app";

const canonicalUrl =
  `${siteUrl.replace(/\/+$/, "")}/chinh-sach-huy-phong`;

export const metadata: Metadata = {
  title: "Chính sách hủy phòng | Huyen's Hotels & Stays",

  description:
    "Chính sách hủy phòng của Huyen's Hotels & Stays, bao gồm các quy định cần biết khi thay đổi hoặc hủy đặt phòng.",

  keywords: [
    "chính sách hủy phòng",
    "chính sách hủy phòng khách sạn",
    "quy định hủy phòng",
    "hủy đặt phòng khách sạn",
    "chính sách hoàn tiền đặt phòng",
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
    title: "Chính sách hủy phòng | Huyen's Hotels & Stays",
    description:
      "Tìm hiểu các quy định về thay đổi và hủy đặt phòng tại Huyen's Hotels & Stays.",
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
    title: "Chính sách hủy phòng | Huyen's Hotels & Stays",
    description:
      "Các quy định về thay đổi và hủy đặt phòng tại Huyen's Hotels & Stays.",
    images: [
      `${siteUrl.replace(/\/+$/, "")}/hero/hero-1.webp`,
    ],
  },
};

export default function CancellationPolicyLayout({
  children,
}: LayoutProps) {
  return children;
}
