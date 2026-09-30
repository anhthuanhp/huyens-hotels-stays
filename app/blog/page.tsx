import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import BlogPageClient from "./BlogPageClient";

export const revalidate = 60;

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenhotels.com"
).replace(/\/+$/, "");

const siteName = "Huyen's Hotels & Stays";

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

async function getPosts(): Promise<BlogPost[]> {
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
    console.error("Lỗi tải danh sách Blog:", error);
    return [];
  }

  return (data as BlogPost[]) || [];
}

export const metadata: Metadata = {
  title: "Blog du lịch TP.HCM | Huyen's Hotels & Stays",
  description:
    "Khám phá kinh nghiệm du lịch TP.HCM, ẩm thực, cuộc sống địa phương và những kinh nghiệm lưu trú hữu ích từ Huyen's Hotels & Stays.",

  alternates: {
    canonical: `${siteUrl}/blog`,
  },

  openGraph: {
    type: "website",
    url: `${siteUrl}/blog`,
    title: "Blog du lịch TP.HCM | Huyen's Hotels & Stays",
    description:
      "Khám phá kinh nghiệm du lịch TP.HCM, ẩm thực, cuộc sống địa phương và những kinh nghiệm lưu trú hữu ích.",
    siteName,
    locale: "vi_VN",
  },

  twitter: {
    card: "summary",
    title: "Blog du lịch TP.HCM | Huyen's Hotels & Stays",
    description:
      "Khám phá kinh nghiệm du lịch TP.HCM, ẩm thực, cuộc sống địa phương và những kinh nghiệm lưu trú hữu ích.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function BlogPage() {
  const posts = await getPosts();

  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${siteUrl}/blog#blog`,
    url: `${siteUrl}/blog`,
    name: "Blog du lịch TP.HCM | Huyen's Hotels & Stays",
    description:
      "Khám phá kinh nghiệm du lịch TP.HCM, ẩm thực, cuộc sống địa phương và những kinh nghiệm lưu trú hữu ích.",

    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/hero/hero-1.webp`,
      },
    },

    blogPost: posts.slice(0, 20).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title_vi,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.date,

      ...(post.image
        ? {
            image: post.image.startsWith("http")
              ? post.image
              : `${siteUrl}${
                  post.image.startsWith("/")
                    ? post.image
                    : `/${post.image}`
                }`,
          }
        : {}),

      ...(post.excerpt_vi
        ? {
            description: post.excerpt_vi,
          }
        : {}),

      author: {
        "@type": "Organization",
        name: siteName,
        url: siteUrl,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogStructuredData).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      <BlogPageClient posts={posts} />
    </>
  );
}