import { useMemo, useState } from 'react';
import type { Lang, RoomsClientProps } from './types';
import { copy, pick } from './copy';
import { RoomsHero } from './RoomsHero';
import { RoomCard, type PriceMode } from './RoomCard';
import { RoomsEmptyState } from './RoomsEmptyState';
import { RoomsFinalCta } from './RoomsFinalCta';

type HotelTab = 'all' | number;

export default function RoomsClient({ rooms, roomCovers, lang = 'vi' }: RoomsClientProps) {
  const [hotelTab, setHotelTab] = useState<HotelTab>('all');
  const [priceMode, setPriceMode] = useState<PriceMode>('daily');

  const hotels = useMemo(() => {
    const map = new Map<number, { id: number; name: string }>();
    for (const { hotel } of rooms) {
      if (!map.has(hotel.id)) {
        map.set(hotel.id, { id: hotel.id, name: (lang === 'vi' ? hotel.name_vi : hotel.name_en || hotel.name_vi) });
      }
    }
    return [...map.values()];
  }, [rooms, lang]);

  const filtered = hotelTab === 'all' ? rooms : rooms.filter(({ hotel }) => hotel.id === hotelTab);

  return (
    <div className="bg-cream">
      <RoomsHero lang={lang} cover={Object.values(roomCovers)[0]} secondaryCover={Object.values(roomCovers)[1]}
        thirdCover={Object.values(roomCovers)[2]} />

      <section id="rooms" className="mx-auto max-w-7xl scroll-mt-8 px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
        <div className="mb-10 max-w-2xl space-y-3">
          <h2 className="font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-5xl">
            {pick(copy.collection.title, lang)}
          </h2>
          <p className="text-base leading-relaxed text-mist">{pick(copy.collection.subtitle, lang)}</p>
        </div>

        {rooms.length > 0 ? (
          <>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <FilterPill active={hotelTab === 'all'} onClick={() => setHotelTab('all')}>
                  {pick(copy.filters.allHotels, lang)}
                </FilterPill>
                {hotels.map((hotel) => (
                  <FilterPill key={hotel.id} active={hotelTab === hotel.id} onClick={() => setHotelTab(hotel.id)}>
                    {hotel.name}
                  </FilterPill>
                ))}
              </div>

              <div className="flex w-fit rounded-full border border-pine/15 bg-white p-1" role="group" aria-label={lang === 'vi' ? 'Ch\u1EBF \u0111\u1ED9 xem gi\u00E1' : 'Price view'}>
                <PriceToggle active={priceMode === 'daily'} onClick={() => setPriceMode('daily')}>
                  {pick(copy.filters.daily, lang)}
                </PriceToggle>
                <PriceToggle active={priceMode === 'monthly'} onClick={() => setPriceMode('monthly')}>
                  {pick(copy.filters.monthly, lang)}
                </PriceToggle>
              </div>
            </div>

            {filtered.length === 0 ? (
              <RoomsEmptyState lang={lang} />
            ) : (
              <>
                <p className="mb-6 text-sm text-mist">
                  {filtered.length} {pick(copy.collection.count, lang)}
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                  {filtered.map(({ room, hotel }) => (
                    <RoomCard
                      key={room.id}
                      data={{ room, hotel }}
                      cover={roomCovers[room.id]}
                      priceMode={priceMode}
                      lang={lang}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <RoomsEmptyState lang={lang} />
        )}
      </section>

      <RoomsFinalCta lang={lang} />
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? 'border-pine bg-pine text-cream'
          : 'border-pine/15 bg-white text-ink hover:border-pine/40 hover:bg-sage/50'
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function PriceToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
        active ? 'bg-pine text-cream' : 'text-mist hover:text-ink'
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
