import type { Lang, RoomWithHotel } from "./bolt/types";

export function filterRooms(
  rooms: RoomWithHotel[],
  hotelId: number | "all",
  beds = "",
  priceBand = "",
  lang: Lang = "vi",
) {
  return rooms.filter(({ hotel, room }) => {
    if (hotelId !== "all" && hotel.id !== hotelId) return false;
    if (beds && roomBedKey(room, lang) !== beds) return false;
    if (!priceBand) return true;
    const price = room.base_price_daily;
    if (!price || price <= 0) return false;
    if (priceBand === "under-500") return price < 500_000;
    if (priceBand === "500-800") return price >= 500_000 && price <= 800_000;
    return price > 800_000;
  });
}

export function roomBedKey(room: RoomWithHotel["room"], lang: Lang) {
  const [preferred, fallback] = lang === "vi" ? [room.beds_vi, room.beds_en] : [room.beds_en, room.beds_vi];
  return preferred?.trim() || fallback?.trim() || "";
}
