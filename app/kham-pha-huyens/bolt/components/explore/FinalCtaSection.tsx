import { ArrowRight } from 'lucide-react';

import type { content } from '../../content/explore';

type Strings = typeof content.vi;

export function FinalCtaSection({ t, image }: { t: Strings; image?: string }) {
  return (
    <section className="relative overflow-hidden bg-pine">
      <img
        src={image || '/images/huyens-hotels-stays-logo.webp'}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-15"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-pine-deep/60" />

      <div className="relative mx-auto max-w-7xl px-5 py-24 text-center sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
            {t.ctaTitle}
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-white/75 sm:text-base">
            {t.ctaDesc}
          </p>
          <a
            href="/phong"
            className="group mt-9 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-medium text-pine transition-colors duration-300 hover:bg-sage"
          >
            {t.ctaButton}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
