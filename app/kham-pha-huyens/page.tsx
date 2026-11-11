import { createClient } from "@supabase/supabase-js";
import ExploreClient from "./ExploreClient";
import type { Hotel, HeroSlide } from "./bolt/types/explore";

export const revalidate = 60;

async function getExploreData() {
  const empty = {
    hotels: [] as Hotel[],
    heroSlides: [] as HeroSlide[],
    hotelCovers: {} as Record<number,string>
  };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return empty;

  try {
    const supabase = createClient(url,key,{
      auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
    });
    const [hr,hot] = await Promise.all([
      supabase.from("hero_slides")
        .select("id,image_url,title_vi,title_en")
        .eq("status","active")
        .order("position",{ascending:true}),
      supabase.from("hotels")
        .select("id,slug,name_vi,name_en,address_vi,address_en")
        .eq("status","active")
        .order("created_at",{ascending:true})
    ]);
    if(hr.error) console.error(hr.error);
    if(hot.error) console.error(hot.error);

    const hotels = (hot.data || []) as Hotel[];
    const covers:Record<number,string> = {};
    if(hotels.length) {
      const {data,error} = await supabase.from("media")
        .select("entity_id,public_url")
        .eq("entity_type","hotel")
        .eq("is_cover",true)
        .eq("status","active")
        .in("entity_id",hotels.map(h=>h.id));
      if(error) console.error(error);
      for(const m of data || []) {
        const id=Number(m.entity_id);
        if(Number.isFinite(id) && typeof m.public_url==="string" &&
           m.public_url.trim()) covers[id]=m.public_url;
      }
    }
    return {
      hotels,
      heroSlides:(hr.data || []) as HeroSlide[],
      hotelCovers:covers
    };
  } catch(e) {
    console.error("Explore page:",e);
    return empty;
  }
}
export default async function KhamPhaHuyensPage() {
  const data=await getExploreData();
  return <ExploreClient {...data}/>;
}
