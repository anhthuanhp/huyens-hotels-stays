import { getBlogCopy } from "./blog-i18n";
import type { Language } from "./types";

type BlogHeroProps = {
  language: Language;
};

export default function BlogHero({ language }: BlogHeroProps) {
  const t = getBlogCopy(language);

  return (
    <section className="bg-cream px-6 pb-12 pt-16 text-center md:pb-16 md:pt-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl leading-[1.12] text-pine md:text-6xl">{t.heroTitle}</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-[1.5] text-muted md:text-lg">{t.heroDescription}</p>
        <div className="mx-auto mt-8 h-px w-16 bg-accent/40" aria-hidden="true" />
      </div>
    </section>
  );
}
