import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
    roomSlug: string;
  }>;
};

type RoomSEO = {
  id: number;
  hotel_id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  image: string | null;
  base_price: number | null;
  size: number | null;
  max_guests: number | null;
  beds_vi: string | null;
  beds_en: string | null;
  status: string | null;
};

type HotelSEO = {
  id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
  address_vi: string | null;
  address_en: string | null;
  image: string | null;
  status: string | null;
};

type MediaSEO = {
  public_url: string | null;
  alt_vi: string | null;
  alt_en: string | null;
  is_cover: boolean;
  sort_order: number;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenhotels.com";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const brandName =
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

function createRoomDescription(
  room: RoomSEO,
  hotel: HotelSEO
): string {
  const roomDescription =
    cleanText(room.description_vi);

  const roomName =
    cleanText(room.name_vi) ||
    cleanText(room.name_en) ||
    "Phòng nghỉ";

  const hotelName =
    cleanText(hotel.name_vi) ||
    cleanText(hotel.name_en) ||
    brandName;

  const address =
    cleanText(hotel.address_vi);

  let result = roomDescription;

  if (!result) {
    const details: string[] = [];

    if (room.size !== null) {
      details.push(`${room.size} m²`);
    }

    if (room.max_guests !== null) {
      details.push(
        `tối đa ${room.max_guests} khách`
      );
    }

    if (room.beds_vi) {
      details.push(room.beds_vi);
    }

    const roomDetails =
      details.length > 0
        ? ` ${details.join(", ")}.`
        : "";

    result =
      `${roomName} tại ${hotelName}.${roomDetails} Đặt phòng trực tiếp tại ${brandName}.`;
  } else {
    if (
      hotelName &&
      !result
        .toLowerCase()
        .includes(hotelName.toLowerCase())
    ) {
      result = `${result} ${hotelName}.`;
    }

    if (
      address &&
      !result
        .toLowerCase()
        .includes(address.toLowerCase())
    ) {
      result = `${result} ${address}.`;
    }
  }

  if (result.length > 160) {
    result =
      `${result.slice(0, 157).trim()}...`;
  }

  return result;
}

function createRoomKeywords(
  room: RoomSEO,
  hotel: HotelSEO
): string[] {
  const keywords = new Set<string>();

  const roomNameVi =
    cleanText(room.name_vi);

  const roomNameEn =
    cleanText(room.name_en);

  const hotelNameVi =
    cleanText(hotel.name_vi);

  const hotelNameEn =
    cleanText(hotel.name_en);

  const address =
    normalizeLocationText(
      cleanText(hotel.address_vi)
    );

  if (roomNameVi) {
    keywords.add(roomNameVi);
    keywords.add(`phòng ${roomNameVi}`);
  }

  if (roomNameEn) {
    keywords.add(roomNameEn);
    keywords.add(`room ${roomNameEn}`);
  }

  if (hotelNameVi) {
    keywords.add(hotelNameVi);
  }

  if (hotelNameEn) {
    keywords.add(hotelNameEn);
  }

  if (address) {
    keywords.add(address);

    keywords.add(
      `phòng khách sạn ${address}`
    );

    keywords.add(
      `hotel room ${address}`
    );
  }

  const lowerAddress =
    address.toLowerCase();

  if (
    lowerAddress.includes("quận 1") ||
    lowerAddress.includes("quan 1") ||
    lowerAddress.includes("q.1") ||
    lowerAddress.includes("q1")
  ) {
    keywords.add(
      "phòng khách sạn Quận 1"
    );

    keywords.add(
      "hotel room Quận 1"
    );

    keywords.add(
      "phòng nghỉ Quận 1"
    );

    keywords.add(
      "khách sạn Quận 1"
    );
  }

  if (
    lowerAddress.includes("bến thành") ||
    lowerAddress.includes("ben thanh")
  ) {
    keywords.add(
      "phòng khách sạn Bến Thành"
    );

    keywords.add(
      "hotel room Bến Thành"
    );

    keywords.add(
      "phòng nghỉ Bến Thành"
    );
  }

  if (
    lowerAddress.includes("phạm ngũ lão") ||
    lowerAddress.includes("pham ngu lao")
  ) {
    keywords.add(
      "phòng khách sạn Phạm Ngũ Lão"
    );

    keywords.add(
      "hotel room Phạm Ngũ Lão"
    );
  }

  if (
    lowerAddress.includes("đỗ quang đẩu") ||
    lowerAddress.includes("do quang dau")
  ) {
    keywords.add(
      "phòng khách sạn Đỗ Quang Đẩu"
    );

    keywords.add(
      "guesthouse room Đỗ Quang Đẩu"
    );
  }

  if (
    lowerAddress.includes("cô bắc") ||
    lowerAddress.includes("co bac")
  ) {
    keywords.add(
      "phòng khách sạn Cô Bắc"
    );

    keywords.add(
      "hotel room Cô Bắc"
    );
  }

  keywords.add(
    "phòng khách sạn TP.HCM"
  );

  keywords.add(
    "phòng nghỉ TP.HCM"
  );

  keywords.add(
    "hotel room Ho Chi Minh"
  );

  keywords.add(brandName);

  return Array.from(keywords);
}

async function getRoomSEOData(
  slug: string,
  roomSlug: string
) {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseKey
  );

  const {
    data: hotel,
    error: hotelError,
  } = await supabase
    .from("hotels")
    .select(
      "id, slug, name_vi, name_en, address_vi, address_en, image, status"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (hotelError || !hotel) {
    return null;
  }

  const {
    data: room,
    error: roomError,
  } = await supabase
    .from("rooms")
    .select(
      "id, hotel_id, slug, name_vi, name_en, description_vi, description_en, image, base_price, size, max_guests, beds_vi, beds_en, status"
    )
    .eq("hotel_id", hotel.id)
    .eq("slug", roomSlug)
    .eq("status", "active")
    .maybeSingle();

  if (roomError || !room) {
    return null;
  }

  const { data: media } =
    await supabase
      .from("media")
      .select(
        "public_url, alt_vi, alt_en, is_cover, sort_order"
      )
      .eq("entity_type", "room")
      .eq("entity_id", room.id)
      .eq("status", "active")
      .order("is_cover", {
        ascending: false,
      })
      .order("sort_order", {
        ascending: true,
      });

  return {
    hotel: hotel as HotelSEO,
    room: room as RoomSEO,
    media: (media ?? []) as MediaSEO[],
  };
}

function createBreadcrumbStructuredData(
  hotel: HotelSEO,
  room: RoomSEO,
  siteBaseUrl: string
) {
  const hotelName =
    cleanText(hotel.name_vi) ||
    cleanText(hotel.name_en) ||
    "Khách sạn";

  const roomName =
    cleanText(room.name_vi) ||
    cleanText(room.name_en) ||
    "Phòng nghỉ";

  const hotelUrl =
    `${siteBaseUrl}/khach-san/${hotel.slug}`;

  const roomUrl =
    `${hotelUrl}/phong/${room.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${roomUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteBaseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Khách sạn",
        item: `${siteBaseUrl}/phong`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: hotelName,
        item: hotelUrl,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: roomName,
        item: roomUrl,
      },
    ],
  };
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { slug, roomSlug } =
    await params;

  const siteBaseUrl =
    siteUrl.replace(/\/+$/, "");

  const canonicalUrl =
    `${siteBaseUrl}/khach-san/${slug}/phong/${roomSlug}`;

  const data =
    await getRoomSEOData(
      slug,
      roomSlug
    );

  if (!data) {
    return {
      title:
        `Phòng nghỉ | ${brandName}`,

      description:
        "Thông tin phòng nghỉ tại Huyen's Hotels & Stays.",

      alternates: {
        canonical: canonicalUrl,
      },

      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const {
    hotel,
    room,
    media,
  } = data;

  const roomNameVi =
    cleanText(room.name_vi) ||
    cleanText(room.name_en) ||
    "Phòng nghỉ";

  const roomNameEn =
    cleanText(room.name_en) ||
    roomNameVi;

  const hotelNameVi =
    cleanText(hotel.name_vi) ||
    cleanText(hotel.name_en) ||
    "Khách sạn";

  const hotelNameEn =
    cleanText(hotel.name_en) ||
    hotelNameVi;

  const description =
    createRoomDescription(
      room,
      hotel
    );

  /*
   * Title room được tạo hoàn chỉnh tại đây.
   *
   * Không phụ thuộc vào title.template
   * của root layout.
   *
   * Mục tiêu:
   * Phòng Standard Double |
   * Khách sạn Anh Kim |
   * Huyen's Hotels & Stays
   */

  const fullTitle =
    `${roomNameVi} | ${hotelNameVi} | ${brandName}`;

  /*
   * Nếu title quá dài, bỏ phần thương hiệu
   * khỏi title cuối cùng để tránh title quá dài.
   */
  const title =
    fullTitle.length <= 65
      ? fullTitle
      : `${roomNameVi} | ${hotelNameVi}`;

  const englishTitle =
    `${roomNameEn} at ${hotelNameEn} | ${brandName}`;

  const keywords =
    createRoomKeywords(
      room,
      hotel
    );

  const coverMedia =
    media?.[0];

  const imageUrl =
    coverMedia?.public_url ||
    room.image ||
    hotel.image ||
    undefined;

  const imageAlt =
    cleanText(
      coverMedia?.alt_vi
    ) ||
    `${roomNameVi} - ${hotelNameVi}`;

  return {
    title,

    description,

    keywords,

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
      siteName: brandName,

      title: fullTitle,

      description,

      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: imageAlt,
            },
          ]
        : undefined,
    },

    twitter: {
      card: imageUrl
        ? "summary_large_image"
        : "summary",

      title: englishTitle,

      description,

      images: imageUrl
        ? [imageUrl]
        : undefined,
    },

    other: {
      "hotel-name": hotelNameVi,
      "room-name": roomNameVi,
    },
  };
}

export default async function RoomSlugLayout({
  children,
  params,
}: LayoutProps) {
  const { slug, roomSlug } =
    await params;

  const data =
    await getRoomSEOData(
      slug,
      roomSlug
    );

  let structuredData:
    | Record<string, unknown>
    | null = null;

  let breadcrumbData:
    | Record<string, unknown>
    | null = null;

  if (data) {
    const {
      hotel,
      room,
      media,
    } = data;

    const siteBaseUrl =
      siteUrl.replace(/\/+$/, "");

    const roomUrl =
      `${siteBaseUrl}/khach-san/${slug}/phong/${roomSlug}`;

    const hotelUrl =
      `${siteBaseUrl}/khach-san/${slug}`;

    const roomName =
      cleanText(room.name_vi) ||
      cleanText(room.name_en) ||
      "Phòng nghỉ";

    const hotelName =
      cleanText(hotel.name_vi) ||
      cleanText(hotel.name_en) ||
      "Khách sạn";

    const roomDescription =
      createRoomDescription(
        room,
        hotel
      );

    const roomImages =
      media
        .filter(
          (item) =>
            Boolean(item.public_url)
        )
        .map(
          (item) =>
            item.public_url as string
        );

    if (
      roomImages.length === 0 &&
      room.image
    ) {
      roomImages.push(room.image);
    }

    if (
      roomImages.length === 0 &&
      hotel.image
    ) {
      roomImages.push(hotel.image);
    }

    structuredData = {
      "@context":
        "https://schema.org",

      "@type": "HotelRoom",

      "@id": `${roomUrl}#room`,

      name: roomName,

      url: roomUrl,

      description:
        roomDescription,

      containedInPlace: {
        "@type": "Hotel",
        "@id": `${hotelUrl}#hotel`,
        name: hotelName,
        url: hotelUrl,
      },
    };

    if (roomImages.length > 0) {
      structuredData.image =
        roomImages;
    }

    if (hotel.address_vi) {
      structuredData.address = {
        "@type":
          "PostalAddress",

        streetAddress:
          cleanText(
            hotel.address_vi
          ),

        addressLocality:
          "Ho Chi Minh City",

        addressCountry: "VN",
      };
    }

    if (room.size !== null) {
      structuredData.floorSize = {
        "@type":
          "QuantitativeValue",

        value: room.size,

        unitCode: "MTK",
      };
    }

    if (room.max_guests !== null) {
      structuredData.occupancy = {
        "@type":
          "QuantitativeValue",

        maxValue:
          room.max_guests,
      };
    }

    if (
      room.beds_vi ||
      room.beds_en
    ) {
      structuredData.bed =
        cleanText(
          room.beds_vi ||
            room.beds_en
        );
    }

    if (
      room.base_price !== null
    ) {
      structuredData.offers = {
        "@type": "Offer",

        priceCurrency: "VND",

        price: room.base_price,

        availability:
          "https://schema.org/InStock",

        url: roomUrl,
      };
    }

    breadcrumbData =
      createBreadcrumbStructuredData(
        hotel,
        room,
        siteBaseUrl
      );
  }

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                structuredData
              ).replace(
                /</g,
                "\\u003c"
              ),
          }}
        />
      )}

      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                breadcrumbData
              ).replace(
                /</g,
                "\\u003c"
              ),
          }}
        />
      )}

      {children}
    </>
  );
}