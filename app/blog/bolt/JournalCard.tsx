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

type JournalCardProps = {
  post: BlogPost;
  language: Language;
};

export default function JournalCard({ post, language }: JournalCardProps) {
  const t = getBlogCopy(language);
  const title = getPostTitle(post, language);
  const excerpt = getPostExcerpt(post, language);
  const category = getPostCategory(post, language);
  const href = getPostHref(post.slug);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow duration-500 hover:shadow-card-hover">
      <a
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[4/3] overflow-hidden bg-sage"
      >
        {post.image ? (
          <img
            src={post.image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cream to-sage">
            <BookOpen className="h-10 w-10 text-accent/40" strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
      </a>

      <div className="flex flex-1 flex-col p-6 md:p-7">
        {category && (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{category}</p>
        )}

        <h3 className="mt-3 font-serif text-2xl leading-[1.2] text-pine transition-colors duration-300 group-hover:text-accent">
          <a href={href} className="line-clamp-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm">
            {title}
          </a>
        </h3>

        {excerpt && (
          <p className="mt-3 line-clamp-3 flex-1 text-[15px] leading-[1.5] text-muted">{excerpt}</p>
        )}

        <div className="mt-6 flex flex-col gap-4 border-t border-pine/10 pt-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <time dateTime={post.date}>{formatPostDate(post.date, language)}</time>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {t.minutesRead(post.read_time)}
            </span>
          </div>
          <a
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-pine transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm"
          >
            {t.readArticle}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
