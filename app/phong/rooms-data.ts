import { createClient } from "@supabase/supabase-js";
import type { Hotel, Room, RoomWithHotel } from "./bolt/types";

export async function getRoomsData(): Promise<{
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
      .select("id, hotel_id, slug, name_vi, name_en, description_vi, description_en, base_price_daily, base_price_monthly, size, max_guests, beds_vi, beds_en, amenities, quantity, is_featured")
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
      if (!item.entity_id || !item.public_url) continue;
      roomCovers[item.entity_id] ??= item.public_url;
    }

    return { rooms, roomCovers };
  } catch (error) {
    console.error("Rooms page: data request failed:", error);
    return { rooms: [], roomCovers: {} };
  }
}
