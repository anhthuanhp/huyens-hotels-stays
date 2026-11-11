import { ArrowDown } from 'lucide-react';
import type { HeroSlide } from '../../types/explore';
import type { content } from '../../content/explore';

type Strings = typeof content.vi;

export function HeroSection({
  t,
  slides,
}: {
  t: Strings;
  slides: HeroSlide[];
}) {
  const images = slides.map((s) => s.image_url).filter((u): u is string => Boolean(u));
  const [a, b, c, d] = [images[0], images[1], images[2], images[3]];

  return (
    <section className="relative bg-cream overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-10 py-24 sm:py-28 lg:min-h-[88vh] lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-16">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-pine-accent">
              {t.eyebrow}
            </p>
            <h1 className="mt-5 font-serif text-4xl leading-[1.15] text-ink sm:text-5xl lg:text-6xl">
              {t.heroTitle}
            </h1>
            <p className="mt-4 font-serif text-lg italic text-moss sm:text-xl">{t.heroSub}</p>
            <p className="mt-6 text-[15px] leading-relaxed text-moss sm:text-base">{t.heroDesc}</p>
            <a
              href="#collection"
              className="group mt-9 inline-flex items-center gap-3 rounded-full bg-pine px-7 py-4 text-sm font-medium text-white transition-colors duration-300 hover:bg-pine-accent"
            >
              {t.heroCta}
              <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:pb-10">
            <div className="overflow-hidden rounded-2xl">
              {a && <img src={a} alt="" className="h-52 w-full object-cover sm:h-64 lg:h-80" loading="eager" />}
              {c && <img src={c} alt="" className="mt-3 h-36 w-full object-cover sm:mt-4 sm:h-44 lg:h-52" loading="lazy" />}
            </div>
            <div className="overflow-hidden rounded-2xl pt-8 sm:pt-12">
              {b && <img src={b} alt="" className="h-36 w-full object-cover sm:h-44 lg:h-52" loading="eager" />}
              {d && <img src={d} alt="" className="mt-3 h-52 w-full object-cover sm:mt-4 sm:h-64 lg:h-80" loading="lazy" />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
