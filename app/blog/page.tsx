import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import BlogPageClient from "./BlogPageClient";

export const revalidate = 60;

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenhotels.com"
).replace(/\/+$/, "");

const siteName =
  "Huyen's Hotels & Stays";

const blogUrl =
  `${siteUrl}/blog`;

const blogTitle =
  "Blog du lịch TP.HCM | Huyen's Hotels & Stays";

const blogDescription =
  "Khám phá kinh nghiệm du lịch TP.HCM, ẩm thực, cuộc sống địa phương và những kinh nghiệm lưu trú hữu ích từ Huyen's Hotels & Stays.";

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

function getSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

async function getPosts(): Promise<
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
      .order("date", {
        ascending: false,
      });

  if (error) {
    console.error(
      "Lỗi tải danh sách Blog:",
      error
    );

    return [];
  }

  return (
    (data as BlogPost[]) ||
    []
  );
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

  alternates: {
    canonical:
      blogUrl,
  },

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
          `${siteUrl}/images/huyen-hotel-logo-v1.png`,
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
      `${siteUrl}/images/huyen-hotel-logo-v1.png`,
    ],
  },
};

/* =========================================================
   PAGE
========================================================= */

export default async function BlogPage() {
  const posts =
    await getPosts();

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
            `${siteUrl}/blog/${post.slug}`,

          name:
            post.title_vi,
        })
      );

  const blogPosts =
    posts
      .slice(0, 20)
      .map(
        (post) => {
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
              `${siteUrl}/blog/${post.slug}#article`,

            headline:
              post.title_vi,

            url:
              `${siteUrl}/blog/${post.slug}`,

            datePublished:
              post.date,

            ...(imageUrl
              ? {
                  image:
                    imageUrl,
                }
              : {}),

            ...(post.excerpt_vi
              ? {
                  description:
                    post.excerpt_vi,
                }
              : {}),

            ...(post.category_vi
              ? {
                  articleSection:
                    post.category_vi,
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
                  `${siteUrl}/images/huyen-hotel-logo-v1.png`,
              },
            },

            mainEntityOfPage: {
              "@type":
                "WebPage",

              "@id":
                `${siteUrl}/blog/${post.slug}`,
            },

            inLanguage:
              "vi-VN",
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
            "vi-VN",

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
                `${siteUrl}/images/huyen-hotel-logo-v1.png`,
            },
          },
        },

        {
          "@type":
            "ItemList",

          "@id":
            `${blogUrl}#itemlist`,

          name:
            "Các bài viết du lịch TP.HCM",

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
            "Trang chủ",

          item:
            siteUrl,
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