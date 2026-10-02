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
  "@type": ["HotelRoom", "Product"];
  "@id": string;
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

function isActiveStatus(
  status: string | null
): boolean {
  return (
    typeof status === "string" &&
    status.trim().toLowerCase() ===
      "active"
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
      .map((item) =>
        item.trim()
      );
  }

  if (typeof source === "string") {
    return source
      .split(",")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  }

  return [];
}

function createHotelStructuredData(
  hotel: Hotel,
  rooms: ClientRoom[],
  faqs: HotelFaq[]
): Record<string, unknown> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://huyenhotels.com";

  const hotelName =
    hotel.name_vi ||
    hotel.name_en ||
    "Huyen's Hotels & Stays";

  const hotelDescription =
    hotel.description_vi ||
    hotel.description_en ||
    "Thông tin lưu trú tại " +
      hotelName +
      ".";

  const hotelUrl =
    baseUrl +
    "/khach-san/" +
    hotel.slug;

  const roomStructuredData: StructuredRoom[] =
    rooms
      .filter((room) =>
        isActiveStatus(
          room.status
        )
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
          baseUrl +
          "/khach-san/" +
          hotel.slug +
          "/phong/" +
          room.slug;

        const roomId =
          roomUrl + "#room";

        const roomData: StructuredRoom = {
          "@type": [
            "HotelRoom",
            "Product",
          ],
          "@id": roomId,
          name: roomName,
          url: roomUrl,
        };

        if (roomDescription) {
          roomData.description =
            roomDescription;
        }

        if (room.image) {
          roomData.image =
            room.image;
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
      hotelUrl + "#hotel",
    name: hotelName,
    description:
      hotelDescription,
    url: hotelUrl,
    image:
      hotel.image || undefined,
    address: {
      "@type":
        "PostalAddress",
      streetAddress:
        hotel.address_vi ||
        hotel.address_en ||
        undefined,
      addressLocality:
        "Ho Chi Minh City",
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
      hotelUrl +
      "#breadcrumb",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Khách sạn",
        item:
          baseUrl +
          "/phong",
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
        hotelUrl + "#faq",
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