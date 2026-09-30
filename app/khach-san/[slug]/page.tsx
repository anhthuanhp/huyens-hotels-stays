
import { notFound } from "next/navigation";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import HotelDetailClient from "./HotelDetailClient";

type Hotel = {
  id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
  address_vi: string | null;
  address_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  image: string | null;
  status: string | null;
  business_model: string | null;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
  nearby_vi: string | null;
  nearby_en: string | null;
};

type Room = {
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

type RoomMedia = {
  id: number;
  entity_id: number | null;
  public_url: string | null;
  sort_order: number | null;
};

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

type HotelListItem = {
  id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
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

function getSupabaseServerClient(): SupabaseClient {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return createClient(
    supabaseUrl,
    supabaseKey
  );
}

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
  rooms: ClientRoom[]
): Record<string, unknown> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://huyenhotels.com").replace(/\/+$/, "");

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
            url: `${baseUrl}/khach-san/${hotel.slug}/phong/${room.slug}`,
          };
        }

        return roomData;
      });

  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotelName,
    description: hotelDescription,
    url: `${baseUrl}/khach-san/${hotel.slug}`,
    image: hotel.image || undefined,

    address: {
      "@type": "PostalAddress",
      streetAddress:
        hotel.address_vi ||
        hotel.address_en ||
        undefined,
      addressLocality: "Ho Chi Minh City",
      addressCountry: "VN",
    },

    ...(typeof hotel.latitude === "number" &&
    typeof hotel.longitude === "number"
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: hotel.latitude,
            longitude: hotel.longitude,
          },
        }
      : {}),

    ...(roomOffers.length > 0
      ? {
          makesOffer: roomOffers,
        }
      : {}),
  };
}

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function HotelDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const supabase =
    getSupabaseServerClient();

  /*
   * ============================================================
   * 1. LẤY THÔNG TIN KHÁCH SẠN
   * ============================================================
   */

  const {
    data: hotelData,
    error: hotelError,
  } = await supabase
    .from("hotels")
    .select(
      `
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
        business_model,
        latitude,
        longitude,
        map_url,
        nearby_vi,
        nearby_en
      `
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (hotelError) {
    console.error(
      "Lỗi lấy thông tin khách sạn:",
      hotelError
    );

    notFound();
  }

  if (!hotelData) {
    notFound();
  }

  const hotel =
    hotelData as Hotel;

  /*
   * ============================================================
   * 2 + 3. LẤY DANH SÁCH KHÁCH SẠN + PHÒNG SONG SONG
   * ============================================================
   */

  const [
    hotelListResult,
    roomsResult,
  ] = await Promise.all([
    supabase
      .from("hotels")
      .select(
        "id, slug, name_vi, name_en"
      )
      .eq("status", "active")
      .order("id", {
        ascending: true,
      }),

    supabase
      .from("rooms")
      .select(
        `
          id,
          hotel_id,
          slug,
          name_vi,
          name_en,
          description_vi,
          description_en,
          image,
          size,
          max_guests,
          beds_vi,
          beds_en,
          base_price,
          quantity,
          amenities_vi,
          amenities_en,
          amenities,
          status
        `
      )
      .eq("hotel_id", hotel.id)
      .eq("status", "active")
      .order("id", {
        ascending: true,
      }),
  ]);

  /*
   * ============================================================
   * 2. XỬ LÝ DANH SÁCH KHÁCH SẠN
   * CHO SIDEBAR TÌM PHÒNG
   * ============================================================
   */

  const {
    data: hotelListData,
    error: hotelListError,
  } = hotelListResult;

  if (hotelListError) {
    console.error(
      "Lỗi lấy danh sách khách sạn:",
      hotelListError
    );
  }

  const initialHotels: HotelListItem[] =
    (hotelListData || []).map(
      (item) => ({
        id: item.id,
        slug: item.slug,
        name_vi: item.name_vi,
        name_en: item.name_en,
      })
    );

  /*
   * ============================================================
   * 3. XỬ LÝ PHÒNG
   * ============================================================
   */

  const {
    data: roomsData,
    error: roomsError,
  } = roomsResult;

  if (roomsError) {
    console.error(
      "LỖI LẤY PHÒNG TỪ SUPABASE:",
      roomsError
    );
  }

  const rooms =
    (roomsData || []) as Room[];

  const activeRooms =
    rooms.filter((room) =>
      isActiveStatus(room.status)
    );

  /*
   * ============================================================
   * 4. CHUYỂN PHÒNG SANG FORMAT CHO CLIENT
   * ============================================================
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
   * ============================================================
   * 5. LẤY ẢNH COVER CỦA PHÒNG
   * ============================================================
   */

  const roomIds =
    activeRooms.map(
      (room) => room.id
    );

  let roomCovers: ClientRoomMedia[] =
    [];

  if (roomIds.length > 0) {
    const {
      data: mediaData,
      error: mediaError,
    } = await supabase
      .from("media")
      .select(
        `
          id,
          entity_id,
          public_url,
          sort_order
        `
      )
      .in(
        "entity_id",
        roomIds
      )
      .order("sort_order", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      });

    if (mediaError) {
      console.error(
        "Lỗi lấy ảnh phòng:",
        mediaError
      );
    }

    const mediaRows =
      (mediaData || []) as RoomMedia[];

    const coverMap =
      new Map<number, string>();

    for (const media of mediaRows) {
      if (
        typeof media.entity_id !==
          "number" ||
        !media.public_url ||
        coverMap.has(
          media.entity_id
        )
      ) {
        continue;
      }

      coverMap.set(
        media.entity_id,
        media.public_url
      );
    }

    roomCovers =
      Array.from(
        coverMap.entries()
      ).map(
        ([entity_id, public_url]) => ({
          entity_id,
          public_url,
        })
      );
  }

  /*
   * ============================================================
   * 6. STRUCTURED DATA / SEO
   * ============================================================
   */

  const structuredData =
    createHotelStructuredData(
      hotel,
      clientRooms
    );

  /*
   * ============================================================
   * 7. RENDER
   * ============================================================
   */

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <HotelDetailClient
        initialHotel={hotel}
        initialRooms={clientRooms}
        initialRoomCovers={
          roomCovers
        }
        initialHotels={
          initialHotels
        }
      />
    </>
  );
}
