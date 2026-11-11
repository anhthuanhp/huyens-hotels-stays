import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import type { Hotel } from '../../types/explore';

import type { content, Lang } from '../../content/explore';

type Strings = typeof content.vi;

function HotelCard({
  hotel,
  image,
  t,
  lang,
}: {
  hotel: Hotel;
  image: string | undefined;
  t: Strings;
  lang: Lang;
}) {
  const name = lang === 'vi' ? hotel.name_vi : hotel.name_en || hotel.name_vi;
  const address = lang === 'vi' ? hotel.address_vi : hotel.address_en || hotel.address_vi;

  return (
    <a
      href={`/khach-san/${hotel.slug}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-sage">
            <ImageIcon className="h-10 w-10 text-pine-accent/40" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
        
      </div>

      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl text-ink sm:text-2xl">{name}</h3>
            {address && (
              <p className="mt-1.5 text-sm text-moss">{address}</p>
            )}
          </div>
          
        </div>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-pine-accent">
          {t.cardCta}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </a>
  );
}

export function CollectionSection({
  t,
  lang,
  hotels,
  hotelCovers,
}: {
  t: Strings;
  lang: Lang;
  hotels: Hotel[];
  hotelCovers: Record<number, string>;
}) {
  return (
    <section id="collection" className="scroll-mt-20 bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-pine-accent">
            {t.collectionEyebrow}
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
            {t.collectionTitle}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-moss sm:text-base">
            {t.collectionSub}
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:mt-16 lg:grid-cols-2">
          {hotels.map((hotel, i) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              image={hotelCovers[hotel.id]}
              t={t}
              lang={lang}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
