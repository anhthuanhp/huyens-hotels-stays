"use client";
// BLOG_BOLT_JOURNAL_V1: common VI/EN state, actual Supabase props from page.tsx.
import { useLanguage } from "../lib/use-language";
import BoltBlogPageClient from "./bolt/BlogPageClient";
import type { BlogPageClientProps } from "./bolt/types";
export default function BlogPageClient({ posts }: BlogPageClientProps) {
  const language = useLanguage();
  return <BoltBlogPageClient posts={posts} language={language} />;
}
