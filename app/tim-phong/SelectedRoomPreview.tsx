import Image from "next/image";
import { BedDouble, Maximize, Users } from "lucide-react";
import type { Lang, RoomWithHotel } from "../phong/bolt/types";
import { roomBedKey } from "../phong/room-filters";

export default function SelectedRoomPreview({ item, cover, lang, needsDates, guests }: {
  item: RoomWithHotel;
  cover?: string;
  lang: Lang;
  needsDates: boolean;
  guests: number;
}) {
  const { room, hotel } = item;
  const vi = lang === "vi";
  const name = vi ? room.name_vi || room.name_en : room.name_en || room.name_vi;
  const property = vi ? hotel.name_vi || hotel.name_en : hotel.name_en || hotel.name_vi;
  const address = vi ? hotel.address_vi || hotel.address_en : hotel.address_en || hotel.address_vi;
  const description = (vi ? room.description_vi || room.description_en : room.description_en || room.description_vi)?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const bed = roomBedKey(room, lang);
  const price = room.base_price_daily;

  return (
    <section aria-labelledby="selected-room-heading" className="mb-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <h2 id="selected-room-heading" className="border-b border-neutral-100 px-5 py-4 text-lg font-bold text-slate-900">
        {vi ? "Phòng bạn đã chọn" : "Your selected room"}
      </h2>
      <article className="grid sm:grid-cols-[minmax(180px,1fr)_2fr]">
        {cover && <div className="relative aspect-[3/2] overflow-hidden bg-neutral-100 sm:aspect-auto sm:min-h-52">
          <Image src={cover} alt={name} fill sizes="(max-width: 639px) 100vw, 35vw" className="object-cover" />
        </div>}
        <div className={`min-w-0 p-5 sm:p-6 ${cover ? "" : "sm:col-span-2"}`}>
          <h3 className="text-xl font-bold text-slate-900">{name}</h3>
          <p className="mt-1 font-semibold text-slate-700">{property}</p>
          {address && <p className="text-sm text-slate-600">{address}</p>}
          {description && <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>}
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-700">
            {room.size != null && room.size > 0 && <li className="flex items-center gap-2"><Maximize size={16} aria-hidden="true" />{room.size} m²</li>}
            {bed && <li className="flex items-center gap-2"><BedDouble size={16} aria-hidden="true" />{bed}</li>}
            {room.max_guests != null && room.max_guests > 0 && <li className="flex items-center gap-2"><Users size={16} aria-hidden="true" />{vi ? `Tối đa ${room.max_guests} khách` : `Up to ${room.max_guests} ${room.max_guests === 1 ? "guest" : "guests"}`}</li>}
          </ul>
          <p className="mt-4 text-sm text-slate-600">
            {vi ? "Giá tham khảo" : "Indicative rate"}{" "}
            <strong className="text-base text-[#155d2f]">
              {price && price > 0
                ? `${new Intl.NumberFormat(vi ? "vi-VN" : "en").format(price)} ₫${vi ? "/đêm" : "/night"}`
                : vi ? "Liên hệ để biết giá" : "Ask for rates"}
            </strong>
          </p>
          {needsDates && <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-slate-700">
            {vi ? "Chọn ngày nhận và trả phòng để kiểm tra phòng trống và giá." : "Select check-in and check-out dates to check availability and rates."}
          </p>}
          {!!room.max_guests && guests > room.max_guests && <p className="mt-3 text-sm text-amber-800">
            {vi ? "Số khách vượt sức chứa của phòng. Hãy giảm số khách hoặc chọn phòng khác." : "The number of guests exceeds this room’s capacity. Adjust the guest count or choose another room."}
          </p>}
        </div>
      </article>
    </section>
  );
}
