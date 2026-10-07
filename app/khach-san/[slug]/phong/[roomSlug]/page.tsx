import RoomDetailClient from "./RoomDetailClient";
import { supabase } from "../../../../lib/supabase";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = {
  params: Promise<{
    slug: string;
    roomSlug: string;
  }>;
};

/* =========================================================
   SEO HELPERS
========================================================= */

function normalizeImageUrl(
  image: string | null | undefined,
  siteUrl: string
): string | undefined {
  if (!image) {
    return undefined;
  }

  const value = image.trim();

  if (!value) {
    return undefined;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${siteUrl}${value}`;
  }

  return `${siteUrl}/${value}`;
}

function cleanText(
  value: string | null | undefined
): string {
  return (value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateDescription(
  value: string,
  maxLength = 158
): string {
  const cleaned = cleanText(value);

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const shortened =
    cleaned.slice(0, maxLength - 1);

  const lastSpace =
    shortened.lastIndexOf(" ");

  return (
    shortened.slice(
      0,
      lastSpace > 80
        ? lastSpace
        : shortened.length
    ) + "…"
  );
}

/* =========================================================
   SEO METADATA
   Chỉ bổ sung SEO, không thay đổi luồng dữ liệu hiện tại.
========================================================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
    roomSlug: string;
  }>;
}): Promise<Metadata> {
  const { slug, roomSlug } = await params;

  const { data: hotel } = await supabase
    .from("hotels")
    .select(
      "id, name_vi, name_en, address_vi, address_en"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!hotel) {
    return {
      title: "Không tìm thấy phòng | Huyen's Hotels & Stays",
      description:
        "Thông tin phòng không tồn tại hoặc khách sạn không còn hoạt động.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { data: room } = await supabase
    .from("rooms")
    .select(
      `
        id,
        name_vi,
        name_en,
        description_vi,
        description_en,
        base_price_daily,
        size,
        max_guests
      `
    )
    .eq("hotel_id", hotel.id)
    .eq("slug", roomSlug)
    .eq("status", "active")
    .maybeSingle();

  if (!room) {
    return {
      title: `${hotel.name_vi} — Phòng không tồn tại`,
      description:
        "Phòng bạn tìm không có hoặc đã ngừng kinh doanh.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://huyenhotels.com";

  const siteUrl =
    baseUrl.replace(/\/+$/, "");

  const canonicalUrl =
    `${siteUrl}/khach-san/${slug}/phong/${roomSlug}`;

  const hotelName =
    cleanText(
      hotel.name_vi ||
        hotel.name_en
    ) ||
    "Huyen's Hotels & Stays";

  const roomName =
    cleanText(
      room.name_vi ||
        room.name_en
    ) ||
    "Phòng lưu trú";

  const roomDescription =
    cleanText(
      room.description_vi ||
        room.description_en
    );

  const priceText =
    typeof room.base_price_daily ===
      "number" &&
    Number.isFinite(
      room.base_price_daily
    ) &&
    room.base_price_daily > 0
      ? `Từ ${new Intl.NumberFormat(
          "vi-VN",
          {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
          }
        ).format(
          room.base_price_daily
        )}/đêm`
      : "";

  const sizeText =
    typeof room.size === "number" &&
    Number.isFinite(room.size) &&
    room.size > 0
      ? `${room.size}m²`
      : "";

  const guestText =
    typeof room.max_guests ===
      "number" &&
    Number.isFinite(
      room.max_guests
    ) &&
    room.max_guests > 0
      ? `${room.max_guests} khách`
      : "";

  const addressText =
    cleanText(
      hotel.address_vi ||
        hotel.address_en
    );

  const locationText =
    addressText ||
    "trung tâm TP.HCM";

  const title =
    `${roomName} | ${hotelName} | Huyen's Hotels & Stays`;

  const descriptionParts = [
    roomDescription,
    priceText,
    sizeText,
    guestText,
    `Lưu trú tại ${locationText}.`,
    "Xem phòng và đặt trực tiếp.",
  ].filter(Boolean);

  const description =
    truncateDescription(
      descriptionParts.join(" ")
    );

  /*
   * SEO keywords.
   *
   * Không sử dụng "Quận 1".
   * Ưu tiên tên phòng, tên khách sạn,
   * Bùi Viện/Bến Thành/trung tâm TP.HCM
   * khi phù hợp.
   */
  const keywords = [
    roomName,
    `${roomName} ${hotelName}`,
    hotelName,
    `phòng khách sạn ${hotelName}`,
    `đặt phòng ${hotelName}`,
    "phòng khách sạn TP.HCM",
    "khách sạn trung tâm TP.HCM",
    "lưu trú trung tâm TP.HCM",
    "đặt phòng khách sạn TP.HCM",
  ];

  const imageResult =
    await supabase
      .from("media")
      .select(
        "public_url, alt_vi, alt_en"
      )
      .eq("entity_type", "room")
      .eq("entity_id", room.id)
      .eq("status", "active")
      .order("is_cover", {
        ascending: false,
      })
      .order("sort_order", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

  const roomImage =
    normalizeImageUrl(
      imageResult.data?.public_url,
      siteUrl
    );

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
        "max-image-preview":
          "large",
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
      title,
      description,
      ...(roomImage
        ? {
            images: [
              {
                url: roomImage,
                alt:
                  imageResult.data
                    ?.alt_vi ||
                  imageResult.data
                    ?.alt_en ||
                  `${roomName} - ${hotelName}`,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(roomImage
        ? {
            images: [roomImage],
          }
        : {}),
    },
  };
}

/* =========================================================
   TYPES
========================================================= */

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string | null;
  address_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  image: string | null;
  status: "active" | "inactive";
  business_model:
    | "daily"
    | "monthly"
    | string
    | null;
};

type Room = {
  id: number;
  hotel_id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  description_vi: string | null;
  description_en: string | null;
  base_price_daily: number | null;
  base_price_monthly: number | null;
  base_price: number | null;
  quantity: number | null;
  size: number | null;
  max_guests: number | null;
  beds_vi: string | null;
  beds_en: string | null;
  status: "active" | "inactive";
};

type Media = {
  id: number;
  bucket: string;
  path: string;
  file_name: string;
  public_url: string;
  entity_type: string;
  entity_id: number | null;
  alt_vi: string | null;
  alt_en: string | null;
  is_cover: boolean;
  sort_order: number;
  status: "active" | "inactive";
};

type AmenityCatalog = {
  id: number;
  name_vi: string;
  name_en: string;
  icon: string | null;
};

type RoomAmenity = {
  id: number;
  room_id: number;
  amenity_id: number | null;
  name_vi: string;
  name_en: string;
  icon: string | null;
  sort_order: number;
  status: "active" | "inactive";
  amenity_catalog?:
    | AmenityCatalog
    | AmenityCatalog[]
    | null;
};

type ErrorCode =
  | "hotel-not-found"
  | "room-not-found"
  | "load-error"
  | "";

const HOTEL_SELECT = `
  id,
  slug,
  name_vi,
  name_en,
  address_vi,
  address_en,
  description_vi,
  description_en,
  image,
  status,
  business_model
`;

const ROOM_SELECT = `
  id,
  hotel_id,
  slug,
  name_vi,
  name_en,
  description_vi,
  description_en,
  base_price_daily,
  base_price_monthly,
  base_price,
  quantity,
  size,
  max_guests,
  beds_vi,
  beds_en,
  status
`;

const MEDIA_SELECT = `
  id,
  bucket,
  path,
  file_name,
  public_url,
  entity_type,
  entity_id,
  alt_vi,
  alt_en,
  is_cover,
  sort_order,
  status
`;

const AMENITY_SELECT = `
  id,
  room_id,
  amenity_id,
  name_vi,
  name_en,
  icon,
  sort_order,
  status,
  amenity_catalog (
    id,
    name_vi,
    name_en,
    icon
  )
`;

export async function generateStaticParams() {
  const { data, error } = await supabase
    .from("rooms")
    .select(`
      slug,
      hotel_id,
      hotels!inner (
        slug
      )
    `)
    .eq("status", "active");

  if (error || !data) {
    console.error(
      "Room generateStaticParams error:",
      error
    );
    return [];
  }

  return data.flatMap((item) => {
    const hotel = Array.isArray(item.hotels)
      ? item.hotels[0]
      : item.hotels;

    if (!hotel?.slug || !item.slug) {
      return [];
    }

    return [
      {
        slug: hotel.slug,
        roomSlug: item.slug,
      },
    ];
  });
}

export default async function RoomDetailPage({
  params,
}: Props) {
  const { slug, roomSlug } =
    await params;

  let hotel: Hotel | null = null;
  let room: Room | null = null;
  let media: Media[] = [];
  let roomAmenities: RoomAmenity[] = [];
  let errorCode: ErrorCode = "";

  try {
    const {
      data: hotelData,
      error: hotelError,
    } = await supabase
      .from("hotels")
      .select(HOTEL_SELECT)
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (hotelError) {
      console.error(
        "Hotel query error:",
        hotelError
      );
      errorCode = "load-error";
    } else if (!hotelData) {
      errorCode =
        "hotel-not-found";
    } else {
      hotel = hotelData as Hotel;
    }

    if (hotel) {
      const {
        data: roomData,
        error: roomError,
      } = await supabase
        .from("rooms")
        .select(ROOM_SELECT)
        .eq("hotel_id", hotel.id)
        .eq("slug", roomSlug)
        .eq("status", "active")
        .maybeSingle();

      if (roomError) {
        console.error(
          "Room query error:",
          roomError
        );
        errorCode = "load-error";
      } else if (!roomData) {
        errorCode =
          "room-not-found";
      } else {
        room = roomData as Room;
      }
    }

    if (room) {
      const [
        mediaResult,
        amenityResult,
      ] = await Promise.all([
        supabase
          .from("media")
          .select(MEDIA_SELECT)
          .eq(
            "entity_type",
            "room"
          )
          .eq(
            "entity_id",
            room.id
          )
          .eq(
            "status",
            "active"
          )
          .order(
            "is_cover",
            {
              ascending: false,
            }
          )
          .order(
            "sort_order",
            {
              ascending: true,
            }
          )
          .order(
            "id",
            {
              ascending: true,
            }
          ),

        supabase
          .from("room_amenities")
          .select(
            AMENITY_SELECT
          )
          .eq(
            "room_id",
            room.id
          )
          .eq(
            "status",
            "active"
          )
          .order(
            "sort_order",
            {
              ascending: true,
            }
          )
          .order(
            "id",
            {
              ascending: true,
            }
          ),
      ]);

      if (mediaResult.error) {
        console.error(
          "Media query error:",
          mediaResult.error
        );
        errorCode =
          "load-error";
      } else {
        media =
          (mediaResult.data ??
            []) as Media[];
      }

      if (amenityResult.error) {
        console.error(
          "Room amenities error:",
          amenityResult.error
        );
        errorCode =
          "load-error";
      } else {
        roomAmenities =
          (amenityResult.data ??
            []) as RoomAmenity[];
      }
    }
  } catch (err) {
    console.error(
      "Room detail server error:",
      err
    );
    errorCode =
      "load-error";
  }

  /* =======================================================
     SEO STRUCTURED DATA
     Chỉ thêm schema, không thay đổi giao diện.
  ======================================================= */

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://huyenhotels.com";

  const siteUrl =
    baseUrl.replace(/\/+$/, "");

  let structuredData:
    | Record<string, unknown>
    | null = null;

  if (hotel && room) {
    const hotelName =
      cleanText(
        hotel.name_vi ||
          hotel.name_en
      );

    const roomName =
      cleanText(
        room.name_vi ||
          room.name_en
      );

    const roomUrl =
      `${siteUrl}/khach-san/${slug}/phong/${roomSlug}`;

    const roomImage =
      media.length > 0
        ? normalizeImageUrl(
            media[0].public_url,
            siteUrl
          )
        : undefined;

    const roomDescription =
      cleanText(
        room.description_vi ||
          room.description_en
      );

    const roomSchema: Record<
      string,
      unknown
    > = {
      "@type": [
        "HotelRoom",
        "Product",
      ],
      "@id":
        roomUrl + "#room",
      name: roomName,
      description:
        roomDescription ||
        `${roomName} tại ${hotelName}.`,
      url: roomUrl,
    };

    if (roomImage) {
      roomSchema.image =
        roomImage;
    }

    if (
      typeof room.max_guests ===
        "number" &&
      Number.isFinite(
        room.max_guests
      ) &&
      room.max_guests > 0
    ) {
      roomSchema.occupancy = {
        "@type":
          "QuantitativeValue",
        maxValue:
          room.max_guests,
      };
    }

    if (
      typeof room.size ===
        "number" &&
      Number.isFinite(
        room.size
      ) &&
      room.size > 0
    ) {
      roomSchema.floorSize = {
        "@type":
          "QuantitativeValue",
        value: room.size,
        unitCode: "MTK",
      };
    }

    if (
      room.beds_vi ||
      room.beds_en
    ) {
      roomSchema.bed = {
        "@type":
          "BedDetails",
        typeOfBed:
          room.beds_vi ||
          room.beds_en ||
          "Bed",
      };
    }

    if (
      typeof room.base_price_daily ===
        "number" &&
      Number.isFinite(
        room.base_price_daily
      ) &&
      room.base_price_daily > 0
    ) {
      roomSchema.offers = {
        "@type": "Offer",
        priceCurrency: "VND",
        price:
          room.base_price_daily,
        availability:
          "https://schema.org/InStock",
        url: roomUrl,
      };
    }

    structuredData = {
      "@context":
        "https://schema.org",
      "@graph": [
        {
          "@type": "Hotel",
          "@id":
            `${siteUrl}/khach-san/${slug}#hotel`,
          name: hotelName,
          url:
            `${siteUrl}/khach-san/${slug}`,
        },
        roomSchema,
        {
          "@type":
            "BreadcrumbList",
          "@id":
            roomUrl +
            "#breadcrumb",
          itemListElement: [
            {
              "@type":
                "ListItem",
              position: 1,
              name:
                "Trang chủ",
              item: siteUrl,
            },
            {
              "@type":
                "ListItem",
              position: 2,
              name:
                "Khách sạn",
              item:
                `${siteUrl}/phong`,
            },
            {
              "@type":
                "ListItem",
              position: 3,
              name:
                hotelName,
              item:
                `${siteUrl}/khach-san/${slug}`,
            },
            {
              "@type":
                "ListItem",
              position: 4,
              name:
                roomName,
              item: roomUrl,
            },
          ],
        },
      ],
    };
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

      <RoomDetailClient
        slug={slug}
        hotel={hotel}
        room={room}
        media={media}
        roomAmenities={
          roomAmenities
        }
        errorCode={errorCode}
      />
    </>
  );
}