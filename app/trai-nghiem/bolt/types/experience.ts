export type Activity = {
  id: number;
  title_vi: string;
  title_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  activity_date: string | null;
  hotel_id: number | null;
  status: 'active' | 'inactive';
};

export type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string | null;
  address_en: string | null;
};

export type Media = {
  id: number;
  public_url: string;
  entity_id: number | null;
  alt_vi: string | null;
  alt_en: string | null;
  is_cover: boolean;
  sort_order: number;
};

export type ExperienceClientProps = {
  activities: Activity[];
  hotels: Hotel[];
  media: Media[];
  hasError: boolean;
};
