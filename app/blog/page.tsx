import { DEFAULT_SHARE_IMAGE, staticMetadata } from "../lib/seo";
import { headers } from "next/headers";
import { localizedHref } from "../lib/localized-path";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import BlogPageClient from "./BlogPageClient";
import type { BlogPost } from "./bolt/types";

export const revalidate = 60;

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenhotels.com"
).replace(/\/+$/, "");

const siteName =
  "Huyen's Hotels & Stays";

const blogUrl =
  `${siteUrl}/blog`;

const blogMetadata = staticMetadata("/blog");
const blogTitle = (blogMetadata.title as { absolute: string }).absolute;
const blogDescription = blogMetadata.description!;

function getSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

async function getPosts(english: boolean): Promise<
  BlogPost[]
> {
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
        content_en,
        excerpt_vi,
        excerpt_en,
        category_vi,
        category_en,
        image,
        date,
        read_time,
        featured,
        status
      `)
      .eq("status", "active")
      .order("date", { ascending: false })
      .order("id", { ascending: false });

  if (error) {
    console.error(
      "Lỗi tải danh sách Blog:",
      error
    );

    return [];
  }

  return (data ?? [])
    .map(({ content_en, ...post }) => ({
      ...post,
      hasEnglishContent: Boolean(post.title_en?.trim() && content_en?.trim()),
    }) as BlogPost)
    .filter(post => !english || post.hasEnglishContent);
}

/* =========================================================
   SEO METADATA
========================================================= */

export const metadata: Metadata = {
  title: blogTitle,

  description:
    blogDescription,

  keywords: [
    "blog du lịch TP.HCM",
    "du lịch TP.HCM",
    "kinh nghiệm du lịch TP.HCM",
    "ẩm thực TP.HCM",
    "địa điểm du lịch TP.HCM",
    "kinh nghiệm lưu trú TP.HCM",
    "Ho Chi Minh City travel",
    "Huyen's Hotels & Stays",
  ],

  alternates: blogMetadata.alternates,

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
    type: "website",

    url:
      blogUrl,

    title:
      blogTitle,

    description:
      blogDescription,

    siteName:
      siteName,

    locale:
      "vi_VN",

    images: [
      {
        url:
          `${siteUrl}${DEFAULT_SHARE_IMAGE}`,
        alt:
          siteName,
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      blogTitle,

    description:
      blogDescription,

    images: [
      `${siteUrl}${DEFAULT_SHARE_IMAGE}`,
    ],
  },
};

/* =========================================================
   PAGE
========================================================= */

export default async function BlogPage() {
  const english = (await headers()).get("x-huyen-route-language") === "en";
  const blogUrl = siteUrl + localizedHref("/blog", english ? "en" : "vi");
  const blogTitle = english ? "Ho Chi Minh City travel & accommodation guides" : (blogMetadata.title as { absolute: string }).absolute;
  const blogDescription = english ? "Plan your visit to Saigon with Huyen's guides to neighbourhoods, choosing rooms, city breaks and business trips." : blogMetadata.description;
  const posts = await getPosts(english);

  /*
   * Chỉ lấy các bài viết thực tế
   * từ Supabase để tạo ItemList.
   *
   * Không hard-code URL bài viết.
   */
  const itemList =
    posts
      .slice(0, 50)
      .map(
        (post, index) => ({
          "@type":
            "ListItem",

          position:
            index + 1,

          url:
            `${blogUrl}/${encodeURIComponent(post.slug)}`,

          name:
            english ? post.title_en : post.title_vi,
        })
      );

  const blogPosts =
    posts
      .slice(0, 20)
      .map(
        (post) => {
          const excerpt = english ? post.excerpt_en : post.excerpt_vi;
          const category = english ? post.category_en : post.category_vi;
          const imageUrl =
            post.image
              ? post.image.startsWith(
                  "http://"
                ) ||
                post.image.startsWith(
                  "https://"
                )
                ? post.image
                : `${siteUrl}${
                    post.image.startsWith(
                      "/"
                    )
                      ? post.image
                      : `/${post.image}`
                  }`
              : undefined;

          return {
            "@type":
              "BlogPosting",

            "@id":
              `${blogUrl}/${encodeURIComponent(post.slug)}#article`,

            headline:
              english ? post.title_en : post.title_vi,

            url:
              `${blogUrl}/${encodeURIComponent(post.slug)}`,

            datePublished:
              post.date,

            ...(imageUrl
              ? {
                  image:
                    imageUrl,
                }
              : {}),

            ...(excerpt
              ? {
                  description:
                    excerpt,
                }
              : {}),

            ...(category
              ? {
                  articleSection:
                    category,
                }
              : {}),

            author: {
              "@type":
                "Organization",

              name:
                siteName,

              url:
                siteUrl,
            },

            publisher: {
              "@type":
                "Organization",

              name:
                siteName,

              url:
                siteUrl,

              logo: {
                "@type":
                  "ImageObject",

                url:
                  `${siteUrl}/images/huyens-hotels-stays-logo.webp`,
              },
            },

            mainEntityOfPage: {
              "@type":
                "WebPage",

              "@id":
                `${blogUrl}/${encodeURIComponent(post.slug)}`,
            },

            inLanguage:
              english ? "en" : "vi-VN",
          };
        }
      );

  const blogStructuredData =
    {
      "@context":
        "https://schema.org",

      "@graph": [
        {
          "@type":
            "Blog",

          "@id":
            `${blogUrl}#blog`,

          url:
            blogUrl,

          name:
            blogTitle,

          description:
            blogDescription,

          inLanguage:
            english ? "en" : "vi-VN",

          publisher: {
            "@type":
              "Organization",

            name:
              siteName,

            url:
              siteUrl,

            logo: {
              "@type":
                "ImageObject",

              url:
                `${siteUrl}/images/huyens-hotels-stays-logo.webp`,
            },
          },
        },

        {
          "@type":
            "ItemList",

          "@id":
            `${blogUrl}#itemlist`,

          name:
            english ? "Ho Chi Minh City travel articles" : "Các bài viết du lịch TP.HCM",

          url:
            blogUrl,

          numberOfItems:
            itemList.length,

          itemList:
            itemList,
        },

        ...blogPosts,
      ],
    };

  const breadcrumbStructuredData =
    {
      "@context":
        "https://schema.org",

      "@type":
        "BreadcrumbList",

      "@id":
        `${blogUrl}#breadcrumb`,

      itemListElement: [
        {
          "@type":
            "ListItem",

          position: 1,

          name:
            english ? "Home" : "Trang chủ",

          item:
            english ? siteUrl + "/en" : siteUrl,
        },

        {
          "@type":
            "ListItem",

          position: 2,

          name:
            "Blog",

          item:
            blogUrl,
        },
      ],
    };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              blogStructuredData
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

      <BlogPageClient
        posts={posts}
      />
    </>
  );
}
