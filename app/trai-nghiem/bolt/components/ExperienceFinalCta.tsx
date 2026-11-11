import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../lib/use-language';
import { experienceCopy } from './experience-copy';

export default function ExperienceFinalCta() {
  const { language } = useLanguage();
  const copy = experienceCopy[language];

  return (
    <section className="bg-pine-deep text-cream">
      <div className="mx-auto max-w-[1160px] px-5 py-24 text-center sm:px-8 sm:py-32">
        <h2 className="mx-auto max-w-2xl font-serif text-4xl font-semibold leading-[1.15] sm:text-5xl">
          {copy.finalTitle}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-[1.75] text-sage sm:text-lg">
          {copy.finalBody}
        </p>
        <a
          href="/phong"
          className="group mt-10 inline-flex items-center gap-3 rounded-full bg-cream px-8 py-4 text-sm font-medium tracking-[0.12em] text-pine-deep transition-colors hover:bg-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
        >
          {copy.finalCta}
          <ArrowRight
            size={16}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </a>
      </div>
    </section>
  );
}
