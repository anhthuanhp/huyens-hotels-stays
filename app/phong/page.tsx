import { createClient } from "@supabase/supabase-js";
import RoomsClient from "./RoomsClient";

export const revalidate = 60;

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string | null;
  address_en: string | null;
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
  size: number | null;
  max_guests: number | null;
  beds_vi: string | null;
  beds_en: string | null;
  amenities: unknown;
  quantity: number | null;
};

type RoomWithHotel = {
  room: Room;
  hotel: Hotel;
};

async function getRoomsData(): Promise<{
  rooms: RoomWithHotel[];
  roomCovers: Record<number, string>;
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.error("Rooms page: Supabase environment variables are missing.");
    return { rooms: [], roomCovers: {} };
  }

  try {
    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data: hotels, error: hotelsError } = await supabase
      .from("hotels")
      .select("id, slug, name_vi, name_en, address_vi, address_en")
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (hotelsError) {
      console.error("Rooms page: failed to load hotels:", hotelsError);
      return { rooms: [], roomCovers: {} };
    }

    const activeHotels = (hotels ?? []) as Hotel[];
    if (activeHotels.length === 0) {
      return { rooms: [], roomCovers: {} };
    }

    const hotelIds = activeHotels.map((hotel) => hotel.id);
    const { data: roomData, error: roomsError } = await supabase
      .from("rooms")
      .select("id, hotel_id, slug, name_vi, name_en, description_vi, description_en, base_price_daily, base_price_monthly, size, max_guests, beds_vi, beds_en, amenities, quantity")
      .in("hotel_id", hotelIds)
      .eq("status", "active")
      .order("hotel_id", { ascending: true })
      .order("id", { ascending: true });

    if (roomsError) {
      console.error("Rooms page: failed to load rooms:", roomsError);
      return { rooms: [], roomCovers: {} };
    }

    const hotelsById = new Map(activeHotels.map((hotel) => [hotel.id, hotel]));
    const activeRooms = (roomData ?? []) as Room[];
    const rooms = activeRooms.flatMap((room) => {
      const hotel = hotelsById.get(room.hotel_id);
      return hotel ? [{ room, hotel }] : [];
    });

    const roomIds = activeRooms.map((room) => room.id);
    if (roomIds.length === 0) {
      return { rooms, roomCovers: {} };
    }

    const { data: media, error: mediaError } = await supabase
      .from("media")
      .select("entity_id, public_url, is_cover, sort_order")
      .eq("entity_type", "room")
      .in("entity_id", roomIds)
      .eq("status", "active")
      .order("is_cover", { ascending: false })
      .order("sort_order", { ascending: true });

    if (mediaError) {
      console.error("Rooms page: failed to load room images:", mediaError);
      return { rooms, roomCovers: {} };
    }

    const roomCovers: Record<number, string> = {};
    for (const item of media ?? []) {
      if (item.entity_id && item.public_url && !roomCovers[item.entity_id]) {
        roomCovers[item.entity_id] = item.public_url;
      }
    }

    return { rooms, roomCovers };
  } catch (error) {
    console.error("Rooms page: data request failed:", error);
    return { rooms: [], roomCovers: {} };
  }
}

export default async function RoomsPage() {
  const { rooms, roomCovers } = await getRoomsData();
  return <RoomsClient rooms={rooms} roomCovers={roomCovers} />;
}
