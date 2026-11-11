import { ArrowDown } from 'lucide-react';
import { useLanguage } from '../lib/use-language';
import type { LightboxImage } from '../lib/experience-utils';
import { experienceCopy } from './experience-copy';

type ExperienceHeroProps = {
  image: LightboxImage | null;
};

export default function ExperienceHero({ image }: ExperienceHeroProps) {
  const { language } = useLanguage();
  const copy = experienceCopy[language];

  return (
    <section className="bg-pine text-cream">
      <div className="mx-auto max-w-[1160px] px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:pt-28">
        <div className="max-w-3xl">
          <p className="text-xs font-medium tracking-[0.3em] text-sage/80">{copy.heroEyebrow}</p>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.12] sm:text-5xl lg:text-6xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.75] text-sage sm:text-lg">
            {copy.heroDescription}
          </p>
          <a
            href="#stories"
            className="group mt-10 inline-flex items-center gap-3 rounded-full bg-cream px-7 py-3.5 text-sm font-medium text-pine-deep transition-colors hover:bg-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
          >
            {copy.heroCta}
            <ArrowDown
              size={16}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-y-0.5 motion-reduce:transition-none"
            />
          </a>
        </div>

        {image && (
          <figure className="mt-12 overflow-hidden rounded-sm bg-pine-deep sm:mt-16">
            <img
              src={image.url}
              alt={image.alt}
              fetchPriority="high"
              decoding="async"
              className="aspect-[4/3] w-full object-cover sm:aspect-[21/9]"
            />
          </figure>
        )}
      </div>
    </section>
  );
}
