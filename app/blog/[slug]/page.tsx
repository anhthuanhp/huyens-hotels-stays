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
  const supabase = getSupabaseServerClient();

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
      `
    )
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

  const cleanSiteUrl = siteUrl.replace(/\/$/, "");

  const titleVi = post.title_vi;
  const titleEn = post.title_en;

  const descriptionVi =
    post.excerpt_vi ||
    "Khám phá những câu chuyện, kinh nghiệm du lịch và trải nghiệm tại TP. Hồ Chí Minh.";

  const imageUrl = post.image
    ? post.image.startsWith("http")
      ? post.image
      : `${cleanSiteUrl}${
          post.image.startsWith("/")
            ? post.image
            : `/${post.image}`
        }`
    : undefined;

  return {
    title: `${titleVi} | Huyen's Hotels & Stays`,

    description: descriptionVi,

    alternates: {
      canonical: `${cleanSiteUrl}/blog/${post.slug}`,
    },

    openGraph: {
      type: "article",
      url: `${cleanSiteUrl}/blog/${post.slug}`,
      title: titleVi,
      description: descriptionVi,
      siteName: "Huyen's Hotels & Stays",
      locale: "vi_VN",
      publishedTime: post.date,
      modifiedTime: post.updated_at,
      section: post.category_vi || "Du lịch",

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

      description: descriptionVi,

      ...(imageUrl
        ? {
            images: [imageUrl],
          }
        : {}),
    },

    keywords: [
      titleVi,
      titleEn,
      "du lịch TP.HCM",
      "Ho Chi Minh City travel",
      "Huyen's Hotels & Stays",
    ],

    robots: {
      index: true,
      follow: true,
    },

    other: {
      "article:published_time": post.date,
      "article:modified_time": post.updated_at,
      "article:section":
        post.category_vi || "Du lịch",
    },
  };
}

export default async function BlogDetailPage({
  params,
}: Props) {
  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return <BlogDetailClient post={post} />;
}