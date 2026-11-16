"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { BedDouble, Maximize, Users } from "lucide-react";
import Link from "./LocalizedLink";
import type { BookingDraft } from "./BookingSearch";
import { filterRooms, roomBedKey } from "../phong/room-filters";
import { roomDetailPath } from "../phong/bolt/RoomCard";
import type { Lang, RoomWithHotel } from "../phong/bolt/types";

export const homeCardGrid = "grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-4 max-lg:gap-3";
export const homeCardFrame = "group relative overflow-hidden rounded-[13px] border border-[#e1e4e1] bg-white shadow-[0_2px_5px_rgba(0,0,0,.06)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(0,0,0,.1)]";
export const homeCardImage = "relative h-[140px] overflow-hidden bg-neutral-100 max-sm:h-[170px] lg:h-[210px]";
export const homeCardImageSizes = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw";

export type HomeRoomData = {
  rooms: RoomWithHotel[];
  roomCovers: Record<number, string>;
};

const selectClass = "min-w-0 w-full rounded-lg border border-neutral-300 bg-white px-1.5 py-1.5 text-[14px]! text-[#111613] sm:px-2";

export default function HomeRoomCollection({ rooms, roomCovers, lang, bookingDraft }: HomeRoomData & { lang: Lang; bookingDraft?: BookingDraft }) {
  const vi = lang === "vi";
  const [hotelId, setHotelId] = useState<number | "all">("all");
  const [priceBand, setPriceBand] = useState("");
  const [beds, setBeds] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const hotelName = (hotel: RoomWithHotel["hotel"]) => vi ? hotel.name_vi || hotel.name_en : hotel.name_en || hotel.name_vi;
  const properties = new Map(rooms.map(({ hotel }) => [hotel.id, hotelName(hotel)]));
  const bedLabels = new Set(rooms.map(({ room }) => roomBedKey(room, lang)).filter(Boolean));
  const activeBeds = bedLabels.has(beds) ? beds : "";
  const results = filterRooms(rooms, hotelId, activeBeds, priceBand, lang);
  const featuredByProperty = new Map(rooms.filter(({ room }) => room.is_featured).map(({ hotel, room }) => [hotel.id, room.id]));
  const firstByProperty = new Map<number, RoomWithHotel>();
  for (const item of results) {
    const featured = featuredByProperty.get(item.hotel.id);
    if (!firstByProperty.has(item.hotel.id) && (featured === undefined ? Boolean(roomCovers[item.room.id]) : item.room.id === featured)) {
      firstByProperty.set(item.hotel.id, item);
    }
  }
  const visibleRooms = hotelId === "all" ? [...firstByProperty.values()].slice(0, 4) : results;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const featured = section?.nextElementSibling;
    if (!section || featured?.id !== "hotels") return;
    const cards = [...featured.querySelectorAll("article")];
    function syncCardHeights() {
      cards.forEach((card, index) => {
        const image = card.querySelector<HTMLElement>("[data-home-card-image]");
        if (image) section?.style.setProperty(`--home-featured-body-${index}`, `${card.clientHeight - image.offsetHeight}px`);
      });
    }
    const observer = new ResizeObserver(syncCardHeights);
    cards.forEach(card => observer.observe(card));
    syncCardHeights();
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="home-rooms-heading" className="bg-white px-4 pb-[22px] pt-[36px] [--home-room-height-default:78px] sm:px-6 lg:pb-8 lg:pt-12 lg:[--home-room-height-default:140px]">
      <div className="mx-auto @container max-w-[1100px] lg:max-w-[1200px]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-[5px] text-[12px] font-bold tracking-[1.7px] text-[#155d2f]">{vi ? "Bộ sưu tập phòng" : "Room collection"}</p>
            <h2 id="home-rooms-heading" className="text-[25px] font-bold leading-[1.08] text-[#111613] max-sm:text-[20px]">
              {vi ? "Tìm không gian dành riêng cho bạn" : "Find a space of your own"}
            </h2>
            <p className="mt-2 text-sm text-[#5b625d]">
              {vi ? "So sánh theo khách sạn, giá và loại giường để tìm căn phòng phù hợp nhất." : "Compare properties, prices and bed types to find the right room for you."}
            </p>
          </div>
          <Link href="/phong" className="inline-flex items-center gap-2 text-[13px] font-bold text-[#155d2f] hover:underline">
            {vi ? "Xem tất cả phòng" : "View all rooms"} <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2 sm:max-w-xl">
          <select className={selectClass} aria-label={vi ? "Cơ sở" : "Property"} value={hotelId} onChange={event => setHotelId(event.target.value === "all" ? "all" : Number(event.target.value))}>
            <option value="all">{vi ? "Cơ sở" : "Property"}</option>
            {[...properties].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
          <select className={selectClass} aria-label={vi ? "Khoảng giá" : "Price range"} value={priceBand} onChange={event => setPriceBand(event.target.value)}>
            <option value="">{vi ? "Khoảng giá" : "Price range"}</option>
            <option value="under-500">{vi ? "Dưới 500.000 ₫" : "Under ₫500,000"}</option>
            <option value="500-800">{vi ? "500.000–800.000 ₫" : "₫500,000–₫800,000"}</option>
            <option value="over-800">{vi ? "Trên 800.000 ₫" : "Over ₫800,000"}</option>
          </select>
          <select className={selectClass} aria-label={vi ? "Loại giường" : "Bed type"} value={activeBeds} onChange={event => setBeds(event.target.value)}>
            <option value="">{vi ? "Loại giường" : "Bed type"}</option>
            {[...bedLabels].map(label => <option key={label} value={label}>{label}</option>)}
          </select>
        </div>

        {visibleRooms.length ? (
          <div className={homeCardGrid}>
            {visibleRooms.map((item, index) => {
              const { room, hotel } = item;
              const name = vi ? room.name_vi || room.name_en : room.name_en || room.name_vi;
              const description = (vi ? room.description_vi || room.description_en : room.description_en || room.description_vi)?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
              const bedLabel = roomBedKey(room, lang);
              const price = room.base_price_daily;
              const image = roomCovers[room.id];
              const bookingParams = new URLSearchParams({ hotel: hotel.slug, room: room.slug });
              if (bookingDraft) {
                if (bookingDraft.checkIn) bookingParams.set("checkIn", bookingDraft.checkIn);
                if (bookingDraft.checkOut) bookingParams.set("checkOut", bookingDraft.checkOut);
                if (bookingDraft.guestsEdited) {
                  bookingParams.set("adults", String(bookingDraft.adults));
                  bookingParams.set("children", String(bookingDraft.children));
                }
              }
              const booking = "/tim-phong?" + bookingParams.toString();
              return (
                <article key={room.id} className={homeCardFrame} style={{ "--home-room-body": `var(--home-featured-body-${index}, var(--home-room-height-default))` } as CSSProperties}>
                  <div className={homeCardImage}>
                    {image && <Image src={image} alt={name} fill loading="lazy" sizes={homeCardImageSizes} className="object-cover" />}
                    <span className="absolute right-2 top-2 rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#155d2f] shadow">
                      {price && price > 0 ? `${new Intl.NumberFormat(vi ? "vi-VN" : "en").format(price)} ₫ ${vi ? "/đêm" : "/night"}` : (vi ? "Liên hệ để biết giá" : "Ask for rates")}
                    </span>
                  </div>

                  <div className="relative h-[var(--home-room-body)] overflow-hidden px-[14px] pb-[10px] pt-[7px] lg:px-[18px] lg:pb-4 lg:pt-3">
                    <p className="truncate font-semibold leading-[13px] text-[#155d2f] [font-size:10px] lg:text-xs">{hotelName(hotel)}</p>
                    <h3 className="truncate text-sm font-bold leading-[17px] text-[#111613] lg:text-[17px]">{name}</h3>
                    {description && <p className="truncate leading-[13px] text-[#5b625d] [font-size:11px] lg:mt-1 lg:text-xs">{description}</p>}
                    <div className="mt-1 flex items-center gap-2 leading-[13px] text-[#37433b] [font-size:10px] lg:text-xs">
                      {room.size != null && room.size > 0 && <span className="inline-flex shrink-0 items-center gap-1"><Maximize size={12} aria-hidden="true" />{room.size} m²</span>}
                      {bedLabel && <span className="inline-flex min-w-0 items-center gap-1" title={bedLabel}><BedDouble size={12} className="shrink-0" aria-hidden="true" /><span className="truncate">{bedLabel}</span></span>}
                      {room.max_guests != null && room.max_guests > 0 && <span className="inline-flex shrink-0 items-center gap-1"><Users size={12} aria-hidden="true" />{room.max_guests} {vi ? "khách" : room.max_guests === 1 ? "guest" : "guests"}</span>}
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-[var(--home-room-body)] flex items-center gap-2 bg-gradient-to-t from-black/65 to-transparent px-2 pb-2 pt-5 lg:bottom-4 lg:bg-none lg:px-[18px] lg:pb-0 lg:pt-0">
                    <Link href={roomDetailPath(item)} className="flex min-h-10 items-center justify-center rounded-lg border border-[#d8e8dc] bg-white px-3 py-1 text-xs font-semibold text-[#155d2f] shadow-sm hover:bg-[#eaf6ed]">
                      {vi ? "Xem chi tiết" : "View details"}
                    </Link>
                    <Link href={booking} prefetch={false} className="flex min-h-10 items-center rounded-lg bg-[#155d2f] px-3 py-1 text-xs font-semibold text-white hover:bg-[#104623]">
                      {vi ? "Đặt ngay" : "Book now"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <p role="status" className="rounded-xl border border-dashed border-neutral-300 p-5 text-sm text-neutral-600">{vi ? "Không tìm thấy phòng phù hợp. Hãy thử đổi bộ lọc." : "No matching rooms. Try changing your filters."}</p>}
      </div>
    </section>
  );
}
