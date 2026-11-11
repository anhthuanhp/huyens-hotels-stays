import { useMemo, useState } from "react";
import BlogFinalCta from "./BlogFinalCta";
import BlogHero from "./BlogHero";
import CategoryFilter from "./CategoryFilter";
import FeaturedStory from "./FeaturedStory";
import JournalGrid from "./JournalGrid";
import {
  BLOG_CATEGORIES,
  getBlogCopy,
  postMatchesCategory,
} from "./blog-i18n";
import type { BlogPageClientProps } from "./types";

const ALL_CATEGORY = "all";

export default function BlogPageClient({ posts, language = "vi" }: BlogPageClientProps) {
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const t = getBlogCopy(language);

  const featuredPost = useMemo(
    () => posts.find((post) => post.featured) ?? posts[0] ?? null,
    [posts],
  );

  const showFeatured = activeCategory === ALL_CATEGORY && featuredPost !== null;

  const gridPosts = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) {
      return posts.filter((post) => post.id !== featuredPost?.id);
    }
    const category = BLOG_CATEGORIES.find((item) => item.id === activeCategory);
    return category ? posts.filter((post) => postMatchesCategory(post, category)) : [];
  }, [activeCategory, posts, featuredPost]);

  const hasPosts = posts.length > 0;

  return (
    <div className="min-h-screen bg-cream font-sans text-ink antialiased">
      <BlogHero language={language} />

      {!hasPosts ? (
        <section className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24">
          <p className="font-serif text-2xl leading-[1.3] text-pine md:text-3xl">{t.emptyTitle}</p>
        </section>
      ) : (
        <>
          {showFeatured && featuredPost && (
            <div className="mx-auto max-w-7xl px-6 pb-16 md:pb-24">
              <FeaturedStory post={featuredPost} language={language} />
            </div>
          )}

          <section aria-labelledby="journal-grid-title" className="mx-auto max-w-7xl px-6 pb-20 md:pb-28">
            <div className="mb-10 flex flex-col items-center gap-6 md:mb-12">
              <h2 id="journal-grid-title" className="font-serif text-3xl text-pine md:text-4xl">
                {t.gridTitle}
              </h2>
              <CategoryFilter
                activeCategory={activeCategory}
                onChange={setActiveCategory}
                language={language}
              />
            </div>

            {gridPosts.length > 0 ? (
              <JournalGrid posts={gridPosts} language={language} />
            ) : (
              activeCategory !== ALL_CATEGORY && (
                <p className="py-12 text-center text-base text-muted">{t.emptyCategory}</p>
              )
            )}
          </section>
        </>
      )}

      <BlogFinalCta language={language} />
    </div>
  );
}
