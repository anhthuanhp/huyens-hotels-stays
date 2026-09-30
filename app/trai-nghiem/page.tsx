import { createClient } from "@supabase/supabase-js";
import ExperienceClient from "./ExperienceClient";

export const revalidate = 60;

const MEDIA_ENTITY_TYPE = "experience";

type Activity = {
  id: number;
  title_vi: string;
  title_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  activity_date: string | null;
  hotel_id: number | null;
  status: "active" | "inactive";
};

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string | null;
  address_en: string | null;
};

type Media = {
  id: number;
  public_url: string;
  entity_id: number | null;
  alt_vi: string | null;
  alt_en: string | null;
  is_cover: boolean;
  sort_order: number;
};

async function getExperienceData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error("Experiences page: Supabase environment variables are missing.");
    return { activities: [], hotels: [], media: [], hasError: true };
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const [activityResult, hotelResult, mediaResult] = await Promise.all([
      supabase
        .from("activities")
        .select("id, title_vi, title_en, description_vi, description_en, activity_date, hotel_id, status")
        .eq("status", "active")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
      supabase
        .from("hotels")
        .select("id, slug, name_vi, name_en, address_vi, address_en")
        .eq("status", "active")
        .order("id", { ascending: true }),
      supabase
        .from("media")
        .select("id, public_url, entity_id, alt_vi, alt_en, is_cover, sort_order")
        .eq("entity_type", MEDIA_ENTITY_TYPE)
        .eq("status", "active")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    if (activityResult.error) {
      console.error("Experiences page: failed to load activities:", activityResult.error);
      return { activities: [], hotels: hotelResult.data ?? [], media: mediaResult.data ?? [], hasError: true };
    }
    if (hotelResult.error) console.error("Experiences page: failed to load hotels:", hotelResult.error);
    if (mediaResult.error) console.error("Experiences page: failed to load media:", mediaResult.error);

    return {
      activities: (activityResult.data ?? []) as Activity[],
      hotels: (hotelResult.data ?? []) as Hotel[],
      media: (mediaResult.data ?? []) as Media[],
      hasError: false,
    };
  } catch (error) {
    console.error("Experiences page: data request failed:", error);
    return { activities: [], hotels: [], media: [], hasError: true };
  }
}

export default async function TraiNghiemPage() {
  const data = await getExperienceData();
  return <ExperienceClient {...data} />;
}
