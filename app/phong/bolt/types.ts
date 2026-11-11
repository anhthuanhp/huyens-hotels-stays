export type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string | null;
  address_en: string | null;
};

export type Room = {
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

export type RoomWithHotel = {
  room: Room;
  hotel: Hotel;
};

export type Lang = 'vi' | 'en';

export type RoomsClientProps = {
  rooms: RoomWithHotel[];
  roomCovers: Record<number, string>;
  /** Optional: when the global VI/EN switcher is wired in Next.js, pass the active language here. Defaults to 'vi'. */
  lang?: Lang;
};
