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
    "Huyen's Hotels & Stays";

  const address =
    cleanText(hotel.address_vi);

  let result = roomDescription;

  if (!result) {
    result =
      `${roomName} tại ${hotelName}${
        address ? `, ${address}` : ""
      }. Đặt phòng trực tiếp tại Huyen's Hotels & Stays.`;
  } else {
    if (!result.includes(hotelName)) {
      result = `${result} ${hotelName}.`;
    }

    if (
      address &&
      !result.includes(address)
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

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { slug, roomSlug } = await params;

  const siteBaseUrl =
    siteUrl.replace(/\/$/, "");

  const canonicalUrl =
    `${siteBaseUrl}/khach-san/${slug}/phong/${roomSlug}`;

  if (!supabaseUrl || !supabaseKey) {
    return {
      title:
        "Phòng nghỉ | Huyen's Hotels & Stays",

      description:
        "Thông tin phòng nghỉ tại Huyen's Hotels & Stays.",

      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseKey
  );

  const { data: hotel } = await supabase
    .from("hotels")
    .select(
      "id, slug, name_vi, name_en, address_vi, address_en, image, status"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!hotel) {
    return {
      title:
        "Không tìm thấy khách sạn | Huyen's Hotels & Stays",

      robots: {
        index: false,
        follow: true,
      },

      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const hotelData =
    hotel as unknown as HotelSEO;

  const { data: room } = await supabase
    .from("rooms")
    .select(
      "id, hotel_id, slug, name_vi, name_en, description_vi, description_en, image, base_price, status"
    )
    .eq("hotel_id", hotelData.id)
    .eq("slug", roomSlug)
    .eq("status", "active")
    .maybeSingle();

  if (!room) {
    return {
      title:
        "Không tìm thấy phòng | Huyen's Hotels & Stays",

      robots: {
        index: false,
        follow: true,
      },

      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const roomData =
    room as unknown as RoomSEO;

  const { data: media } = await supabase
    .from("media")
    .select(
      "public_url, alt_vi, alt_en, is_cover, sort_order"
    )
    .eq("entity_type", "room")
    .eq("entity_id", roomData.id)
    .eq("status", "active")
    .order("is_cover", {
      ascending: false,
    })
    .order("sort_order", {
      ascending: true,
    });

  const roomNameVi =
    cleanText(roomData.name_vi) ||
    cleanText(roomData.name_en) ||
    "Phòng nghỉ";

  const roomNameEn =
    cleanText(roomData.name_en) ||
    roomNameVi;

  const hotelNameVi =
    cleanText(hotelData.name_vi) ||
    cleanText(hotelData.name_en) ||
    "Khách sạn";

  const description =
    createRoomDescription(
      roomData,
      hotelData
    );

  const title =
    `${roomNameVi} tại ${hotelNameVi} | Huyen's Hotels & Stays`;

  const englishTitle =
    `${roomNameEn} at ${
      cleanText(hotelData.name_en) ||
      hotelNameVi
    } | Huyen's Hotels & Stays`;

  const coverMedia =
    (media as unknown as MediaSEO[] | null)?.[0];

  const imageUrl =
    coverMedia?.public_url ||
    roomData.image ||
    hotelData.image ||
    undefined;

  const imageAlt =
    cleanText(
      coverMedia?.alt_vi
    ) ||
    roomNameVi;

  return {
    title,

    description,

    keywords: [
      roomNameVi,
      roomNameEn,
      `${roomNameVi} ${hotelNameVi}`,
      `${roomNameVi} Quận 1`,
      `${roomNameVi} TP.HCM`,
      "phòng khách sạn Quận 1",
      "phòng khách sạn TP.HCM",
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
      title,
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

function RoomStructuredData({
  room,
  hotel,
  imageUrl,
  canonicalUrl,
}: {
  room: RoomSEO;
  hotel: HotelSEO;
  imageUrl?: string;
  canonicalUrl: string;
}) {
  const roomName =
    cleanText(room.name_vi) ||
    cleanText(room.name_en) ||
    "Phòng nghỉ";

  const roomDescription =
    cleanText(room.description_vi) ||
    cleanText(room.description_en) ||
    `${roomName} tại ${
      cleanText(hotel.name_vi) ||
      cleanText(hotel.name_en) ||
      "Huyen's Hotels & Stays"
    }.`;

  const hotelName =
    cleanText(hotel.name_vi) ||
    cleanText(hotel.name_en) ||
    "Khách sạn";

  const hotelUrl =
    `${siteUrl.replace(/\/$/, "")}/khach-san/${hotel.slug}`;

  const roomSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",

    "@id": `${canonicalUrl}#room`,

    name: roomName,

    url: canonicalUrl,

    description: roomDescription,

    containedInPlace: {
      "@type": "Hotel",
      "@id": `${hotelUrl}#hotel`,
      name: hotelName,
      url: hotelUrl,
    },

    publisher: {
      "@type": "Organization",
      name: "Huyen's Hotels & Stays",
      url: siteUrl,
    },
  };

  if (imageUrl) {
    roomSchema.image = [imageUrl];
  }

  if (
    room.base_price !== null &&
    Number.isFinite(Number(room.base_price)) &&
    Number(room.base_price) > 0
  ) {
    roomSchema.offers = {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "VND",
      price: Number(room.base_price),
      availability:
        "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Huyen's Hotels & Stays",
        url: siteUrl,
      },
    };
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",

    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: hotelName,
        item: hotelUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: roomName,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(roomSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              breadcrumbSchema
            ),
        }}
      />
    </>
  );
}

export default async function RoomSlugLayout({
  children,
  params,
}: LayoutProps) {
  const { slug, roomSlug } = await params;

  let structuredDataRoom:
    RoomSEO | null = null;

  let structuredDataHotel:
    HotelSEO | null = null;

  let structuredDataImage:
    string | undefined;

  if (
    supabaseUrl &&
    supabaseKey
  ) {
    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    );

    const { data: hotel } =
      await supabase
        .from("hotels")
        .select(
          "id, slug, name_vi, name_en, address_vi, address_en, image, status"
        )
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();

    if (hotel) {
      structuredDataHotel =
        hotel as unknown as HotelSEO;

      const { data: room } =
        await supabase
          .from("rooms")
          .select(
            "id, hotel_id, slug, name_vi, name_en, description_vi, description_en, image, base_price, status"
          )
          .eq(
            "hotel_id",
            structuredDataHotel.id
          )
          .eq("slug", roomSlug)
          .eq("status", "active")
          .maybeSingle();

      if (room) {
        structuredDataRoom =
          room as unknown as RoomSEO;

        const { data: media } =
          await supabase
            .from("media")
            .select(
              "public_url, alt_vi, alt_en, is_cover, sort_order"
            )
            .eq(
              "entity_type",
              "room"
            )
            .eq(
              "entity_id",
              structuredDataRoom.id
            )
            .eq(
              "status",
              "active"
            )
            .order("is_cover", {
              ascending: false,
            })
            .order("sort_order", {
              ascending: true,
            });

        const mediaData =
          media as unknown as
            | MediaSEO[]
            | null;

        const coverMedia =
          mediaData?.[0];

        structuredDataImage =
          coverMedia?.public_url ||
          structuredDataRoom.image ||
          structuredDataHotel.image ||
          undefined;
      }
    }
  }

  const canonicalUrl =
    `${siteUrl.replace(/\/$/, "")}/khach-san/${slug}/phong/${roomSlug}`;

  return (
    <>
      {structuredDataRoom &&
        structuredDataHotel && (
          <RoomStructuredData
            room={structuredDataRoom}
            hotel={structuredDataHotel}
            imageUrl={structuredDataImage}
            canonicalUrl={canonicalUrl}
          />
        )}

      {children}
    </>
  );
}