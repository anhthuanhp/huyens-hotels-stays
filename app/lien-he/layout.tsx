import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liên hệ Huyen's Hotels & Stays | Đặt phòng & Hỗ trợ",
  description:
    "Liên hệ Huyen's Hotels & Stays để được hỗ trợ đặt phòng, tư vấn nơi lưu trú và giải đáp thông tin về khách sạn, guesthouse và homestay tại TP.HCM.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/lien-he",
  },
  openGraph: {
    title: "Liên hệ Huyen's Hotels & Stays",
    description:
      "Liên hệ Huyen's Hotels & Stays để được hỗ trợ đặt phòng và thông tin lưu trú tại TP.HCM.",
    url: "/lien-he",
    type: "website",
  },
};

export default function LienHeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}