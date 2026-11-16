import Image from "next/image";
import type { Lang } from './types';
import { copy, pick } from './copy';

export type RoomsHeroProps = { lang: Lang; cover?: string; };

export function RoomsHero({ lang, cover }: RoomsHeroProps) {
  const scrollToRooms = () => {
    document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative overflow-hidden bg-pinedeep">
      {cover ? <Image src={cover} alt="" fill preload sizes="100vw" className="object-cover opacity-40" /> : null}
      <div className="absolute inset-0 bg-gradient-to-r from-pinedeep/90 via-pinedeep/70 to-pinedeep/30" aria-hidden="true" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-7 px-6 pb-12 pt-14 sm:pb-16 sm:pt-20 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-10 lg:pb-20 lg:pt-20">
        <div className="max-w-xl space-y-6">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-sage">{pick(copy.hero.eyebrow, lang)}</p>
          <h1 className="font-serif text-3xl font-medium leading-[1.15] text-cream sm:text-4xl lg:text-5xl">
            {pick(copy.hero.title, lang)}
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-cream/75">{pick(copy.hero.description, lang)}</p>
          <button
            type="button"
            onClick={scrollToRooms}
            className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-pine transition-colors duration-200 hover:bg-sage"
          >
            {pick(copy.hero.cta, lang)}
          </button>
        </div>
      </div>
    </section>
  );
}
