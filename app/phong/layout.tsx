
import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenstays.vercel.app";

const canonicalUrl =
  `${siteUrl.replace(/\/+$/, "")}/phong`;

export const metadata: Metadata = {
  title:
    "Phòng khách sạn, Guesthouse & Homestay TP.HCM | Huyen's Hotels & Stays",

  description:
    "Khám phá các loại phòng khách sạn, guesthouse và homestay tại TP.HCM. Xem giá phòng, diện tích, sức chứa, giường và tiện nghi trước khi đặt phòng.",

  keywords: [
    "phòng khách sạn TP.HCM",
    "phòng khách sạn Hồ Chí Minh",
    "phòng hotel TP.HCM",
    "phòng guesthouse TP.HCM",
    "phòng homestay TP.HCM",
    "đặt phòng khách sạn TP.HCM",
    "phòng khách sạn Quận 1",
    "phòng guesthouse Quận 1",
    "phòng homestay Quận 1",
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
      "Phòng khách sạn, Guesthouse & Homestay TP.HCM | Huyen's Hotels & Stays",

    description:
      "Khám phá các loại phòng tại Huyen's Hotels & Stays ở TP.HCM. Xem giá, diện tích, sức chứa và tiện nghi phòng trước khi đặt.",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Phòng khách sạn, Guesthouse & Homestay TP.HCM | Huyen's Hotels & Stays",

    description:
      "Khám phá các loại phòng tại Huyen's Hotels & Stays và tìm không gian phù hợp cho chuyến đi của bạn.",
  },
};

export default function RoomsLayout({
  children,
}: LayoutProps) {
  return children;
}
