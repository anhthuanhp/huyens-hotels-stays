import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
};

type HotelSEO = {
  slug: string;
  name_vi: string | null;
  name_en: string | null;
  address_vi: string | null;
  address_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  image: string | null;
  status: string | null;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenstays.vercel.app";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

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
  hotel: HotelSEO
): string {
  const description = cleanText(
    hotel.description_vi
  );

  const address = cleanText(
    hotel.address_vi
  );

  const name =
    cleanText(hotel.name_vi) ||
    cleanText(hotel.name_en) ||
    "Huyen's Hotels & Stays";

  let result = description;

  if (!result) {
    result =
      `${name} tại ${
        address || "TP. Hồ Chí Minh"
      }. Khám phá phòng nghỉ tiện nghi và đặt phòng trực tiếp tại Huyen's Hotels & Stays.`;
  } else if (
    address &&
    !result
      .toLowerCase()
      .includes(address.toLowerCase())
  ) {
    result = `${result} ${address}.`;
  }

  if (result.length > 160) {
    result =
      `${result.slice(0, 157).trim()}...`;
  }

  return result;
}

function createLocationKeywords(
  address: string
): string[] {
  const normalized =
    normalizeLocationText(address);

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
  keywords.add(`khách sạn ${normalized}`);
  keywords.add(`hotel ${normalized}`);

  const lower =
    normalized.toLowerCase();

  if (
    lower.includes("quận 1") ||
    lower.includes("quan 1") ||
    lower.includes("q.1") ||
    lower.includes("q1")
  ) {
    keywords.add("khách sạn Quận 1");
    keywords.add("hotel Quận 1");
    keywords.add("khách sạn trung tâm Quận 1");
    keywords.add("khách sạn TP.HCM");
  }

  if (
    lower.includes("bến thành") ||
    lower.includes("ben thanh")
  ) {
    keywords.add("khách sạn Bến Thành");
    keywords.add("hotel Bến Thành");
    keywords.add("guesthouse Bến Thành");
  }

  if (
    lower.includes("phạm ngũ lão") ||
    lower.includes("pham ngu lao")
  ) {
    keywords.add("khách sạn Phạm Ngũ Lão");
    keywords.add("guesthouse Phạm Ngũ Lão");
    keywords.add("hotel Phạm Ngũ Lão");
  }

  if (
    lower.includes("đỗ quang đẩu") ||
    lower.includes("do quang dau")
  ) {
    keywords.add("khách sạn Đỗ Quang Đẩu");
    keywords.add("guesthouse Đỗ Quang Đẩu");
  }

  if (
    lower.includes("cô bắc") ||
    lower.includes("co bac")
  ) {
    keywords.add("khách sạn Cô Bắc");
    keywords.add("hotel Cô Bắc");
  }

  keywords.add("khách sạn TP.HCM");
  keywords.add("khách sạn Hồ Chí Minh");
  keywords.add("guesthouse TP.HCM");
  keywords.add("homestay TP.HCM");

  return Array.from(keywords);
}

async function getHotel(
  slug: string
): Promise<HotelSEO | null> {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseKey
  );

  const { data: hotel } =
    await supabase
      .from("hotels")
      .select(
        "slug, name_vi, name_en, address_vi, address_en, description_vi, description_en, image, status"
      )
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

  return hotel
    ? (hotel as HotelSEO)
    : null;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { slug } = await params;

  const cleanSiteUrl =
    siteUrl.replace(/\/+$/, "");

  const canonicalUrl =
    `${cleanSiteUrl}/khach-san/${slug}`;

  if (!supabaseUrl || !supabaseKey) {
    return {
      title: "Khách sạn",
      description:
        "Khách sạn, guesthouse và homestay tại TP. Hồ Chí Minh. Đặt phòng trực tiếp tại Huyen's Hotels & Stays.",
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const hotel =
    await getHotel(slug);

  if (!hotel) {
    return {
      title: "Không tìm thấy khách sạn",
      description:
        "Không tìm thấy thông tin cơ sở lưu trú này.",
      alternates: {
        canonical: canonicalUrl,
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

  const nameEn =
    cleanText(hotel.name_en) ||
    nameVi;

  const address =
    cleanText(hotel.address_vi);

  const description =
    createDescription(hotel);

  /*
   * Root layout có title template:
   *
   * "%s | Huyen's Hotels & Stays"
   *
   * Vì vậy layout khách sạn chỉ trả về
   * phần title chính.
   */
  const titleLocation =
    address
      ? ` | ${address}`
      : " | TP.HCM";

  let title =
    `${nameVi}${titleLocation}`;

  /*
   * Giữ tổng title sau khi root layout
   * thêm thương hiệu trong khoảng hợp lý.
   */
  if (
    `${title} | Huyen's Hotels & Stays`.length >
    65
  ) {
    title = nameVi;
  }

  const englishTitle =
    `${nameEn} | Huyen's Hotels & Stays`;

  const keywords = [
    nameVi,
    nameEn,
    address,
    ...createLocationKeywords(address),
    "Huyen's Hotels & Stays",
  ].filter(Boolean);

  const uniqueKeywords =
    Array.from(new Set(keywords));

  const images = hotel.image
    ? [
        {
          url: hotel.image,
          alt:
            `${nameVi} - Huyen's Hotels & Stays`,
        },
      ]
    : undefined;

  return {
    title,
    description,
    keywords: uniqueKeywords,

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
      siteName:
        "Huyen's Hotels & Stays",
      title:
        `${nameVi} | Huyen's Hotels & Stays`,
      description,
      images,
    },

    twitter: {
      card: hotel.image
        ? "summary_large_image"
        : "summary",

      title: englishTitle,
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
  /*
   * Không render BreadcrumbList ở layout này.
   *
   * Lý do:
   * /khach-san/[slug]/phong/[roomSlug]
   * cũng nằm bên trong layout này.
   *
   * Nếu BreadcrumbList được render tại đây,
   * trang phòng sẽ nhận thêm một BreadcrumbList
   * của trang khách sạn, dẫn tới duplicate structured data.
   *
   * Breadcrumb của trang phòng được xử lý riêng
   * trong:
   * app/khach-san/[slug]/phong/[roomSlug]/layout.tsx
   */
  return <>{children}</>;
}