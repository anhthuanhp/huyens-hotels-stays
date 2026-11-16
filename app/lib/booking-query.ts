import { localizedHref } from "./localized-path";

export function bookingDetailsHref({
  hotel, rooms, stayType, checkIn, checkOut, months, adults, children, language,
}: {
  hotel: string;
  rooms: { roomSlug: string; quantity: number }[];
  stayType: "day" | "month";
  checkIn: string;
  checkOut: string;
  months: number;
  adults: number;
  children: number;
  language: "vi" | "en";
}) {
  const params = new URLSearchParams({ hotel, stayType, adults: String(adults), children: String(children), rooms: JSON.stringify(rooms) });
  if (stayType === "day") {
    params.set("checkIn", checkIn);
    params.set("checkOut", checkOut);
  } else {
    params.set("months", String(months));
  }
  return localizedHref(`/dat-phong?${params}`, language);
}
