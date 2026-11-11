import { ArrowRight } from 'lucide-react';
import type { Lang } from './types';
import { copy, pick } from './copy';

export type RoomsFinalCtaProps = { lang: Lang };

export function RoomsFinalCta({ lang }: RoomsFinalCtaProps) {
  return (
    <section className="bg-pinedeep">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-16 text-center sm:py-24 lg:px-10">
        <h2 className="max-w-2xl font-serif text-3xl font-medium leading-tight text-cream sm:text-4xl lg:text-5xl">
          {pick(copy.finalCta.title, lang)}
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-cream/70">{pick(copy.finalCta.description, lang)}</p>
        <a
          href="/tim-phong"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-cream px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-pine transition-all duration-200 hover:bg-sage"
        >
          {pick(copy.finalCta.button, lang)}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </a>
      </div>
    </section>
  );
}
