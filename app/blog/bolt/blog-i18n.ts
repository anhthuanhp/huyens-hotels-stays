import type { BlogPost, Language } from "./types";

export type BlogCategory = {
  id: string;
  vi: string;
  en: string;
};

export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: "food", vi: "Ẩm thực", en: "Food & Dining" },
  { id: "local-life", vi: "Cuộc sống địa phương", en: "Local Life" },
  { id: "stay-tips", vi: "Kinh nghiệm lưu trú", en: "Stay Tips" },
  { id: "stories", vi: "Huyen's Stories", en: "Huyen's Stories" },
];

const copy = {
  vi: {
    heroTitle: "Những câu chuyện trên hành trình.",
    heroDescription:
      "Khám phá ẩm thực, nhịp sống địa phương và những kinh nghiệm lưu trú qua góc nhìn của Huyen's Hotels & Stays.",
    featuredLabel: "Bài nổi bật",
    readStory: "Đọc câu chuyện",
    readArticle: "Đọc bài viết",
    categoriesLabel: "Chuyên mục",
    allArticles: "Tất cả bài viết",
    gridTitle: "Khám phá các bài viết",
    minutesRead: (minutes: number) => `${minutes} phút đọc`,
    emptyTitle:
      "Những câu chuyện mới đang được chuẩn bị. Hãy quay lại để khám phá cùng Huyen's.",
    emptyCategory: "Chưa có bài viết trong chuyên mục này.",
    ctaTitle: "Câu chuyện tiếp theo bắt đầu từ nơi bạn ở.",
    ctaDescription:
      "Khám phá những không gian lưu trú tại Huyen's Hotels & Stays và tìm nơi phù hợp với hành trình của bạn.",
    ctaButton: "Khám phá các loại phòng",
    dateLocale: "vi-VN",
  },
  en: {
    heroTitle: "Stories Along the Journey.",
    heroDescription:
      "Explore local flavors, everyday city life and thoughtful travel tips through the eyes of Huyen's Hotels & Stays.",
    featuredLabel: "Featured story",
    readStory: "Read the story",
    categoriesLabel: "Categories",
    allArticles: "All articles",
    readArticle: "Read article",
    gridTitle: "Explore the articles",
    minutesRead: (minutes: number) => `${minutes} min read`,
    emptyTitle:
      "New stories are on their way. Come back soon to explore with Huyen's.",
    emptyCategory: "No stories in this category yet.",
    ctaTitle: "The next story begins where you stay.",
    ctaDescription:
      "Discover the stays at Huyen's Hotels & Stays and find the place that fits your journey.",
    ctaButton: "Explore our rooms",
    dateLocale: "en-US",
  },
} as const;

export function getBlogCopy(language: Language) {
  return copy[language];
}

export function getPostTitle(post: BlogPost, language: Language) {
  return (language === "en" ? post.title_en || post.title_vi : post.title_vi) || post.title_en;
}

export function getPostExcerpt(post: BlogPost, language: Language) {
  const value = language === "en" ? post.excerpt_en || post.excerpt_vi : post.excerpt_vi;
  return value?.trim() ? value : null;
}

export function getPostCategory(post: BlogPost, language: Language) {
  const value = language === "en" ? post.category_en || post.category_vi : post.category_vi;
  return value?.trim() ? value : null;
}

export function formatPostDate(date: string, language: Language) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(copy[language].dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function postMatchesCategory(post: BlogPost, category: BlogCategory) {
  return post.category_vi === category.vi || post.category_en === category.en;
}

export function getPostHref(slug: string) {
  return `/blog/${encodeURIComponent(slug)}`;
}
