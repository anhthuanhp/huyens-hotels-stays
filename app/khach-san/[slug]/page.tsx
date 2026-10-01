import { notFound } from "next/navigation";
import HotelDetailClient from "./HotelDetailClient";
import {
  getCachedHotel,
  getCachedHotelList,
  getCachedHotelSlugs,
  getCachedRoomsAndFaqs,
  getCachedRoomCovers,
  type Hotel,
  type Room,
  type HotelFaq,
  type HotelListItem,
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

type ClientRoomMedia = {
  entity_id: number;
  public_url: string;
};

type StructuredRoom = {
  "@type": "Product";
  name: string;
  description?: string;
  offers?: {
    "@type": "Offer";
    priceCurrency: "VND";
    price: number;
    availability: string;
    url: string;
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
    status.trim().toLowerCase() === "active"
  );
}

function createHotelStructuredData(
  hotel: Hotel,
  rooms: ClientRoom[],
  faqs: HotelFaq[]
): Record<string, unknown> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://huyenhotels.com"
  ).replace(/\/+$/, "");

  const hotelName =
    hotel.name_vi ||
    hotel.name_en ||
    "Huyen's Hotels & Stays";

  const hotelDescription =
    hotel.description_vi ||
    hotel.description_en ||
    `Thông tin lưu trú tại ${hotelName}.`;

  const roomOffers: StructuredRoom[] =
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

        const roomData: StructuredRoom = {
          "@type": "Product",
          name: roomName,
        };

        if (roomDescription) {
          roomData.description =
            roomDescription;
        }

        if (
          typeof room.base_price === "number" &&
          Number.isFinite(room.base_price) &&
          room.base_price > 0
        ) {
          roomData.offers = {
            "@type": "Offer",
            priceCurrency: "VND",
            price: room.base_price,
            availability:
              "https://schema.org/InStock",
            url:
              `${baseUrl}/khach-san/` +
              `${hotel.slug}/phong/` +
              `${room.slug}`,
          };
        }

        return roomData;
      });

  const hotelStructuredData = {
    "@type": "Hotel",
    name: hotelName,
    description: hotelDescription,
    url:
      `${baseUrl}/khach-san/` +
      hotel.slug,
    image:
      hotel.image || undefined,

    address: {
      "@type": "PostalAddress",
      streetAddress:
        hotel.address_vi ||
        hotel.address_en ||
        undefined,
      addressLocality:
        "Ho Chi Minh City",
      addressCountry: "VN",
    },

    ...(typeof hotel.latitude === "number" &&
    typeof hotel.longitude === "number"
      ? {
          geo: {
            "@type":
              "GeoCoordinates",
            latitude:
              hotel.latitude,
            longitude:
              hotel.longitude,
          },
        }
      : {}),

    ...(roomOffers.length > 0
      ? {
          makesOffer:
            roomOffers,
        }
      : {}),
  };

  const graph: Record<
    string,
    unknown
  >[] = [
    hotelStructuredData,
  ];

  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map(
        (faq) => ({
          "@type": "Question",
          name:
            faq.question_vi,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              faq.answer_vi,
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

  return slugs.map((slug) => ({
    slug,
  }));
}

export default async function HotelDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;

  /*
   * Lấy hotel và danh sách hotel song song.
   *
   * getCachedHotel() được dùng chung với
   * generateMetadata() trong layout.tsx.
   */
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

  /*
   * Rooms và FAQ chạy song song bên trong cache.
   */
  const {
    rooms,
    faqs: hotelFaqs,
  } =
    await getCachedRoomsAndFaqs(
      hotel.id
    );

  /*
   * Chỉ lấy room đang active.
   */
  const activeRooms =
    rooms.filter((room) =>
      isActiveStatus(room.status)
    );

  /*
   * Chuẩn hóa dữ liệu room gửi xuống Client Component.
   */
  const clientRooms: ClientRoom[] =
    activeRooms.map((room) => ({
      id: room.id,
      hotel_id: room.hotel_id,
      slug: room.slug,
      name_vi: room.name_vi,
      name_en: room.name_en,
      description_vi:
        room.description_vi,
      description_en:
        room.description_en,
      image: room.image,
      size: room.size,
      max_guests:
        room.max_guests,
      beds_vi: room.beds_vi,
      beds_en: room.beds_en,
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
    }));

  /*
   * Lấy ID phòng và sort để cache key luôn ổn định.
   */
  const roomIds =
    activeRooms
      .map((room) => room.id)
      .sort(
        (a, b) => a - b
      );

  const roomIdsKey =
    roomIds.join(",");

  /*
   * Lấy ảnh cover phòng từ cache.
   */
  const roomCovers =
    await getCachedRoomCovers(
      roomIdsKey
    );

  /*
   * Structured Data / JSON-LD
   */
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
        initialHotel={hotel}
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
      />
    </>
  );
}