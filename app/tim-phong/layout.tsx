import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenstays.vercel.app";

export const metadata: Metadata = {
  title: "Tìm phòng | Huyen's Hotels & Stays",

  description:
    "Tìm phòng khách sạn, guesthouse và homestay tại Huyen's Hotels & Stays.",

  alternates: {
    canonical: `${siteUrl.replace(/\/$/, "")}/tim-phong`,
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
    url: `${siteUrl.replace(/\/$/, "")}/tim-phong`,
    siteName: "Huyen's Hotels & Stays",
    title: "Tìm phòng | Huyen's Hotels & Stays",
    description:
      "Tìm phòng khách sạn, guesthouse và homestay tại Huyen's Hotels & Stays.",
  },
};

export default function TimPhongLayout({
  children,
}: LayoutProps) {
  return children;
}