import type { Metadata } from "next";
import {
  getCachedHotel,
  type Hotel,
} from "./hotel-data";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenhotels.com";

const siteName =
  "Huyen's Hotels & Stays";

function cleanText(
  value: string | null | undefined
): string {
  if (!value) return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLocationText(
  value: string
): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .trim();
}

function createDescription(
  hotel: Hotel
): string {
  const description =
    cleanText(
      hotel.description_vi
    );

  const address =
    cleanText(
      hotel.address_vi
    );

  const name =
    cleanText(hotel.name_vi) ||
    cleanText(hotel.name_en) ||
    siteName;

  let result = description;

  if (!result) {
    result =
      `${name} tại ${
        address ||
        "TP. Hồ Chí Minh"
      }. Khám phá phòng nghỉ tiện nghi và đặt phòng trực tiếp tại Huyen's Hotels & Stays.`;
  } else if (
    address &&
    !result
      .toLowerCase()
      .includes(
        address.toLowerCase()
      )
  ) {
    result =
      `${result} ${address}.`;
  }

  if (result.length > 160) {
    result =
      `${result
        .slice(0, 157)
        .trim()}...`;
  }

  return result;
}

function createLocationKeywords(
  address: string
): string[] {
  const normalized =
    normalizeLocationText(
      address
    );

  if (!normalized) {
    return [
      "khách sạn TP.HCM",
      "khách sạn Hồ Chí Minh",
      "hotel Ho Chi Minh",
      "guesthouse TP.HCM",
      "homestay TP.HCM",
    ];
  }

  const keywords = new Set<string>();

  keywords.add(normalized);
  keywords.add(
    `khách sạn ${normalized}`
  );
  keywords.add(
    `hotel ${normalized}`
  );

  const lower =
    normalized.toLowerCase();

  if (
    lower.includes("quận 1") ||
    lower.includes("quan 1") ||
    lower.includes("q.1") ||
    lower.includes("q1")
  ) {
    keywords.add(
      "khách sạn Quận 1"
    );
    keywords.add(
      "hotel Quận 1"
    );
    keywords.add(
      "khách sạn trung tâm Quận 1"
    );
    keywords.add(
      "khách sạn TP.HCM"
    );
  }

  if (
    lower.includes("bến thành") ||
    lower.includes("ben thanh")
  ) {
    keywords.add(
      "khách sạn Bến Thành"
    );
    keywords.add(
      "hotel Bến Thành"
    );
    keywords.add(
      "guesthouse Bến Thành"
    );
  }

  if (
    lower.includes("phạm ngũ lão") ||
    lower.includes("pham ngu lao")
  ) {
    keywords.add(
      "khách sạn Phạm Ngũ Lão"
    );
    keywords.add(
      "guesthouse Phạm Ngũ Lão"
    );
    keywords.add(
      "hotel Phạm Ngũ Lão"
    );
  }

  if (
    lower.includes("đỗ quang đẩu") ||
    lower.includes("do quang dau")
  ) {
    keywords.add(
      "khách sạn Đỗ Quang Đẩu"
    );
    keywords.add(
      "guesthouse Đỗ Quang Đẩu"
    );
    keywords.add(
      "hotel Đỗ Quang Đẩu"
    );
  }

  if (
    lower.includes("cô bắc") ||
    lower.includes("co bac")
  ) {
    keywords.add(
      "khách sạn Cô Bắc"
    );
    keywords.add(
      "hotel Cô Bắc"
    );
  }

  keywords.add(
    "khách sạn TP.HCM"
  );
  keywords.add(
    "khách sạn Hồ Chí Minh"
  );
  keywords.add(
    "guesthouse TP.HCM"
  );
  keywords.add(
    "homestay TP.HCM"
  );

  return Array.from(keywords);
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { slug } = await params;

  const cleanSiteUrl =
    siteUrl.replace(/\/+$/, "");

  const canonicalUrl =
    `${cleanSiteUrl}/khach-san/${slug}`;

  const hotel =
    await getCachedHotel(slug);

  if (!hotel) {
    return {
      title:
        `Không tìm thấy khách sạn | ${siteName}`,
      description:
        "Không tìm thấy thông tin cơ sở lưu trú này.",
      alternates: {
        canonical:
          canonicalUrl,
      },
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const nameVi =
    cleanText(hotel.name_vi) ||
    cleanText(hotel.name_en) ||
    "Khách sạn";

  const address =
    cleanText(
      hotel.address_vi
    );

  const description =
    createDescription(hotel);

  let title =
    `${nameVi} | ${siteName}`;

  if (address) {
    const shortAddress =
      address.length > 35
        ? address
            .slice(0, 35)
            .trim()
        : address;

    const candidate =
      `${nameVi} | ${shortAddress} | ${siteName}`;

    if (candidate.length <= 65) {
      title = candidate;
    }
  }

  const keywords = [
    nameVi,
    cleanText(hotel.name_en),
    address,
    ...createLocationKeywords(
      address
    ),
    siteName,
  ].filter(Boolean);

  const uniqueKeywords =
    Array.from(
      new Set(keywords)
    );

  const images = hotel.image
    ? [
        {
          url: hotel.image,
          alt:
            `${nameVi} - ${siteName}`,
        },
      ]
    : undefined;

  return {
    title,
    description,
    keywords:
      uniqueKeywords,

    alternates: {
      canonical:
        canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview":
          "large",
        "max-snippet": -1,
        "max-video-preview":
          -1,
      },
    },

    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: canonicalUrl,
      siteName,
      title:
        `${nameVi} | ${siteName}`,
      description,
      images,
    },

    twitter: {
      card: hotel.image
        ? "summary_large_image"
        : "summary",
      title:
        `${nameVi} | ${siteName}`,
      description,
      images: hotel.image
        ? [hotel.image]
        : undefined,
    },
  };
}

export default async function HotelSlugLayout({
  children,
}: LayoutProps) {
  return <>{children}</>;
}