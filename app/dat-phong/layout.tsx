import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenhotels.com";

const canonicalUrl =
  `${siteUrl.replace(/\/$/, "")}/dat-phong`;

export const metadata: Metadata = {
  title: "Đặt phòng | Huyen's Hotels & Stays",

  description:
    "Trang đặt phòng trực tiếp tại Huyen's Hotels & Stays. Xác nhận thông tin lưu trú, phòng đã chọn và thông tin liên hệ.",

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
    title: "Đặt phòng | Huyen's Hotels & Stays",
    description:
      "Đặt phòng trực tiếp tại Huyen's Hotels & Stays.",
  },

  twitter: {
    card: "summary",
    title: "Đặt phòng | Huyen's Hotels & Stays",
    description:
      "Đặt phòng trực tiếp tại Huyen's Hotels & Stays.",
  },
};

export default function DatPhongLayout({
  children,
}: LayoutProps) {
  return children;
}