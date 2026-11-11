import { ArrowRight } from 'lucide-react';
import type { Locale } from '../types/hotel';
import { t } from '../lib/i18n';
import { format, ui } from '../lib/uiText';

interface Props {
  hotelName: string;
  locale: Locale;
}

export default function FinalCta({ hotelName, locale }: Props) {
  return (
    <section className="bg-brand py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight text-white sm:text-5xl">
          {t(ui.ctaTitle, locale)}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-sage sm:text-base">
          {format(t(ui.ctaDescription, locale), { name: hotelName })}
        </p>
        <a
          href="#rooms"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-brand transition-all duration-200 hover:bg-sage hover:shadow-lift"
        >
          {t(ui.ctaButton, locale)}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
