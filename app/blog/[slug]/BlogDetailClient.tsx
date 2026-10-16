
"use client";

import { useLanguage } from "@/app/lib/use-language";

import Image from "next/image";
import CityTravelGuide from "../../components/CityTravelGuide";
import { CITY_GUIDE_SLUG } from "../../data/city-guide";
import { parseBlogContent, splitBlogLinks } from "../../lib/blog-content";
import Link from "@/app/components/LocalizedLink";

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
  const language = useLanguage();

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

  const content = parseBlogContent(contentText || "");

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
      {/* ARTICLE HEADER */}
      <section className="bg-white px-6 pb-10 pt-10">
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-5 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-sky-600">
            <span>{category}</span>

            <span className="text-slate-300">
              •
            </span>

            <span>
              {post.read_time}{" "}
              {isVi
                ? "phút đọc"
                : "min read"}
            </span>
          </div>

          <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-slate-900 md:text-5xl">
            {title}
          </h1>

          {excerpt && (
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              {excerpt}
            </p>
          )}

          <p className="mt-5 text-sm text-slate-400">
            {formattedDate}
          </p>
        </div>
      </section>

      {/* FEATURE IMAGE */}
      {post.image && (
        <section className="px-6 pb-12">
          <div className="mx-auto max-w-[1000px]">
            <div className="relative h-[280px] overflow-hidden rounded-2xl bg-slate-100 md:h-[400px]">
              <Image
                src={post.image}
                alt={title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1000px"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* ARTICLE */}
      <article className="mx-auto max-w-[820px] px-6 pb-16">
        <div className="space-y-7">
          {content.length > 0 ? (
            content.map((block, index) => block.type === "heading" ? (
  <h2 key={post.id + "-" + index} className="pt-4 text-2xl font-semibold leading-snug text-slate-900">{block.text}</h2>
) : (
  <p key={post.id + "-" + index} className="whitespace-pre-line text-lg leading-9 text-slate-700">
    {splitBlogLinks(block.text).map((part, partIndex) => part.href ? (
      <span key={partIndex}><a href={part.href} className="break-words font-medium text-sky-800 underline underline-offset-4">{part.text}</a>{part.suffix}</span>
    ) : <span key={partIndex}>{part.text}</span>)}
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

        {post.slug === CITY_GUIDE_SLUG && <CityTravelGuide language={language} />}

        {/* BACK TO BLOG */}
        <div className="mt-14 border-t border-slate-200 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-600 hover:text-sky-600"
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
              {isVi
                ? "Phòng"
                : "Rooms"}
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

