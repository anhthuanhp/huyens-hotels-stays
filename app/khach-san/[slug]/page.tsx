
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import HotelDetailClient from "./HotelDetailClient";

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string | null;
  address_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  map_url: string | null;
};

type Room = {
  id: number;
  hotel_id: number;
  slug: string;
  name_vi: string;
  name_en: string;
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
  status: string;
};

type RoomMedia = {
  entity_id: number;
  public_url: string;
};

function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Thiếu biến môi trường Supabase.");
  }

  return createClient(supabaseUrl, supabaseKey);
}

function createHotelStructuredData(
  hotel: Hotel,
  rooms: Room[]
) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://huyenhotels.com";

  const cleanSiteUrl = siteUrl.replace(/\/+$/, "");

  const hotelUrl = `${cleanSiteUrl}/khach-san/${hotel.slug}`;

  const structuredRooms = rooms.map((room) => {
    const roomData: Record<string, unknown> = {
      "@type": "Room",
      "@id": `${hotelUrl}/phong/${room.slug}`,
      name: room.name_vi,
      description:
        room.description_vi || undefined,
      url: `${hotelUrl}/phong/${room.slug}`,
    };

    if (
      room.base_price !== null &&
      Number.isFinite(Number(room.base_price))
    ) {
      roomData.offers = {
        "@type": "Offer",
        price: Number(room.base_price),
        priceCurrency: "VND",
        url: `${hotelUrl}/phong/${room.slug}`,
      };
    }

    if (room.max_guests !== null) {
      roomData.occupancy = {
        "@type": "QuantitativeValue",
        maxValue: room.max_guests,
      };
    }

    return roomData;
  });

  const totalRooms = rooms.reduce((total, room) => {
    const quantity = Number(room.quantity);

    if (Number.isFinite(quantity) && quantity > 0) {
      return total + quantity;
    }

    return total;
  }, 0);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `${hotelUrl}#lodgingbusiness`,
    name: hotel.name_vi,
    url: hotelUrl,
    description:
      hotel.description_vi ||
      `Thông tin ${hotel.name_vi}`,
    address: {
      "@type": "PostalAddress",
      streetAddress:
        hotel.address_vi || undefined,
      addressLocality: "Ho Chi Minh City",
      addressCountry: "VN",
    },
  };

  if (totalRooms > 0) {
    data.numberOfRooms = totalRooms;
  }

  if (hotel.map_url) {
    data.hasMap = hotel.map_url;
  }

  if (structuredRooms.length > 0) {
    data.containsPlace = structuredRooms;
  }

  return data;
}

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const supabase = getSupabaseServerClient();

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
        map_url
      `
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (hotelError || !hotelData) {
    notFound();
  }

  const hotel = hotelData as Hotel;

  const {
    data: roomData,
    error: roomError,
  } = await supabase
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
    });

  if (roomError) {
    console.error(
      "Lỗi lấy danh sách phòng:",
      roomError
    );
  }

  const rooms = (roomData || []) as Room[];

  let roomCovers: RoomMedia[] = [];

  if (rooms.length > 0) {
    const roomIds = rooms.map(
      (room) => room.id
    );

    const {
      data: mediaData,
      error: mediaError,
    } = await supabase
      .from("media")
      .select("entity_id, public_url")
      .eq("entity_type", "room")
      .eq("is_cover", true)
      .eq("status", "active")
      .in("entity_id", roomIds);

    if (mediaError) {
      console.error(
        "Lỗi lấy ảnh cover phòng:",
        mediaError
      );
    } else {
      roomCovers =
        (mediaData || []) as RoomMedia[];
    }
  }

  const structuredData =
    createHotelStructuredData(
      hotel,
      rooms
    );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData
          ),
        }}
      />

      <HotelDetailClient
        initialHotel={hotel}
        initialRooms={rooms}
        initialRoomCovers={roomCovers}
      />
    </>
  );
}
