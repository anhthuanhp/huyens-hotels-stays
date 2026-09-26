"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { blogPosts } from "../../data/blog";

type Language = "vi" | "en";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default function BlogDetailPage({ params }: Props) {
  const { slug } = use(params);

  const [language, setLanguage] = useState<Language>("vi");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");

    if (savedLanguage === "vi" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }

    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<Language>;
      setLanguage(customEvent.detail);
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

  const post = blogPosts.find(
    (item) =>
      item.slug === slug && item.status === "active"
  );

  if (!post) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">
            {language === "vi"
              ? "Không tìm thấy bài viết"
              : "Article not found"}
          </h1>

          <Link
            href="/blog"
            className="mt-6 inline-block rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white"
          >
            {language === "vi"
              ? "QUAY LẠI BLOG"
              : "BACK TO BLOG"}
          </Link>
        </div>
      </main>
    );
  }

  const title =
    language === "vi"
      ? post.titleVi
      : post.titleEn;

  const category =
    language === "vi"
      ? post.categoryVi
      : post.categoryEn;

  const content =
    language === "vi"
      ? post.contentVi
      : post.contentEn;

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
            <Link href="/" className="hover:text-sky-600">
              {language === "vi" ? "TRANG CHỦ" : "HOME"}
            </Link>

            <Link
              href="/kham-pha-huyens"
              className="hover:text-sky-600"
            >
              {language === "vi" ? "KHÁM PHÁ" : "DISCOVER"}
            </Link>

            <Link href="/phong" className="hover:text-sky-600">
              {language === "vi" ? "PHÒNG" : "ROOMS"}
            </Link>

            <Link href="/uu-dai" className="hover:text-sky-600">
              {language === "vi" ? "ƯU ĐÃI" : "OFFERS"}
            </Link>

            <Link
              href="/trai-nghiem"
              className="hover:text-sky-600"
            >
              {language === "vi"
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
                onClick={() => {
                  localStorage.setItem("language", "vi");
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

              <span className="text-slate-300">|</span>

              <button
                onClick={() => {
                  localStorage.setItem("language", "en");
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
              {language === "vi"
                ? "ĐẶT PHÒNG"
                : "BOOK NOW"}
            </Link>
          </div>
        </div>
      </header>

      {/* ARTICLE HERO */}
      <section className="relative overflow-hidden pt-20">
        <div className="relative h-[520px]">
          <img
            src={post.image}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/55" />

          <div className="relative z-10 mx-auto flex h-full max-w-[1100px] items-end px-6 pb-16">
            <div className="max-w-4xl text-white">
              <div className="mb-5 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-sky-300">
                <span>{category}</span>

                <span className="text-white/40">•</span>

                <span>
                  {post.readTime}{" "}
                  {language === "vi"
                    ? "phút đọc"
                    : "min read"}
                </span>
              </div>

              <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
                {title}
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/85">
                {language === "vi"
                  ? post.excerptVi
                  : post.excerptEn}
              </p>

              <p className="mt-6 text-sm text-white/60">
                {new Date(post.date).toLocaleDateString(
                  language === "vi"
                    ? "vi-VN"
                    : "en-US",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ARTICLE */}
      <article className="mx-auto max-w-[820px] px-6 py-16">
        <div className="space-y-7">
          {content.map((paragraph, index) => (
            <p
              key={index}
              className="text-lg leading-9 text-slate-700"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-14 border-t border-slate-200 pt-8">
          <Link
            href="/blog"
            className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold transition hover:border-sky-600 hover:text-sky-600"
          >
            ←{" "}
            {language === "vi"
              ? "QUAY LẠI BLOG"
              : "BACK TO BLOG"}
          </Link>
        </div>
      </article>

      {/* CTA */}
      <section className="bg-slate-900 px-6 py-20 text-center text-white">
        <h2 className="text-3xl font-semibold md:text-4xl">
          {language === "vi"
            ? "Tìm nơi lưu trú cho hành trình của bạn"
            : "Find a place to stay for your journey"}
        </h2>

        <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/70">
          {language === "vi"
            ? "Khám phá các khách sạn và homestay thuộc Huyen's Hotels & Stays."
            : "Explore hotels and homestays from Huyen's Hotels & Stays."}
        </p>

        <Link
          href="/tim-phong"
          className="mt-8 inline-flex rounded-full bg-sky-600 px-7 py-3 font-semibold text-white transition hover:bg-sky-700"
        >
          {language === "vi"
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
              {language === "vi"
                ? "Khám phá"
                : "Discover"}
            </Link>

            <Link
              href="/phong"
              className="hover:text-sky-600"
            >
              {language === "vi"
                ? "Phòng"
                : "Rooms"}
            </Link>

            <Link
              href="/uu-dai"
              className="hover:text-sky-600"
            >
              {language === "vi"
                ? "Ưu đãi"
                : "Offers"}
            </Link>

            <Link
              href="/trai-nghiem"
              className="hover:text-sky-600"
            >
              {language === "vi"
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