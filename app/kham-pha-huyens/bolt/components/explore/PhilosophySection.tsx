import { BedDouble, KeyRound, MapPin } from 'lucide-react';
import type { content } from '../../content/explore';

type Strings = typeof content.vi;

const values = [
  { icon: BedDouble, titleKey: 'comfort', descKey: 'comfortDesc' },
  { icon: KeyRound, titleKey: 'privacy', descKey: 'privacyDesc' },
  { icon: MapPin, titleKey: 'convenience', descKey: 'convenienceDesc' },
] as const;

export function PhilosophySection({ t }: { t: Strings }) {
  return (
    <section className="bg-sage/60 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-pine-accent">
            {t.philosophyEyebrow}
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
            {t.philosophyTitle}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-3">
          {values.map(({ icon: Icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="rounded-2xl bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage">
                <Icon className="h-5 w-5 text-pine" />
              </div>
              <h3 className="mt-6 font-serif text-xl text-ink sm:text-2xl">{t[titleKey]}</h3>
              <p className="mt-3 text-sm leading-relaxed text-moss">{t[descKey]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
