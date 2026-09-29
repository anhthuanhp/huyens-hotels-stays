
import RoomDetailClient from "./RoomDetailClient";
import { supabase } from "../../../../lib/supabase";

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

  // Giá theo từng hình thức ở
  base_price_daily: number | null;
  base_price_monthly: number | null;

  // Giữ lại base_price để tương thích dữ liệu cũ
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

export default async function RoomDetailPage({
  params,
}: Props) {
  const { slug, roomSlug } = await params;

  let hotel: Hotel | null = null;
  let room: Room | null = null;
  let media: Media[] = [];
  let roomAmenities: RoomAmenity[] = [];

  let errorCode:
    | "hotel-not-found"
    | "room-not-found"
    | "load-error"
    | "" = "";

  try {
    const { data: hotelData, error: hotelError } =
      await supabase
        .from("hotels")
        .select("*")
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

    if (hotel) {
      const { data: roomData, error: roomError } =
        await supabase
          .from("rooms")
          .select("*")
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

    if (room) {
      const [
        {
          data: mediaData,
          error: mediaError,
        },
        {
          data: amenityData,
          error: amenityError,
        },
      ] = await Promise.all([
        supabase
          .from("media")
          .select("*")
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
          .select(`
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
          `)
          .eq("room_id", room.id)
          .eq("status", "active")
          .order("sort_order", {
            ascending: true,
          })
          .order("id", {
            ascending: true,
          }),
      ]);

      if (mediaError) {
        console.error(
          "Media query error:",
          mediaError
        );
        errorCode = "load-error";
      } else {
        media = (mediaData ?? []) as Media[];
      }

      if (amenityError) {
        console.error(
          "Room amenities query error:",
          amenityError
        );
        errorCode = "load-error";
      } else {
        roomAmenities =
          (amenityData ?? []) as RoomAmenity[];
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
