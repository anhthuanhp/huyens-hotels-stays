import { ArrowRight, BookOpen, Clock } from "lucide-react";
import {
  formatPostDate,
  getBlogCopy,
  getPostCategory,
  getPostExcerpt,
  getPostHref,
  getPostTitle,
} from "./blog-i18n";
import type { BlogPost, Language } from "./types";

type FeaturedStoryProps = {
  post: BlogPost;
  language: Language;
};

export default function FeaturedStory({ post, language }: FeaturedStoryProps) {
  const t = getBlogCopy(language);
  const title = getPostTitle(post, language);
  const excerpt = getPostExcerpt(post, language);
  const category = getPostCategory(post, language);
  const href = getPostHref(post.slug);

  return (
    <section aria-labelledby="featured-story-title" className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[55fr_45fr] lg:gap-16">
      <a href={href} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-sage shadow-card">
        {post.image ? (
          <img
            src={post.image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cream to-sage">
            <BookOpen className="h-14 w-14 text-accent/40" strokeWidth={1.25} aria-hidden="true" />
          </div>
        )}
      </a>

      <div className="flex flex-col">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{t.featuredLabel}</p>
        {category && <p className="mt-2 text-sm font-medium text-muted">{category}</p>}

        <h2 id="featured-story-title" className="mt-4 font-serif text-4xl leading-[1.12] text-pine md:text-5xl">
          <a href={href} className="rounded-sm transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
            {title}
          </a>
        </h2>

        {excerpt && <p className="mt-5 text-base leading-[1.5] text-ink/80 md:text-lg">{excerpt}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <time dateTime={post.date}>{formatPostDate(post.date, language)}</time>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {t.minutesRead(post.read_time)}
          </span>
        </div>

        <div className="mt-8">
          <a
            href={href}
            className="group/cta inline-flex items-center gap-3 rounded-full bg-pine px-7 py-3.5 text-sm font-semibold text-cream shadow-sm transition-colors duration-300 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {t.readStory}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover/cta:translate-x-1" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
