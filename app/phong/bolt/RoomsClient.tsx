import { useRef, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { RoomsClientProps } from './types';
import { copy, pick } from './copy';
import { RoomsHero } from './RoomsHero';
import { RoomCard } from './RoomCard';
import { RoomsEmptyState } from './RoomsEmptyState';
import { RoomsFinalCta } from './RoomsFinalCta';

const prices = [500000, 800000, 1200000];

export default function RoomsClient({ rooms, roomCovers, roomPhotos, lang = 'vi' }: RoomsClientProps) {
  const vi = lang === 'vi';
  const drawer = useRef<HTMLDialogElement>(null);
  const openDrawer = useRef<HTMLButtonElement>(null);
  const [hotelId, setHotelId] = useState('');
  const [bed, setBed] = useState('');
  const [ceiling, setCeiling] = useState('');
  const [sort, setSort] = useState('default');
  const hotelOptions = [...new Map(rooms.map(({ hotel }) => [String(hotel.id), vi ? hotel.name_vi : hotel.name_en || hotel.name_vi]))];
  const bedLabel = (room: (typeof rooms)[number]['room']) => (vi ? room.beds_vi : room.beds_en || room.beds_vi)?.trim() || '';
  const bedOptions = [...new Map(rooms.flatMap(({ room }) => room.beds_vi?.trim() || room.beds_en?.trim()
    ? [[(room.beds_vi || room.beds_en)!.trim(), bedLabel(room) || (room.beds_vi || room.beds_en)!.trim()] as const] : []))];
  const vnd = (price: number) => new Intl.NumberFormat(vi ? 'vi-VN' : 'en', { style: 'currency', currency: 'VND' }).format(price);
  const hasRates = rooms.some(({ room }) => (room.base_price_daily ?? 0) > 0);
  const hasArea = rooms.some(({ room }) => (room.size ?? 0) > 0);
  const filtered = rooms.filter(({ hotel, room }) =>
    (!hotelId || String(hotel.id) === hotelId)
    && (!bed || (room.beds_vi || room.beds_en)?.trim() === bed)
    && (!ceiling || (room.base_price_daily != null && room.base_price_daily > 0 && room.base_price_daily <= Number(ceiling))),
  );
  const known = (value: number | null) => value && value > 0 ? value : Infinity;
  if (sort === 'price') filtered.sort((a, b) => known(a.room.base_price_daily) - known(b.room.base_price_daily));
  if (sort === 'area') filtered.sort((a, b) => (b.room.size || 0) - (a.room.size || 0));

  function clear() {
    setHotelId('');
    setBed('');
    setCeiling('');
  }

  const chips = [
    { label: hotelOptions.find(([id]) => id === hotelId)?.[1], reset: () => setHotelId('') },
    { label: bedOptions.find(([id]) => id === bed)?.[1], reset: () => setBed('') },
    { label: ceiling ? (vi ? 'Tối đa ' : 'Up to ') + vnd(Number(ceiling)) : '', reset: () => setCeiling('') },
  ].filter(item => item.label);

  const filterControls = (
    <div className="grid gap-4">
      <FilterSelect label={vi ? 'Cơ sở lưu trú' : 'Property'} all={vi ? 'Tất cả cơ sở' : 'All properties'} value={hotelId} onChange={setHotelId} options={hotelOptions} />
      <FilterSelect label={vi ? 'Loại giường' : 'Bed type'} all={vi ? 'Tất cả loại giường' : 'All bed types'} value={bed} onChange={setBed} options={bedOptions} />
      {hasRates && <FilterSelect label={vi ? 'Giá tối đa mỗi đêm' : 'Maximum nightly rate'} all={vi ? 'Mọi mức giá' : 'Any price'} value={ceiling} onChange={setCeiling} options={prices.map(value => [String(value), vnd(value)])} />}
    </div>
  );

  return (
    <div className="bg-cream">
      <RoomsHero lang={lang} cover={Object.values(roomCovers)[0]} />
      <section id="rooms" className="mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:py-16">
        <h2 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">{pick(copy.collection.title, lang)}</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-mist">{pick(copy.collection.subtitle, lang)}</p>
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="sticky top-24 hidden rounded-2xl border border-teal-100 bg-white p-5 shadow-sm lg:block">
            <h3 className="mb-4 text-lg font-semibold">{vi ? 'Lọc phòng' : 'Filter rooms'}</h3>
            {filterControls}
          </aside>
          <div className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <button ref={openDrawer} type="button" onClick={() => drawer.current?.showModal()} className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-4 py-2 font-semibold text-teal-800 lg:hidden">
                <SlidersHorizontal size={18} aria-hidden="true" />{vi ? 'Lọc phòng' : 'Filters'}
              </button>
              <p role="status" className="text-sm text-slate-700">{filtered.length} {pick(copy.collection.count, lang)}</p>
              <FilterSelect label={vi ? 'Sắp xếp' : 'Sort by'} all={vi ? 'Mặc định' : 'Default'} value={sort === 'default' ? '' : sort} onChange={value => setSort(value || 'default')} options={[
                ...(hasRates ? [['price', vi ? 'Giá thấp đến cao' : 'Lowest price'] as const] : []),
                ...(hasArea ? [['area', vi ? 'Diện tích lớn trước' : 'Largest first'] as const] : []),
              ]} />
            </div>
            {chips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {chips.map(({ label, reset }, index) => <button key={index} type="button" onClick={reset} aria-label={(vi ? 'Bỏ bộ lọc ' : 'Remove filter ') + label} className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-2 text-sm text-teal-950">{label}<X size={14} aria-hidden="true" /></button>)}
                <button type="button" onClick={clear} className="px-3 text-sm font-semibold text-teal-800 underline">{vi ? 'Xóa bộ lọc' : 'Clear filters'}</button>
              </div>
            )}
            <div className="mt-6 grid gap-6">
              {filtered.length ? filtered.map(({ room, hotel }) => <RoomCard key={room.id} data={{ room, hotel }} cover={roomCovers[room.id]} photos={roomPhotos?.[room.id]} lang={lang} />) : (
                <>
                  <RoomsEmptyState lang={lang} />
                  {chips.length > 0 && <button type="button" onClick={clear} className="justify-self-center rounded-full bg-teal-700 px-6 py-3 font-semibold text-white">{vi ? 'Xem tất cả phòng' : 'Show all rooms'}</button>}
                </>
              )}
            </div>
          </div>
        </div>
        <dialog ref={drawer} aria-labelledby="room-filter-title" onClose={() => openDrawer.current?.focus()} className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-[min(100%,360px)] max-w-full border-0 bg-white p-6 shadow-xl backdrop:bg-slate-950/50">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold" id="room-filter-title">{vi ? 'Lọc phòng' : 'Filter rooms'}</h2>
            <button type="button" onClick={() => drawer.current?.close()} aria-label={vi ? 'Đóng' : 'Close'} className="rounded-lg border border-slate-200 p-2"><X aria-hidden="true" size={20} /></button>
          </div>
          {filterControls}
          <button type="button" onClick={() => drawer.current?.close()} className="mt-6 w-full rounded-full bg-teal-700 px-4 py-3 font-semibold text-white">{vi ? 'Xem kết quả' : 'View results'} ({filtered.length})</button>
        </dialog>
      </section>
      <RoomsFinalCta lang={lang} />
    </div>
  );
}

function FilterSelect({ label, all, value, onChange, options }: {
  label: string;
  all: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <label className="grid min-w-0 gap-1 text-sm font-medium text-slate-700">
      {label}
      <select className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-visible:border-teal-700" value={value} onChange={event => onChange(event.target.value)}>
        <option value="">{all}</option>
        {options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}
      </select>
    </label>
  );
}
