import { languageAlternates } from "@/app/lib/localized-path";
import { englishInventory, englishPaths } from "@/app/lib/english-data";
import { canonicalSeoPath } from "@/app/lib/room-seo-slugs";
import { BLOG_SEO, seoDescription } from "../../lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";

import BlogDetailClient from "./BlogDetailClient";

export const revalidate = 60;
export const dynamic = "force-static";

export async function generateStaticParams() {
  const { data, error } = await getSupabaseServerClient().from("blog_posts").select("slug").eq("status", "active");
  if (error) {
    console.warn("Blog slugs unavailable at build time. Posts will be generated on demand.");
    return [];
  }
  return (data || []).filter((post) => typeof post.slug === "string" && post.slug.trim()).map((post) => ({ slug: post.slug }));
}

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
  params: Promise<{
    slug: string;
  }>;
};

function getSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

const getPost = cache(
  async (
    slug: string
  ): Promise<BlogPost | null> => {
    const supabase =
      getSupabaseServerClient();

    const { data, error } =
      await supabase
        .from("blog_posts")
        .select(`
          id,
          slug,
          title_vi,
          title_en,
          excerpt_vi,
          excerpt_en,
          content_vi,
          content_en,
          category_vi,
          category_en,
          image,
          date,
          read_time,
          featured,
          status,
          updated_at
        `)
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();

    if (error) {
      console.error(
        "Lỗi tải bài viết Blog:",
        error
      );

      throw new Error("Blog post data is temporarily unavailable.");
    }

    return data as BlogPost | null;
  }
);

/* =========================================================
   SEO HELPERS
========================================================= */

function getImageUrl(
  image: string | null,
  siteUrl: string
): string | undefined {
  if (!image) {
    return undefined;
  }

  const value = image.trim();

  if (!value) {
    return undefined;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `${siteUrl}${
    value.startsWith("/")
      ? value
      : `/${value}`
  }`;
}

function cleanText(
  value: string | null | undefined
): string {
  return (value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateDescription(
  value: string,
  maxLength = 158
): string {
  const cleaned =
    cleanText(value);

  if (
    cleaned.length <=
    maxLength
  ) {
    return cleaned;
  }

  const shortened =
    cleaned.slice(
      0,
      maxLength - 1
    );

  const lastSpace =
    shortened.lastIndexOf(" ");

  return (
    shortened.slice(
      0,
      lastSpace > 80
        ? lastSpace
        : shortened.length
    ) + "…"
  );
}

/* =========================================================
   BREADCRUMB SCHEMA
========================================================= */

function createBreadcrumbStructuredData(
  title: string,
  siteUrl: string,
  blogUrl: string,
  canonicalUrl: string,
  english: boolean
) {
  return {
    "@context":
      "https://schema.org",

    "@type":
      "BreadcrumbList",

    "@id":
      `${canonicalUrl}#breadcrumb`,

    itemListElement: [
      {
        "@type":
          "ListItem",
        position: 1,
        name:
          english ? "Home" : "Trang chủ",
        item:
          siteUrl,
      },
      {
        "@type":
          "ListItem",
        position: 2,
        name:
          english ? "Travel guides" : "Blog",
        item:
          blogUrl,
      },
      {
        "@type":
          "ListItem",
        position: 3,
        name:
          title,
        item:
          canonicalUrl,
      },
    ],
  };
}

/* =========================================================
   SEO METADATA
========================================================= */

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } =
    await params;

  const post =
    await getPost(slug);

  if (!post) {
    return {
      title:
        "Bài viết không tồn tại | Huyen's Hotels & Stays",

      description:
        "Bài viết bạn tìm kiếm không tồn tại hoặc đã được gỡ khỏi website.",

      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://huyenhotels.com";

  const cleanSiteUrl =
    siteUrl.replace(
      /\/+$/,
      ""
    );

  const canonicalUrl =
    `${cleanSiteUrl}/blog/${post.slug}`;

  const titleVi =
    cleanText(
      post.title_vi
    );

  const titleEn =
    cleanText(
      post.title_en
    );

  const copy = BLOG_SEO[post.slug];
  const shortBlogTitles: Record<string, string> = {
    "anh-kim-hotel-co-bac-chon-phong-cap-doi-gia-dinh":
      "Anh Kim Hotel: Chọn phòng đôi hay phòng gia đình",
    "huyen-homestay-sinh-vien-quoc-te-su-kien-chay-bo":
      "Huyen Homestay: Chỗ ở đi học và dự giải chạy",
    "huyen-house-nguyen-thi-minh-khai-phong-mot-hai-nguoi":
      "Huyen House: Phòng cho 1–2 người",
    "khach-san-cong-tac-tap-huan-mb-di-hoc-kham-rang-anh-kim":
      "Khách sạn công tác, học tại Sài Gòn",
  };
  const metaTitle = `${shortBlogTitles[post.slug] || copy?.title || titleVi || titleEn} | Huyen's`;
  const description = seoDescription(copy?.description || `${titleVi || titleEn}. ${cleanText(post.excerpt_vi || post.excerpt_en || post.content_vi || post.content_en)}`);

  const imageUrl =
    getImageUrl(
      post.image,
      cleanSiteUrl
    );

  const categoryVi =
    cleanText(
      post.category_vi
    );

  const categoryEn =
    cleanText(
      post.category_en
    );

  /*
   * SEO keywords lấy từ dữ liệu thật
   * của bài viết, không hard-code địa danh
   * không liên quan.
   */
  const keywords = [
    titleVi,
    titleEn,
    categoryVi,
    categoryEn,
    "du lịch TP.HCM",
    "kinh nghiệm du lịch TP.HCM",
    "Ho Chi Minh City travel",
    "Huyen's Hotels & Stays",
  ].filter(Boolean);

  return {
    title:
      metaTitle,

    description,

    keywords,

    alternates: post.title_en?.trim() && post.content_en?.trim() ? languageAlternates(new URL(canonicalUrl).pathname, siteUrl) : { canonical: canonicalUrl },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview":
          "large",
        "max-snippet": -1,
        "max-video-preview":
          -1,
      },
    },

    openGraph: {
      type: "article",

      url:
        canonicalUrl,

      title: metaTitle,

      description,

      siteName:
        "Huyen's Hotels & Stays",

      locale:
        "vi_VN",

      publishedTime:
        post.date,

      modifiedTime:
        post.updated_at,

      section:
        categoryVi ||
        "Du lịch",

      ...(imageUrl
        ? {
            images: [
              {
                url:
                  imageUrl,
                alt:
                  titleVi,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card:
        imageUrl
          ? "summary_large_image"
          : "summary",

      title: metaTitle,

      description,

      ...(imageUrl
        ? {
            images: [
              imageUrl,
            ],
          }
        : {}),
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function BlogDetailPage(props: Props) {
  return <BlogArticle {...props} language="vi" />;
}

export async function BlogArticle({
  params,
  language,
}: Props & { language: "vi" | "en" }) {
  const { slug } =
    await params;

  const post =
    await getPost(slug);

  const english = language === "en";
  if (!post || (english && (!post.title_en?.trim() || !post.content_en?.trim()))) {
    notFound();
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://huyenhotels.com";

  const cleanSiteUrl =
    siteUrl.replace(
      /\/+$/,
      ""
    );

  const homeUrl = cleanSiteUrl + (english ? "/en" : "");
  const blogUrl = homeUrl + "/blog";
  const canonicalUrl = blogUrl + "/" + encodeURIComponent(post.slug);
  const category = english ? post.category_en : post.category_vi;
  const translatedPaths = english
    ? englishPaths(await englishInventory()).map(parts => canonicalSeoPath("/" + parts.map(encodeURIComponent).join("/")))
    : [];

  const imageUrl =
    getImageUrl(
      post.image,
      cleanSiteUrl
    );

  const title =
    cleanText(
      english ? post.title_en : post.title_vi
    );

  const description = english
    ? seoDescription(post.excerpt_en?.trim() || cleanText(post.content_en ?? ""))
    :
    truncateDescription(
      cleanText(
        post.excerpt_vi ||
          post.excerpt_en ||
          "Khám phá những câu chuyện, kinh nghiệm du lịch và trải nghiệm tại TP.HCM."
      )
    );

  const articleStructuredData =
    {
      "@context":
        "https://schema.org",

      "@type":
        "Article",

      "@id":
        `${canonicalUrl}#article`,

      headline:
        title,

      description,

      url:
        canonicalUrl,

      datePublished:
        post.date,

      dateModified:
        post.updated_at,

      inLanguage:
        english ? "en" : "vi-VN",

      isPartOf: {
        "@type":
          "Blog",

        "@id":
          blogUrl + "#blog",

        name:
          "Huyen's Hotels & Stays",

        url:
          blogUrl,
      },

      author: {
        "@type":
          "Organization",

        name:
          "Huyen's Hotels & Stays",

        url:
          cleanSiteUrl,
      },

      publisher: {
        "@type":
          "Organization",

        name:
          "Huyen's Hotels & Stays",

        url:
          cleanSiteUrl,

        logo: {
          "@type":
            "ImageObject",

          url:
            `${cleanSiteUrl}/images/huyens-hotels-stays-logo.webp`,
        },
      },

      ...(imageUrl
        ? {
            image: [
              imageUrl,
            ],
          }
        : {}),

      ...(category
        ? {
            articleSection:
              category,
          }
        : {}),

      ...(post.read_time > 0
        ? {
            timeRequired:
              `PT${post.read_time}M`,
          }
        : {}),

      mainEntityOfPage: {
        "@type":
          "WebPage",

        "@id":
          canonicalUrl,
      },
    };

  const breadcrumbStructuredData =
    createBreadcrumbStructuredData(
      title, homeUrl, blogUrl, canonicalUrl, english
    );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              articleStructuredData
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              breadcrumbStructuredData
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      <BlogDetailClient
        post={post}
        translatedPaths={translatedPaths}
        siteUrl={cleanSiteUrl}
      />
    </>
  );
}
