import RoomDetailClient from "./RoomDetailClient";
import { supabase } from "../../../../lib/supabase";

export const revalidate = 60;

type Props = {
  params: Promise<{
    slug: string;
    roomSlug: string;
  }>;
};

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
  business_model: "daily" | "monthly" | string | null;
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
  amenity_catalog?: AmenityCatalog | AmenityCatalog[] | null;
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
  const { slug, roomSlug } = await params;

  let hotel: Hotel | null = null;
  let room: Room | null = null;
  let media: Media[] = [];
  let roomAmenities: RoomAmenity[] = [];

  let errorCode: ErrorCode = "";

  try {
    /*
     * 1. HOTEL
     *
     * Chỉ lấy những cột thực sự dùng.
     */
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
      errorCode = "hotel-not-found";
    } else {
      hotel = hotelData as Hotel;
    }

    /*
     * 2. ROOM
     */
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
        errorCode = "room-not-found";
      } else {
        room = roomData as Room;
      }
    }

    /*
     * 3. MEDIA + AMENITIES
     *
     * Hai query này chạy song song.
     */
    if (room) {
      const [
        mediaResult,
        amenityResult,
      ] = await Promise.all([
        supabase
          .from("media")
          .select(MEDIA_SELECT)
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
          }),

        supabase
          .from("room_amenities")
          .select(AMENITY_SELECT)
          .eq("room_id", room.id)
          .eq("status", "active")
          .order("sort_order", {
            ascending: true,
          })
          .order("id", {
            ascending: true,
          }),
      ]);

      if (mediaResult.error) {
        console.error(
          "Media query error:",
          mediaResult.error
        );

        errorCode = "load-error";
      } else {
        media =
          (mediaResult.data ?? []) as Media[];
      }

      if (amenityResult.error) {
        console.error(
          "Room amenities query error:",
          amenityResult.error
        );

        errorCode = "load-error";
      } else {
        roomAmenities =
          (amenityResult.data ??
            []) as RoomAmenity[];
      }
    }
  } catch (error) {
    console.error(
      "Room detail server error:",
      error
    );

    errorCode = "load-error";
  }

  return (
    <RoomDetailClient
      slug={slug}
      hotel={hotel}
      room={room}
      media={media}
      roomAmenities={roomAmenities}
      errorCode={errorCode}
    />
  );
}