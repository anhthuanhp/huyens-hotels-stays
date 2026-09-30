import { createClient } from "@supabase/supabase-js";
import ExploreClient from "./ExploreClient";

export const revalidate = 60;

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string | null;
  address_vi: string | null;
  address_en: string | null;
};

type HeroSlide = {
  id: number;
  image_url: string | null;
  title_vi: string | null;
  title_en: string | null;
};

async function getExploreData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error("Explore page: Supabase environment variables are missing.");
    return { hotels: [], heroSlides: [] };
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const [heroResult, hotelResult] = await Promise.all([
      supabase
        .from("hero_slides")
        .select("id, image_url, title_vi, title_en")
        .eq("status", "active")
        .order("position", { ascending: true }),
      supabase
        .from("hotels")
        .select("id, slug, name_vi, name_en, address_vi, address_en")
        .eq("status", "active")
        .order("created_at", { ascending: true }),
    ]);

    if (heroResult.error) console.error("Explore page: failed to load hero slides:", heroResult.error);
    if (hotelResult.error) console.error("Explore page: failed to load hotels:", hotelResult.error);

    return {
      hotels: (hotelResult.data ?? []) as Hotel[],
      heroSlides: (heroResult.data ?? []) as HeroSlide[],
    };
  } catch (error) {
    console.error("Explore page: data request failed:", error);
    return { hotels: [], heroSlides: [] };
  }
}

export default async function KhamPhaHuyensPage() {
  const data = await getExploreData();
  return <ExploreClient {...data} />;
}