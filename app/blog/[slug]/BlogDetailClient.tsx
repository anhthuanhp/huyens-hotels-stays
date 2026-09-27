"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Language = "vi" | "en";

type BlogPost = {
  id: number;
  slug: string;
  title_vi: string;
  title_en: string;
  excerpt_vi: string | null;
  excerpt_en: string | null;
  content_vi: string | null;
  content_en: string | null;
  category_vi: string | null;
  category_en: string | null;
  image: string | null;
  date: string;
  read_time: number;
  featured: boolean;
  status: "active" | "inactive";
  updated_at: string;
};

type Props = {
  post: BlogPost;
};

export default function BlogDetailClient({
  post,
}: Props) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "vi";
    }

    const saved = localStorage.getItem(
      "huyen-language"
    );

    return saved === "vi" || saved === "en"
      ? saved
      : "vi";
  });

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const customEvent =
        event as CustomEvent<Language>;

      if (
        customEvent.detail === "vi" ||
        customEvent.detail === "en"
      ) {
        setLanguage(customEvent.detail);
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

  const isVi = language === "vi";

  const title = isVi
    ? post.title_vi
    : post.title_en;

  const category = isVi
    ? post.category_vi || "Du lịch"
    : post.category_en || "Travel";

  const excerpt = isVi
    ? post.excerpt_vi
    : post.excerpt_en;

  const contentText = isVi
    ? post.content_vi
    : post.content_en;

  const content = contentText
    ? contentText
        .split(/\r?\n\r?\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];

  const formattedDate = new Date(
    `${post.date}T00:00:00`
  ).toLocaleDateString(
    isVi ? "vi-VN" : "en-US",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HEADER */}
      <header className="fixed left-0 top-0 z-50 w-full border-b border-white/20 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            Huyen&apos;s Hotels &amp; Stays
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
            <Link
              href="/"
              className="hover:text-sky-600"
            >
              {isVi ? "TRANG CHỦ" : "HOME"}
            </Link>

            <Link
              href="/kham-pha-huyens"
              className="hover:text-sky-600"
            >
              {isVi ? "KHÁM PHÁ" : "DISCOVER"}
            </Link>

            <Link
              href="/phong"
              className="hover:text-sky-600"
            >
              {isVi ? "PHÒNG" : "ROOMS"}
            </Link>

            <Link
              href="/trai-nghiem"
              className="hover:text-sky-600"
            >
              {isVi
                ? "TRẢI NGHIỆM"
                : "EXPERIENCES"}
            </Link>

            <Link
              href="/blog"
              className="font-semibold text-sky-600"
            >
              BLOG
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-xs font-semibold sm:flex">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(
                    "huyen-language",
                    "vi"
                  );

                  setLanguage("vi");

                  window.dispatchEvent(
                    new CustomEvent<Language>(
                      "language-change",
                      {
                        detail: "vi",
                      }
                    )
                  );
                }}
                className={
                  language === "vi"
                    ? "text-sky-600"
                    : "text-slate-500"
                }
              >
                VI
              </button>

              <span className="text-slate-300">
                |
              </span>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(
                    "huyen-language",
                    "en"
                  );

                  setLanguage("en");

                  window.dispatchEvent(
                    new CustomEvent<Language>(
                      "language-change",
                      {
                        detail: "en",
                      }
                    )
                  );
                }}
                className={
                  language === "en"
                    ? "text-sky-600"
                    : "text-slate-500"
                }
              >
                EN
              </button>
            </div>

            <Link
              href="/tim-phong"
              className="rounded-full bg-sky-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-sky-700"
            >
              {isVi
                ? "ĐẶT PHÒNG"
                : "BOOK NOW"}
            </Link>
          </div>
        </div>
      </header>

      {/* ARTICLE HERO */}
      <section className="relative overflow-hidden pt-20">
        <div className="relative h-[520px] bg-slate-900">
          {post.image && (
            <Image
              src={post.image}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}

          <div className="absolute inset-0 bg-black/55" />

          <div className="relative z-10 mx-auto flex h-full max-w-[1100px] items-end px-6 pb-16">
            <div className="max-w-4xl text-white">
              <div className="mb-5 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-sky-300">
                <span>{category}</span>

                <span className="text-white/40">
                  •
                </span>

                <span>
                  {post.read_time}{" "}
                  {isVi
                    ? "phút đọc"
                    : "min read"}
                </span>
              </div>

              <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
                {title}
              </h1>

              {excerpt && (
                <p className="mt-6 max-w-3xl text-lg leading-8 text-white/85">
                  {excerpt}
                </p>
              )}

              <p className="mt-6 text-sm text-white/60">
                {formattedDate}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ARTICLE */}
      <article className="mx-auto max-w-[820px] px-6 py-16">
        <div className="space-y-7">
          {content.length > 0 ? (
            content.map((paragraph, index) => (
              <p
                key={`${post.id}-${index}`}
                className="text-lg leading-9 text-slate-700"
              >
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-lg leading-9 text-slate-500">
              {isVi
                ? "Nội dung bài viết đang được cập nhật."
                : "Article content is being updated."}
            </p>
          )}
        </div>

        <div className="mt-14 border-t border-slate-200 pt-8">
          <Link
            href="/blog"
            className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold transition hover:border-sky-600 hover:text-sky-600"
          >
            ←{" "}
            {isVi
              ? "QUAY LẠI BLOG"
              : "BACK TO BLOG"}
          </Link>
        </div>
      </article>

      {/* CTA */}
      <section className="bg-slate-900 px-6 py-20 text-center text-white">
        <h2 className="text-3xl font-semibold md:text-4xl">
          {isVi
            ? "Tìm nơi lưu trú cho hành trình của bạn"
            : "Find a place to stay for your journey"}
        </h2>

        <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/70">
          {isVi
            ? "Khám phá các khách sạn và homestay thuộc Huyen's Hotels & Stays."
            : "Explore hotels and homestays from Huyen's Hotels & Stays."}
        </p>

        <Link
          href="/tim-phong"
          className="mt-8 inline-flex rounded-full bg-sky-600 px-7 py-3 font-semibold text-white transition hover:bg-sky-700"
        >
          {isVi
            ? "TÌM PHÒNG"
            : "FIND A ROOM"}
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-white px-6 py-12">
        <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-6 border-t border-slate-200 pt-8 md:flex-row">
          <Link
            href="/"
            className="font-semibold"
          >
            Huyen&apos;s Hotels &amp; Stays
          </Link>

          <div className="flex flex-wrap gap-6 text-sm text-slate-500">
            <Link
              href="/kham-pha-huyens"
              className="hover:text-sky-600"
            >
              {isVi
                ? "Khám phá"
                : "Discover"}
            </Link>

            <Link
              href="/phong"
              className="hover:text-sky-600"
            >
              {isVi ? "Phòng" : "Rooms"}
            </Link>

            <Link
              href="/trai-nghiem"
              className="hover:text-sky-600"
            >
              {isVi
                ? "Trải nghiệm"
                : "Experiences"}
            </Link>

            <Link
              href="/blog"
              className="hover:text-sky-600"
            >
              Blog
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}