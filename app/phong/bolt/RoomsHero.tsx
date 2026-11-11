import type { Lang } from './types';
import { copy, pick } from './copy';

export type RoomsHeroProps = { lang: Lang; cover?: string; secondaryCover?: string; thirdCover?: string };

export function RoomsHero({ lang, cover, secondaryCover, thirdCover }: RoomsHeroProps) {
  const scrollToRooms = () => {
    document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative overflow-hidden bg-pinedeep">
      {cover ? <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" /> : null}
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

        
        {/* ROOMS_HERO_COMPACT_GALLERY_V2 */}
        <div className="hidden h-[280px] w-full max-w-xl grid-cols-[1.35fr_1fr] gap-3 lg:grid xl:h-[320px]">
          <div className="overflow-hidden rounded-2xl border border-cream/15 bg-sage/10">
            {cover ? (
              <img
                src={cover}
                alt={lang === "vi" ? "Không gian phòng tại Huyen's" : "Huyen's room"}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          <div className="grid min-h-0 grid-rows-2 gap-3">
            <div className="min-h-0 overflow-hidden rounded-2xl border border-cream/15 bg-sage/10">
              {secondaryCover ? (
                <img
                  src={secondaryCover}
                  alt={lang === "vi" ? "Phòng nghỉ Huyen's" : "Huyen's guest room"}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            <div className="min-h-0 overflow-hidden rounded-2xl border border-cream/15 bg-sage/10">
              {thirdCover ? (
                <img
                  src={thirdCover}
                  alt={lang === "vi" ? "Bộ sưu tập phòng Huyen's" : "Huyen's room collection"}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
