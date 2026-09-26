"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { blogPosts } from "../data/blog";
import Footer from "../components/Footer";

type Language = "vi" | "en";

export default function BlogPage() {
  const [language, setLanguage] =
    useState<Language>("vi");

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem("language");

    if (
      savedLanguage === "vi" ||
      savedLanguage === "en"
    ) {
      setLanguage(savedLanguage);
    }

    const handleLanguageChange = (
      event: Event
    ) => {
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

  const activePosts = blogPosts.filter(
    (post) => post.status === "active"
  );

  const featuredPost =
    activePosts.find(
      (post) => post.featured
    ) || activePosts[0];

  const otherPosts = activePosts.filter(
    (post) =>
      post.slug !== featuredPost?.slug
  );

  const isVi = language === "vi";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* BACK TO HOME */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center px-6 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-sky-600"
          >
            <span aria-hidden="true">
              ←
            </span>

            <span>
              {isVi
                ? "Quay về trang chính"
                : "Back to Main"}
            </span>
          </Link>
        </div>
      </div>

      {/* INTRO */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              {isVi
                ? "Câu chuyện & cảm hứng"
                : "Stories & Inspiration"}
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600 sm:text-xl">
              {isVi
                ? "Những câu chuyện về thành phố, ẩm thực, con người và những hành trình đáng nhớ."
                : "Stories about cities, food, people and memorable journeys."}
            </p>
          </div>

          {/* CATEGORIES */}
          <div className="mt-10 flex flex-wrap gap-3">
            <span className="rounded-full bg-sky-50 px-5 py-2.5 text-sm font-semibold text-sky-700">
              {isVi
                ? "Thành phố"
                : "Cities"}
            </span>

            <span className="rounded-full bg-sky-50 px-5 py-2.5 text-sm font-semibold text-sky-700">
              {isVi
                ? "Ẩm thực"
                : "Food"}
            </span>

            <span className="rounded-full bg-sky-50 px-5 py-2.5 text-sm font-semibold text-sky-700">
              {isVi
                ? "Con người"
                : "People"}
            </span>

            <span className="rounded-full bg-sky-50 px-5 py-2.5 text-sm font-semibold text-sky-700">
              {isVi
                ? "Chuyện du lịch"
                : "Travel Stories"}
            </span>
          </div>
        </div>
      </section>

      {/* FEATURED ARTICLE */}
      {featuredPost && (
        <section className="mx-auto max-w-[1200px] px-6 pb-16">
          <div className="overflow-hidden rounded-3xl bg-slate-50">
            <div className="grid md:grid-cols-2">
              {/* IMAGE */}
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="block overflow-hidden"
              >
                <img
                  src={featuredPost.image}
                  alt={
                    isVi
                      ? featuredPost.titleVi
                      : featuredPost.titleEn
                  }
                  className="h-full min-h-[320px] w-full object-cover transition duration-500 hover:scale-105 md:min-h-[440px]"
                />
              </Link>

              {/* CONTENT */}
              <div className="flex flex-col justify-center p-8 sm:p-10 md:p-12">
                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider text-sky-600">
                  <span>
                    {isVi
                      ? featuredPost.categoryVi
                      : featuredPost.categoryEn}
                  </span>

                  <span className="text-slate-300">
                    •
                  </span>

                  <span>
                    {featuredPost.readTime}{" "}
                    {isVi
                      ? "phút đọc"
                      : "min read"}
                  </span>
                </div>

                <h2 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
                  {isVi
                    ? featuredPost.titleVi
                    : featuredPost.titleEn}
                </h2>

                <p className="mt-5 leading-8 text-slate-600">
                  {isVi
                    ? featuredPost.excerptVi
                    : featuredPost.excerptEn}
                </p>

                <div className="mt-8">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                  >
                    {isVi
                      ? "ĐỌC BÀI VIẾT"
                      : "READ ARTICLE"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* LATEST STORIES */}
      <section className="bg-slate-50 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">
              {isVi
                ? "Câu chuyện"
                : "Stories"}
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              {isVi
                ? "Những bài viết mới nhất"
                : "Latest stories"}
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {isVi
                ? "Khám phá những câu chuyện về thành phố, ẩm thực, con người và những trải nghiệm trong hành trình."
                : "Discover stories about cities, food, people and experiences along the journey."}
            </p>
          </div>

          {otherPosts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <p className="text-base text-slate-500">
                {isVi
                  ? "Hiện chưa có bài viết nào khác."
                  : "There are currently no other stories available."}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {otherPosts.map(
                (post) => (
                  <article
                    key={post.slug}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block overflow-hidden"
                    >
                      <img
                        src={post.image}
                        alt={
                          isVi
                            ? post.titleVi
                            : post.titleEn
                        }
                        className="h-64 w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </Link>

                    <div className="p-7">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider text-sky-600">
                        <span>
                          {isVi
                            ? post.categoryVi
                            : post.categoryEn}
                        </span>

                        <span className="text-slate-300">
                          •
                        </span>

                        <span>
                          {post.readTime}{" "}
                          {isVi
                            ? "phút đọc"
                            : "min read"}
                        </span>
                      </div>

                      <h3 className="mt-4 text-2xl font-semibold leading-tight text-slate-900">
                        {isVi
                          ? post.titleVi
                          : post.titleEn}
                      </h3>

                      <p className="mt-4 leading-7 text-slate-600">
                        {isVi
                          ? post.excerptVi
                          : post.excerptEn}
                      </p>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="mt-6 inline-block text-sm font-bold text-sky-600 transition hover:text-sky-700"
                      >
                        {isVi
                          ? "XEM CHI TIẾT →"
                          : "READ MORE →"}
                      </Link>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* BLOG CATEGORIES */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                01
              </p>

              <h3 className="mt-4 text-xl font-semibold">
                {isVi
                  ? "Thành phố"
                  : "Cities"}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {isVi
                  ? "Những góc phố, địa điểm và câu chuyện tạo nên nét riêng của thành phố."
                  : "Places, streets and stories that give a city its character."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                02
              </p>

              <h3 className="mt-4 text-xl font-semibold">
                {isVi
                  ? "Ẩm thực"
                  : "Food"}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {isVi
                  ? "Món ăn địa phương, quán ăn và những câu chuyện phía sau ẩm thực."
                  : "Local dishes, eateries and the stories behind food."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                03
              </p>

              <h3 className="mt-4 text-xl font-semibold">
                {isVi
                  ? "Con người"
                  : "People"}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {isVi
                  ? "Những con người và câu chuyện đời thường làm nên sức sống của một nơi."
                  : "People and everyday stories that bring a place to life."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                04
              </p>

              <h3 className="mt-4 text-xl font-semibold">
                {isVi
                  ? "Chuyện du lịch"
                  : "Travel Stories"}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {isVi
                  ? "Những hành trình, trải nghiệm và câu chuyện đáng nhớ trên đường đi."
                  : "Journeys, experiences and memorable moments along the way."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer language={language} />
    </main>
  );
}