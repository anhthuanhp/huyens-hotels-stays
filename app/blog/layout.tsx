import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenstays.vercel.app";

const canonicalUrl = `${siteUrl.replace(/\/+$/, "")}/blog`;

export const metadata: Metadata = {
  title: "Blog du lịch TP.HCM | Huyen's Hotels & Stays",

  description:
    "Khám phá những câu chuyện về TP.HCM, ẩm thực, con người, địa điểm và những hành trình đáng nhớ trên Blog của Huyen's Hotels & Stays.",

  keywords: [
    "blog du lịch TP.HCM",
    "blog du lịch Hồ Chí Minh",
    "kinh nghiệm du lịch TP.HCM",
    "du lịch Quận 1",
    "ẩm thực TP.HCM",
    "địa điểm du lịch TP.HCM",
    "trải nghiệm TP.HCM",
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
    title: "Blog du lịch TP.HCM | Huyen's Hotels & Stays",
    description:
      "Khám phá những câu chuyện về TP.HCM, ẩm thực, con người, địa điểm và những hành trình đáng nhớ.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Blog du lịch TP.HCM | Huyen's Hotels & Stays",
    description:
      "Câu chuyện, cảm hứng và kinh nghiệm khám phá TP.HCM.",
  },
};

export default function BlogLayout({
  children,
}: LayoutProps) {
  return children;
}
