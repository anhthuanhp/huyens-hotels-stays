
import type { content } from '../../content/explore';

type Strings = typeof content.vi;

export function StorySection({ t, images }: { t: Strings; images: string[] }) {
  return (
    <section className="bg-sage/60 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={images[0] || '/images/huyens-hotels-stays-logo.webp'}
                alt=""
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-8 -right-2 hidden w-44 overflow-hidden rounded-xl border-4 border-sage/60 shadow-lg sm:block lg:-right-8 lg:w-56">
              <img
                src={images[1] || images[0] || '/images/huyens-hotels-stays-logo.webp'}
                alt=""
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="max-w-xl lg:pl-4">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-pine-accent">
              {t.storyEyebrow}
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
              {t.storyTitle}
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-moss sm:text-base">{t.storyP1}</p>
            <p className="mt-4 text-[15px] leading-relaxed text-moss sm:text-base">{t.storyP2}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
