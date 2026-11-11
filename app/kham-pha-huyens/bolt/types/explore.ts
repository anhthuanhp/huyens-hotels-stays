export type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string | null;
  address_vi: string | null;
  address_en: string | null;
};

export type HeroSlide = {
  id: number;
  image_url: string | null;
  title_vi: string | null;
  title_en: string | null;
};
