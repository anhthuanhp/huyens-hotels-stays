import { BLOG_CATEGORIES, getBlogCopy } from "./blog-i18n";
import type { Language } from "./types";

type CategoryFilterProps = {
  activeCategory: string;
  onChange: (categoryId: string) => void;
  language: Language;
};

export default function CategoryFilter({ activeCategory, onChange, language }: CategoryFilterProps) {
  const t = getBlogCopy(language);
  const options = [
    { id: "all", label: t.allArticles },
    ...BLOG_CATEGORIES.map((category) => ({
      id: category.id,
      label: language === "en" ? category.en : category.vi,
    })),
  ];

  return (
    <div role="group" aria-label={t.categoriesLabel} className="-mx-6 overflow-x-auto px-6 pb-2 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2 md:w-auto md:flex-wrap md:justify-center">
        {options.map((option) => {
          const isActive = option.id === activeCategory;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.id)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-pine text-cream shadow-sm"
                  : "bg-white text-ink ring-1 ring-inset ring-pine/15 hover:bg-sage hover:ring-pine/30"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
