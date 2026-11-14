import { canonicalRoomSlug } from "@/app/lib/room-seo-slugs";
import { LayoutTemplate, MapPin, Users, Maximize, BedDouble, Sparkles } from 'lucide-react';
import type { Lang, RoomWithHotel } from './types';
import { copy, pick } from './copy';

export function roomDetailPath(room: RoomWithHotel): string {
  return `/khach-san/${encodeURIComponent(room.hotel.slug)}/phong/${encodeURIComponent(canonicalRoomSlug(room.hotel.slug, room.room.slug))}`;
}

function formatVnd(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value) + '\u00A0\u20AB';
}

export function getAmenities(raw: unknown): string[] {
  let value = raw;
  if (typeof value === "string") {
    try { value = JSON.parse(value); }
    catch { return []; }
  }
  if (Array.isArray(value)) {
    return value.filter((x): x is string => typeof x === "string");
  }
  if (value && typeof value === "object") {
    return Object.values(value).filter(
      (x): x is string => typeof x === "string"
    );
  }
  return [];
}

type Props = {
  data: RoomWithHotel;
  cover?: string;
  lang: Lang;
};

export function RoomCard({ data, cover, lang }: Props) {
  const { room, hotel } = data;
  const name = lang === 'vi' ? room.name_vi : room.name_en || room.name_vi;
  const hotelName = lang === 'vi' ? hotel.name_vi : hotel.name_en || hotel.name_vi;
  const address = (lang === 'vi' ? hotel.address_vi : hotel.address_en ?? hotel.address_vi) || null;
  const description = (lang === 'vi' ? room.description_vi : room.description_en ?? room.description_vi) || null;
  const beds = (lang === 'vi' ? room.beds_vi : room.beds_en ?? room.beds_vi) || null;

  const daily = room.base_price_daily && room.base_price_daily > 0 ? room.base_price_daily : null;

  const amenities = getAmenities(room.amenities).slice(0, 4);
  

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-pine/10 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-sage">
        {cover ? (
          <img
            src={cover}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-pine/40" aria-hidden="true">
            <LayoutTemplate className="h-9 w-9" strokeWidth={1.5} />
            <span className="px-6 text-center font-serif text-sm italic">{lang === 'vi' ? 'H\u00ECnh \u1EA3nh ph\u00F2ng s\u1ED1p c\u1EADp nh\u1EADt' : 'Room photo coming soon'}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <header className="space-y-1.5">
          <div className="flex items-start gap-1.5 text-mist">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <p className="text-[13px] leading-snug">
              <span className="font-medium text-ink">{hotelName}</span>
              {address ? <span className="text-mist"> · {address}</span> : null}
            </p>
          </div>
          <h3 className="font-serif text-xl font-semibold leading-tight text-ink sm:text-2xl">{name}</h3>
          {description ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-mist sm:line-clamp-3">{description}</p>
          ) : null}
        </header>

        <dl className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink">
          {room.size != null && room.size > 0 ? (
            <div className="flex items-center gap-1.5">
              <Maximize className="h-4 w-4 text-pine" strokeWidth={1.75} />
              <dt className="sr-only">{pick(copy.card.size, lang)}</dt>
              <dd>{room.size}{'\u00A0'}m²</dd>
            </div>
          ) : null}
          {room.max_guests != null && room.max_guests > 0 ? (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-pine" strokeWidth={1.75} />
              <dt className="sr-only">{pick(copy.card.guests, lang)}</dt>
              <dd>
                {room.max_guests} {room.max_guests > 1 ? pick(copy.card.guests, lang) : pick(copy.card.guest, lang)}
              </dd>
            </div>
          ) : null}
          {beds ? (
            <div className="flex items-center gap-1.5">
              <BedDouble className="h-4 w-4 text-pine" strokeWidth={1.75} />
              <dt className="sr-only">{pick(copy.card.beds, lang)}</dt>
              <dd>{beds}</dd>
            </div>
          ) : null}
        </dl>

        {amenities.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label={lang === 'vi' ? 'Ti\u1EC7n nghi' : 'Amenities'}>
            {amenities.map((amenity) => (
              <li
                key={amenity}
                className="flex items-center gap-1 rounded-full border border-pine/10 bg-sage/60 px-2.5 py-1 text-xs text-ink"
              >
                <Sparkles className="h-3 w-3 text-pine" strokeWidth={2} />
                {amenity}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto space-y-3 border-t border-pine/10 pt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            {daily ? (
              <>
                <p className="font-serif text-xl font-semibold text-pine">
                  {formatVnd(daily)}
                  <span className="ml-1 font-sans text-xs font-normal text-mist">
                    {pick(copy.card.perNight, lang)}
                  </span>
                </p>
              </>
            ) : (
              <div>
                <p className="font-serif text-lg font-semibold text-pine">{pick(copy.card.contact, lang)}</p>
                <p className="text-xs text-mist">{pick(copy.card.contactHint, lang)}</p>
              </div>
            )}
          </div>
          <a
            href={roomDetailPath(data)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-pine/20 bg-cream px-5 py-2.5 text-sm font-medium text-pine transition-colors duration-200 hover:border-pine hover:bg-pine hover:text-cream"
          >
            {pick(copy.card.detail, lang)}
          </a>
        </div>
      </div>
    </article>
  );
}
