
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import HotelDetailClient from "./HotelDetailClient";

import {
  getCachedHotel,
  getCachedHotelList,
  getCachedHotelSlugs,
  getCachedRoomsAndFaqs,
  getCachedRoomCovers,
  getCachedHotelNearby,
  type Hotel,
  type HotelFaq,
} from "./hotel-data";

export const revalidate = 60;

type ClientRoom = {
  id: number;
  hotel_id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  image: string | null;
  size: number | null;
  max_guests: number | null;
  beds_vi: string | null;
  beds_en: string | null;
  base_price: number | null;
  quantity: number | null;
  amenities_vi: unknown;
  amenities_en: unknown;
  amenities: unknown;
  status: string | null;
};

type StructuredRoom = {
  "@type": "HotelRoom";
  "@id": string;
  identifier: string;
  name: string;
  description?: string;
  url: string;
  image?: string;
  occupancy?: {
    "@type": "QuantitativeValue";
    maxValue: number;
  };
  bed?: {
    "@type": "BedDetails";
    typeOfBed: string;
  };
  floorSize?: {
    "@type": "QuantitativeValue";
    value: number;
    unitCode: "MTK";
  };
  amenityFeature?: {
    "@type": "LocationFeatureSpecification";
    name: string;
    value: boolean;
  }[];
  offers?: {
    "@type": "Offer";
    priceCurrency: "VND";
    price: number;
    availability: string;
    url: string;
    businessFunction: string;
    priceSpecification: {
      "@type": "UnitPriceSpecification";
      price: number;
      priceCurrency: "VND";
      unitCode: "DAY";
      unitText: string;
    };
    itemOffered: {
      "@id": string;
    };
  };
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* =========================================================
   SEO CONFIG
   Chỉ phục vụ SEO metadata.
   Không ảnh hưởng dữ liệu Supabase hoặc giao diện.
========================================================= */

const HOTEL_SEO: Record<
  string,
  {
    title: string;
    keywords: string[];
    localDescription: string;
  }
> = {
  "anh-kim-hotel": {
    title:
      "Anh Kim Hotel | Gần Bùi Viện, Bến Thành & Trung tâm TP.HCM",
    keywords: [
      "Anh Kim Hotel",
      "Anh Kim Hotel TP.HCM",
      "khách sạn gần Bùi Viện",
      "khách sạn gần Bến Thành",
      "khách sạn gần Chợ Bến Thành",
      "khách sạn Cô Bắc",
      "khách sạn trung tâm TP.HCM",
      "lưu trú gần Bùi Viện",
      "lưu trú gần Bến Thành",
      "lưu trú trung tâm TP.HCM",
    ],
    localDescription:
      "thuận tiện di chuyển đến Bùi Viện, Chợ Bến Thành và các điểm tham quan tại trung tâm TP.HCM",
  },

  "ae-guesthouse": {
    title:
      "A&E Guesthouse | Gần Bùi Viện, Phạm Ngũ Lão & Bến Thành",
    keywords: [
      "A&E Guesthouse",
      "A&E Guesthouse TP.HCM",
      "guesthouse gần Bùi Viện",
      "guesthouse gần Phạm Ngũ Lão",
      "guesthouse gần Bến Thành",
      "guesthouse gần Chợ Bến Thành",
      "khách sạn gần Bùi Viện",
      "khách sạn gần Phạm Ngũ Lão",
      "lưu trú gần Bùi Viện",
      "lưu trú gần Bến Thành",
      "lưu trú trung tâm TP.HCM",
    ],
    localDescription:
      "thuận tiện di chuyển đến Bùi Viện, Phạm Ngũ Lão, Chợ Bến Thành và các điểm tham quan tại trung tâm TP.HCM",
  },

  "huyen-house": {
    title:
      "Huyen House | Gần Nguyễn Thị Minh Khai & Đại sứ quán Mỹ",
    keywords: [
      "Huyen House",
      "Huyen House TP.HCM",
      "khách sạn Nguyễn Thị Minh Khai",
      "lưu trú Nguyễn Thị Minh Khai",
      "khách sạn gần Đại sứ quán Mỹ",
      "khách sạn gần Lãnh sự quán Mỹ",
      "khách sạn gần Bến Thành",
      "khách sạn trung tâm TP.HCM",
      "lưu trú trung tâm TP.HCM",
      "chỗ ở trung tâm TP.HCM",
    ],
    localDescription:
      "nằm tại khu vực Nguyễn Thị Minh Khai, thuận tiện đến Đại sứ quán Mỹ, Chợ Bến Thành và các điểm trung tâm TP.HCM",
  },

  huyenhomestay: {
    title:
      "Huyen Homestay | Gần Nguyễn Thị Minh Khai & Đại sứ quán Mỹ",
    keywords: [
      "Huyen Homestay",
      "Huyen Homestay TP.HCM",
      "homestay Nguyễn Thị Minh Khai",
      "homestay gần Đại sứ quán Mỹ",
      "homestay gần Lãnh sự quán Mỹ",
      "homestay gần Bến Thành",
      "homestay trung tâm TP.HCM",
      "lưu trú Nguyễn Thị Minh Khai",
      "lưu trú trung tâm TP.HCM",
      "chỗ ở trung tâm TP.HCM",
    ],
    localDescription:
      "nằm tại khu vực Nguyễn Thị Minh Khai, thuận tiện đến Đại sứ quán Mỹ, Chợ Bến Thành và các điểm trung tâm TP.HCM",
  },
};

function isActiveStatus(
  status: string | null
): boolean {
  return (
    typeof status === "string" &&
    status.trim().toLowerCase() === "active"
  );
}

function getRoomAmenities(
  room: ClientRoom
): string[] {
  const source =
    room.amenities_vi ??
    room.amenities ??
    [];

  if (Array.isArray(source)) {
    return source
      .filter(
        (item): item is string =>
          typeof item === "string" &&
          item.trim().length > 0
      )
      .map((item) => item.trim());
  }

  if (typeof source === "string") {
    return source
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

/* =========================================================
   SEO IMAGE
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

/* =========================================================
   SEO DESCRIPTION
========================================================= */

function cleanDescription(
  value: string
): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .trim();
}

function truncateDescription(
  value: string,
  maxLength = 158
): string {
  const cleaned = cleanDescription(value);

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

function createHotelMetaDescription(
  hotel: Hotel,
  seoConfig?: {
    localDescription: string;
  }
): string {
  const hotelName =
    hotel.name_vi ||
    hotel.name_en ||
    "Huyen's Hotels & Stays";

  const description =
    hotel.description_vi ||
    hotel.description_en ||
    "";

  const parts = [
    description,
    seoConfig?.localDescription
      ? seoConfig.localDescription + "."
      : "",
    "Xem phòng, tiện nghi, giá và thông tin lưu trú tại TP.HCM.",
  ].filter(Boolean);

  const combined =
    parts.join(" ");

  if (combined) {
    return truncateDescription(
      combined
    );
  }

  return `Khám phá ${hotelName}, ${seoConfig?.localDescription || "tại trung tâm TP.HCM"}. Xem phòng, tiện nghi và giá lưu trú.`;
}

/* =========================================================
   STRUCTURED DATA
   Chỉ phục vụ SEO.
   Không thay đổi dữ liệu hoặc giao diện.
========================================================= */

function createHotelStructuredData(
  hotel: Hotel,
  rooms: ClientRoom[],
  faqs: HotelFaq[]
): Record<string, unknown> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://huyenhotels.com";

  const siteUrl =
    baseUrl.replace(/\/+$/, "");

  const hotelName =
    hotel.name_vi ||
    hotel.name_en ||
    "Huyen's Hotels & Stays";

  const seoConfig =
    HOTEL_SEO[hotel.slug];

  const hotelDescription =
    createHotelMetaDescription(
      hotel,
      seoConfig
    );

  const hotelUrl =
    `${siteUrl}/khach-san/${hotel.slug}`;

  const hotelImage =
    normalizeImageUrl(
      hotel.image,
      siteUrl
    );

  const roomStructuredData: StructuredRoom[] =
    rooms
      .filter((room) =>
        isActiveStatus(room.status)
      )
      .map((room) => {
        const roomName =
          room.name_vi ||
          room.name_en ||
          "Phòng lưu trú";

        const roomDescription =
          room.description_vi ||
          room.description_en ||
          undefined;

        const roomUrl =
          `${siteUrl}/khach-san/${hotel.slug}/phong/${room.slug}`;

        const roomId =
          `${roomUrl}#room`;

        const roomData: StructuredRoom = {
          "@type": "HotelRoom",
          "@id": roomId,
          identifier: String(room.id),
          name: roomName,
          url: roomUrl,
        };

        if (roomDescription) {
          roomData.description =
            roomDescription;
        }

        const roomImage =
          normalizeImageUrl(
            room.image,
            siteUrl
          );

        if (roomImage) {
          roomData.image =
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
          roomData.occupancy = {
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
          roomData.bed = {
            "@type":
              "BedDetails",
            typeOfBed:
              room.beds_vi ||
              room.beds_en ||
              "Bed",
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
          roomData.floorSize = {
            "@type":
              "QuantitativeValue",
            value: room.size,
            unitCode: "MTK",
          };
        }

        const amenities =
          getRoomAmenities(room);

        if (amenities.length > 0) {
          roomData.amenityFeature =
            amenities.map(
              (amenity) => ({
                "@type":
                  "LocationFeatureSpecification",
                name: amenity,
                value: true,
              })
            );
        }

        /*
         * Google yêu cầu Product phải có ít nhất một trong:
         * - offers
         * - review
         * - aggregateRating
         *
         * Không thay đổi cấu trúc dữ liệu phòng.
         * Schema sử dụng room.base_price hiện có.
         */
        if (
          typeof room.base_price ===
            "number" &&
          Number.isFinite(
            room.base_price
          ) &&
          room.base_price > 0
        ) {
          roomData.offers = {
            "@type": "Offer",
            priceCurrency: "VND",
            price:
              room.base_price,
            availability:
              "https://schema.org/InStock",
            url: roomUrl,
            businessFunction:
              "http://purl.org/goodrelations/v1#LeaseOut",
            priceSpecification: {
              "@type":
                "UnitPriceSpecification",
              price:
                room.base_price,
              priceCurrency:
                "VND",
              unitCode:
                "DAY",
              unitText:
                "per night",
            },
            itemOffered: {
              "@id": roomId,
            },
          };
        }

        return roomData;
      });

  const hotelStructuredData: Record<
    string,
    unknown
  > = {
    "@type": "Hotel",
    "@id":
      `${hotelUrl}#hotel`,
    name: hotelName,
    description:
      hotelDescription,
    url: hotelUrl,
    ...(hotelImage
      ? {
          image: [hotelImage],
        }
      : {}),
    address: {
      "@type":
        "PostalAddress",
      streetAddress:
        hotel.address_vi ||
        hotel.address_en ||
        undefined,
      addressCountry: "VN",
    },
  };

  if (
    typeof hotel.latitude ===
      "number" &&
    Number.isFinite(
      hotel.latitude
    ) &&
    typeof hotel.longitude ===
      "number" &&
    Number.isFinite(
      hotel.longitude
    )
  ) {
    hotelStructuredData.geo = {
      "@type":
        "GeoCoordinates",
      latitude:
        hotel.latitude,
      longitude:
        hotel.longitude,
    };
  }

  hotelStructuredData.parentOrganization = {
    "@type": "Organization",
    "@id":
      `${siteUrl}#organization`,
    name:
      "Huyen's Hotels & Stays",
    url: siteUrl,
  };

  if (
    hotel.map_url
  ) {
    hotelStructuredData.hasMap =
      hotel.map_url;
  }

  if (
    roomStructuredData.length > 0
  ) {
    hotelStructuredData.containsPlace =
      roomStructuredData;
  }

  const graph: Record<
    string,
    unknown
  >[] = [
    hotelStructuredData,
  ];

  graph.push({
    "@type":
      "BreadcrumbList",
    "@id":
      `${hotelUrl}#breadcrumb`,
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
        name: "Khách sạn",
        item:
          `${siteUrl}/phong`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: hotelName,
        item: hotelUrl,
      },
    ],
  });

  const validFaqs =
    faqs.filter(
      (faq) =>
        faq.question_vi?.trim() &&
        faq.answer_vi?.trim()
    );

  if (validFaqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id":
        `${hotelUrl}#faq`,
      mainEntity:
        validFaqs.map(
          (faq) => ({
            "@type": "Question",
            name:
              faq.question_vi.trim(),
            acceptedAnswer: {
              "@type": "Answer",
              text:
                faq.answer_vi.trim(),
            },
          })
        ),
    });
  }

  return {
    "@context":
      "https://schema.org",
    "@graph": graph,
  };
}

/* =========================================================
   SEO METADATA
========================================================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const hotel =
    await getCachedHotel(slug);

  if (!hotel) {
    return {
      title:
        "Khách sạn tại TP.HCM | Huyen's Hotels & Stays",
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
    `${siteUrl}/khach-san/${hotel.slug}`;

  const seoConfig =
    HOTEL_SEO[hotel.slug];

  const hotelName =
    hotel.name_vi ||
    hotel.name_en ||
    "Huyen's Hotels & Stays";

  const title =
    seoConfig?.title ||
    `${hotelName} | Huyen's Hotels & Stays`;

  const description =
    createHotelMetaDescription(
      hotel,
      seoConfig
    );

  const keywords =
    seoConfig?.keywords ||
    [
      hotelName,
      "khách sạn TP.HCM",
      "khách sạn trung tâm TP.HCM",
      "khách sạn gần Bến Thành",
      "lưu trú TP.HCM",
      "Huyen's Hotels & Stays",
    ];

  const image =
    normalizeImageUrl(
      hotel.image,
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
      ...(image
        ? {
            images: [
              {
                url: image,
                alt: hotelName,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image
        ? {
            images: [image],
          }
        : {}),
    },
  };
}

export async function generateStaticParams() {
  const slugs =
    await getCachedHotelSlugs();

  return slugs.map(
    (slug) => ({
      slug,
    })
  );
}

export default async function HotelDetailPage({
  params,
}: PageProps) {
  const { slug } =
    await params;

  const [
    hotel,
    initialHotels,
  ] = await Promise.all([
    getCachedHotel(slug),
    getCachedHotelList(),
  ]);

  if (!hotel) {
    notFound();
  }

  const [
    roomsAndFaqs,
    nearby,
  ] = await Promise.all([
    getCachedRoomsAndFaqs(
      hotel.id
    ),
    getCachedHotelNearby(
      hotel.id
    ),
  ]);

  const {
    rooms,
    faqs: hotelFaqs,
  } = roomsAndFaqs;

  const activeRooms =
    rooms.filter((room) =>
      isActiveStatus(
        room.status
      )
    );

  const clientRooms: ClientRoom[] =
    activeRooms.map(
      (room) => ({
        id: room.id,
        hotel_id:
          room.hotel_id,
        slug: room.slug,
        name_vi:
          room.name_vi,
        name_en:
          room.name_en,
        description_vi:
          room.description_vi,
        description_en:
          room.description_en,
        image:
          room.image,
        size:
          room.size,
        max_guests:
          room.max_guests,
        beds_vi:
          room.beds_vi,
        beds_en:
          room.beds_en,
        base_price:
          room.base_price,
        quantity:
          room.quantity,
        amenities_vi:
          room.amenities_vi,
        amenities_en:
          room.amenities_en,
        amenities:
          room.amenities,
        status:
          room.status,
      })
    );

  const roomIds =
    activeRooms
      .map(
        (room) =>
          room.id
      )
      .sort(
        (a, b) => a - b
      );

  const roomIdsKey =
    roomIds.join(",");

  const roomCovers =
    await getCachedRoomCovers(
      roomIdsKey
    );

  const structuredData =
    createHotelStructuredData(
      hotel,
      clientRooms,
      hotelFaqs
    );

  return (
    <>
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

      <HotelDetailClient
        initialHotel={
          hotel
        }
        initialRooms={
          clientRooms
        }
        initialRoomCovers={
          roomCovers
        }
        initialHotels={
          initialHotels
        }
        initialFaqs={
          hotelFaqs
        }
        initialNearby={
          nearby
        }
      />
    </>
  );
}
