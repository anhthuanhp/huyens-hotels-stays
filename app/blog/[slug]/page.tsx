
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import BlogDetailClient from "./BlogDetailClient";

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

async function getPost(
  slug: string
): Promise<BlogPost | null> {
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

    return null;
  }

  return data as BlogPost | null;
}

function getImageUrl(
  image: string | null,
  siteUrl: string
) {
  if (!image) {
    return undefined;
  }

  if (image.startsWith("http")) {
    return image;
  }

  return `${siteUrl}${
    image.startsWith("/")
      ? image
      : `/${image}`
  }`;
}

function createBreadcrumbStructuredData(
  post: BlogPost,
  siteUrl: string
) {
  const canonicalUrl =
    `${siteUrl}/blog/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title_vi,
        item: canonicalUrl,
      },
    ],
  };
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) {
    return {
      title:
        "Article not found | Huyen's Hotels & Stays",

      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://huyenstays.vercel.app";

  const cleanSiteUrl =
    siteUrl.replace(/\/+$/, "");

  const canonicalUrl =
    `${cleanSiteUrl}/blog/${post.slug}`;

  const titleVi =
    post.title_vi;

  const titleEn =
    post.title_en;

  const descriptionVi =
    post.excerpt_vi ||
    "Khám phá những câu chuyện, kinh nghiệm du lịch và trải nghiệm tại TP. Hồ Chí Minh.";

  const imageUrl =
    getImageUrl(
      post.image,
      cleanSiteUrl
    );

  return {
    title:
      `${titleVi} | Huyen's Hotels & Stays`,

    description:
      descriptionVi,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: titleVi,
      description: descriptionVi,
      siteName:
        "Huyen's Hotels & Stays",
      locale: "vi_VN",
      publishedTime: post.date,
      modifiedTime: post.updated_at,
      section:
        post.category_vi ||
        "Du lịch",

      ...(imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                alt: titleVi,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: imageUrl
        ? "summary_large_image"
        : "summary",

      title: titleVi,
      description:
        descriptionVi,

      ...(imageUrl
        ? {
            images: [imageUrl],
          }
        : {}),
    },

    keywords: [
      titleVi,
      titleEn,
      post.category_vi || "",
      post.category_en || "",
      "du lịch TP.HCM",
      "Ho Chi Minh City travel",
      "Huyen's Hotels & Stays",
    ].filter(Boolean),

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
  };
}

export default async function BlogDetailPage({
  params,
}: Props) {
  const { slug } = await params;

  const post =
    await getPost(slug);

  if (!post) {
    notFound();
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://huyenstays.vercel.app";

  const cleanSiteUrl =
    siteUrl.replace(/\/+$/, "");

  const canonicalUrl =
    `${cleanSiteUrl}/blog/${post.slug}`;

  const imageUrl =
    getImageUrl(
      post.image,
      cleanSiteUrl
    );

  const articleStructuredData = {
    "@context":
      "https://schema.org",

    "@type": "Article",

    "@id":
      `${canonicalUrl}#article`,

    headline:
      post.title_vi,

    description:
      post.excerpt_vi ||
      "Khám phá những câu chuyện, kinh nghiệm du lịch và trải nghiệm tại TP. Hồ Chí Minh.",

    url:
      canonicalUrl,

    datePublished:
      post.date,

    dateModified:
      post.updated_at,

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
          `${cleanSiteUrl}/hero/hero-1.webp`,
      },
    },

    ...(imageUrl
      ? {
          image: [imageUrl],
        }
      : {}),

    ...(post.category_vi
      ? {
          articleSection:
            post.category_vi,
        }
      : {}),

    inLanguage:
      "vi-VN",

    mainEntityOfPage: {
      "@type":
        "WebPage",

      "@id":
        canonicalUrl,
    },
  };

  const breadcrumbStructuredData =
    createBreadcrumbStructuredData(
      post,
      cleanSiteUrl
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
      />
    </>
  );
}
