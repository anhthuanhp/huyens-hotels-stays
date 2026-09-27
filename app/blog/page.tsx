
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Language = "vi" | "en";

type BlogPost = {
  id: number;
  slug: string;
  title_vi: string;
  title_en: string;
  excerpt_vi: string | null;
  excerpt_en: string | null;
  category_vi: string | null;
  category_en: string | null;
  image: string | null;
  date: string;
  read_time: number;
  featured: boolean;
  status: "active" | "inactive";
};

type Category = {
  vi: string;
  en: string;
  descriptionVi: string;
  descriptionEn: string;
};

const categories: Category[] = [
  {
    vi: "Ẩm thực",
    en: "Food & Dining",
    descriptionVi:
      "Khám phá hương vị, món ăn và những trải nghiệm ẩm thực đáng nhớ.",
    descriptionEn:
      "Discover local flavors, food spots, and memorable dining experiences.",
  },
  {
    vi: "Cuộc sống địa phương",
    en: "Local Life",
    descriptionVi:
      "Khám phá nhịp sống, con người và những điều thú vị tại địa phương.",
    descriptionEn:
      "Discover local life, people, neighborhoods, and everyday experiences.",
  },
  {
    vi: "Kinh nghiệm lưu trú",
    en: "Stay Tips",
    descriptionVi:
      "Những kinh nghiệm hữu ích giúp bạn có một kỳ lưu trú thoải mái.",
    descriptionEn:
      "Useful tips to help you enjoy a comfortable and convenient stay.",
  },
  {
    vi: "Huyen's Stories",
    en: "Huyen's Stories",
    descriptionVi:
      "Những câu chuyện, trải nghiệm và góc nhìn từ Huyen's Hotels & Stays.",
    descriptionEn:
      "Stories, experiences, and perspectives from Huyen's Hotels & Stays.",
  },
];

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "vi";
  }

  const savedLanguage =
    window.localStorage.getItem("huyen-language");

  return savedLanguage === "en" ? "en" : "vi";
}

function formatDate(date: string, language: Language) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(
    language === "vi" ? "vi-VN" : "en-US",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(parsedDate);
}

function getPostTitle(post: BlogPost, language: Language) {
  return language === "vi" ? post.title_vi : post.title_en;
}

function getPostExcerpt(post: BlogPost, language: Language) {
  return language === "vi"
    ? post.excerpt_vi
    : post.excerpt_en;
}

function getPostCategory(post: BlogPost, language: Language) {
  return language === "vi"
    ? post.category_vi
    : post.category_en;
}

function BlogCard({
  post,
  language,
}: {
  post: BlogPost;
  language: Language;
}) {
  const title = getPostTitle(post, language);
  const excerpt = getPostExcerpt(post, language);
  const category = getPostCategory(post, language);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* MOBILE */}
        <div className="p-4 sm:hidden">
          <div className="relative float-left mr-3 mb-2 aspect-[4/3] w-[25%] overflow-hidden rounded-lg bg-slate-100">
            {post.image ? (
              <Image
                src={post.image}
                alt={title}
                fill
                sizes="25vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-1 text-center text-[9px] leading-3 text-slate-400">
                Huyen&apos;s Hotels &amp; Stays
              </div>
            )}
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] leading-4 text-slate-500">
            {category && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                {category}
              </span>
            )}

            <span>{formatDate(post.date, language)}</span>

            <span>•</span>

            <span>
              {post.read_time}{" "}
              {language === "vi" ? "phút đọc" : "min"}
            </span>
          </div>

          <h3 className="text-base font-semibold leading-snug text-slate-900 transition group-hover:text-sky-700">
            {title}
          </h3>

          {excerpt && (
            <p className="mt-2 text-xs leading-5 text-slate-600">
              {excerpt}
            </p>
          )}

          <div className="mt-3 text-xs font-semibold text-sky-700">
            {language === "vi"
              ? "Đọc bài viết →"
              : "Read article →"}
          </div>

          <div className="clear-both" />
        </div>

        {/* TABLET / DESKTOP */}
        <div className="hidden sm:block">
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
            {post.image ? (
              <Image
                src={post.image}
                alt={title}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
                Huyen&apos;s Hotels &amp; Stays
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {category && (
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                  {category}
                </span>
              )}

              <span>{formatDate(post.date, language)}</span>

              <span>•</span>

              <span>
                {post.read_time}{" "}
                {language === "vi" ? "phút đọc" : "min read"}
              </span>
            </div>

            <h3 className="text-xl font-semibold leading-snug text-slate-900 transition group-hover:text-sky-700">
              {title}
            </h3>

            {excerpt && (
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                {excerpt}
              </p>
            )}

            <div className="mt-5 text-sm font-semibold text-sky-700">
              {language === "vi"
                ? "Đọc bài viết →"
                : "Read article →"}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function CategorySection({
  category,
  posts,
  language,
}: {
  category: Category;
  posts: BlogPost[];
  language: Language;
}) {
  const title =
    language === "vi" ? category.vi : category.en;

  const description =
    language === "vi"
      ? category.descriptionVi
      : category.descriptionEn;

  return (
    <section className="border-t border-slate-200 pt-12">
      <div className="mb-7">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              language={language}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <p className="text-sm text-slate-500">
            {language === "vi"
              ? "Các bài viết mới sẽ được cập nhật tại đây."
              : "New articles will be added here soon."}
          </p>
        </div>
      )}
    </section>
  );
}

export default function BlogPage() {
  const [language, setLanguage] =
    useState<Language>(getInitialLanguage);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleLanguageChange = () => {
      const currentLanguage =
        window.localStorage.getItem("huyen-language");

      if (
        currentLanguage === "en" ||
        currentLanguage === "vi"
      ) {
        setLanguage(currentLanguage);
      }
    };

    window.addEventListener(
      "language-change",
      handleLanguageChange
    );

    return () => {
      window.removeEventListener(
        "language-change",
        handleLanguageChange
      );
    };
  }, []);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          `
            id,
            slug,
            title_vi,
            title_en,
            excerpt_vi,
            excerpt_en,
            category_vi,
            category_en,
            image,
            date,
            read_time,
            featured,
            status
          `
        )
        .eq("status", "active")
        .order("date", { ascending: false });

      if (error) {
        console.error(
          "Lỗi tải danh sách Blog:",
          error
        );

        setErrorMessage(
          language === "vi"
            ? "Không thể tải bài viết."
            : "Unable to load articles."
        );

        setPosts([]);
        setLoading(false);
        return;
      }

      setPosts((data as BlogPost[]) || []);
      setLoading(false);
    }

    loadPosts();
  }, [language]);

  const featuredPost = useMemo(() => {
    return (
      posts.find((post) => post.featured) ||
      posts[0] ||
      null
    );
  }, [posts]);

  const categoryPosts = useMemo(() => {
    return categories.map((category) => ({
      category,
      posts: posts
        .filter(
          (post) =>
            post.category_vi === category.vi ||
            post.category_en === category.en
        )
        .filter(
          (post) => post.id !== featuredPost?.id
        )
        .slice(0, 3),
    }));
  }, [posts, featuredPost]);

  const pageDescription =
    language === "vi"
      ? "Khám phá những câu chuyện, trải nghiệm và kinh nghiệm hữu ích cho hành trình của bạn tại TP. Hồ Chí Minh."
      : "Discover stories, experiences, and useful travel tips for your journey in Ho Chi Minh City.";

  const featuredLabel =
    language === "vi"
      ? "Bài viết nổi bật"
      : "Featured article";

  const readArticle =
    language === "vi"
      ? "Đọc bài viết →"
      : "Read article →";

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
              Huyen&apos;s Hotels &amp; Stays
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Blog
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {pageDescription}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        {loading ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-500">
              {language === "vi"
                ? "Đang tải bài viết..."
                : "Loading articles..."}
            </p>
          </div>
        ) : errorMessage ? (
          <div className="py-16 text-center">
            <p className="text-sm text-red-600">
              {errorMessage}
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-500">
              {language === "vi"
                ? "Chưa có bài viết nào."
                : "There are no articles yet."}
            </p>
          </div>
        ) : (
          <>
            {featuredPost && (
              <section className="py-12 sm:py-14">
                <div className="mb-7">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {featuredLabel}
                  </h2>
                </div>

                {/* =========================
                    FEATURED - MOBILE
                   ========================= */}
                <div className="sm:hidden">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:shadow-xl"
                  >
                    <div className="relative float-left mr-3 mb-2 aspect-[4/3] w-[25%] overflow-hidden rounded-lg bg-slate-100">
                      {featuredPost.image ? (
                        <Image
                          src={featuredPost.image}
                          alt={getPostTitle(
                            featuredPost,
                            language
                          )}
                          fill
                          sizes="25vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-1 text-center text-[9px] leading-3 text-slate-400">
                          Huyen&apos;s Hotels &amp; Stays
                        </div>
                      )}
                    </div>

                    <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] leading-4 text-slate-500">
                      {getPostCategory(
                        featuredPost,
                        language
                      ) && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                          {getPostCategory(
                            featuredPost,
                            language
                          )}
                        </span>
                      )}

                      <span>
                        {formatDate(
                          featuredPost.date,
                          language
                        )}
                      </span>

                      <span>•</span>

                      <span>
                        {featuredPost.read_time}{" "}
                        {language === "vi"
                          ? "phút đọc"
                          : "min"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold leading-snug text-slate-900 transition group-hover:text-sky-700">
                      {getPostTitle(
                        featuredPost,
                        language
                      )}
                    </h3>

                    {getPostExcerpt(
                      featuredPost,
                      language
                    ) && (
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {getPostExcerpt(
                          featuredPost,
                          language
                        )}
                      </p>
                    )}

                    <div className="mt-3 text-xs font-semibold text-sky-700">
                      {readArticle}
                    </div>

                    <div className="clear-both" />
                  </Link>
                </div>

                {/* =========================
                    FEATURED - TABLET / DESKTOP
                   ========================= */}
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:shadow-xl sm:grid lg:grid-cols-2"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 lg:aspect-auto lg:min-h-[360px]">
                    {featuredPost.image ? (
                      <Image
                        src={featuredPost.image}
                        alt={getPostTitle(
                          featuredPost,
                          language
                        )}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full min-h-[280px] items-center justify-center bg-slate-100 text-sm text-slate-400">
                        Huyen&apos;s Hotels &amp; Stays
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-12">
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {getPostCategory(
                        featuredPost,
                        language
                      ) && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                          {getPostCategory(
                            featuredPost,
                            language
                          )}
                        </span>
                      )}

                      <span>
                        {formatDate(
                          featuredPost.date,
                          language
                        )}
                      </span>

                      <span>•</span>

                      <span>
                        {featuredPost.read_time}{" "}
                        {language === "vi"
                          ? "phút đọc"
                          : "min read"}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold leading-tight text-slate-900 transition group-hover:text-sky-700 sm:text-3xl">
                      {getPostTitle(
                        featuredPost,
                        language
                      )}
                    </h3>

                    {getPostExcerpt(
                      featuredPost,
                      language
                    ) && (
                      <p className="mt-5 text-base leading-7 text-slate-600">
                        {getPostExcerpt(
                          featuredPost,
                          language
                        )}
                      </p>
                    )}

                    <div className="mt-7 text-sm font-semibold text-sky-700">
                      {readArticle}
                    </div>
                  </div>
                </Link>
              </section>
            )}

            <div className="space-y-14">
              {categoryPosts.map(
                ({ category, posts: categoryPostList }) => (
                  <CategorySection
                    key={category.vi}
                    category={category}
                    posts={categoryPostList}
                    language={language}
                  />
                )
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
