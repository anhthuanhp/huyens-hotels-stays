import { getBlogCopy } from "./blog-i18n";
import type { Language } from "./types";

type BlogFinalCtaProps = {
  language: Language;
};

export default function BlogFinalCta({ language }: BlogFinalCtaProps) {
  const t = getBlogCopy(language);

  return (
    <section aria-labelledby="blog-cta-title" className="bg-pine px-6 py-20 md:py-28">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 id="blog-cta-title" className="font-serif text-3xl leading-[1.15] text-cream md:text-5xl">
          {t.ctaTitle}
        </h2>
        <p className="mt-5 max-w-xl text-base leading-[1.5] text-cream/80 md:text-lg">{t.ctaDescription}</p>
        <a
          href="/phong"
          className="mt-10 inline-flex items-center rounded-full bg-cream px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-pine transition-colors duration-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-pine"
        >
          {t.ctaButton}
        </a>
      </div>
    </section>
  );
}
