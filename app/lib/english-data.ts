import { createClient } from "@supabase/supabase-js";
import type { Hotel, Room } from "../khach-san/[slug]/hotel-data";
import { cleanSeoText, seoDescription } from "./seo";
import { canonicalRoomSlug } from "./room-seo-slugs";

export type EnglishPost = { slug: string; title_en: string; excerpt_en: string | null; content_en: string | null; image: string | null; date: string; updated_at: string | null };
export type EnglishData = { kind: "home" | "rooms" | "blog" | "hotel" | "room" | "article"; path: string; title: string; description: string; hotels: Hotel[]; rooms: Room[]; posts: EnglishPost[]; hotel: Hotel | null; room: Room | null; post: EnglishPost | null };
const client = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });

export async function englishInventory() {
  const db = client();
  const [hotels, rooms, media, posts] = await Promise.all([
    db.from("hotels").select("id,slug,name_vi,name_en,address_vi,address_en,description_en,image,status,business_model").eq("status", "active"),
    db.from("rooms").select("id,hotel_id,slug,name_en,description_en,image,size,max_guests,beds_en,base_price_daily,base_price_monthly,quantity,status").eq("status", "active"),
    db.from("media").select("entity_id,public_url").eq("entity_type", "room").eq("is_cover", true).eq("status", "active").order("sort_order", { ascending: true }),
    db.from("blog_posts").select("slug,title_en,excerpt_en,content_en,image,date,updated_at").eq("status", "active").order("date", { ascending: false }),
  ]);
  for (const result of [hotels, rooms, media, posts]) if (result.error) throw new Error("Cannot load English content: " + result.error.message);
  const translatedHotels = (hotels.data ?? []).filter(h => h.name_en?.trim() && h.description_en?.trim()) as Hotel[];
  const hotelIds = new Set(translatedHotels.map(h => h.id));
  return {
    hotels: translatedHotels,
    rooms: (rooms.data ?? []).filter(r => hotelIds.has(r.hotel_id) && r.name_en?.trim() && r.description_en?.trim()).map(room => ({ ...room, image: (media.data ?? []).find(m => m.entity_id === room.id)?.public_url || room.image })) as Room[],
    posts: (posts.data ?? []).filter(p => p.title_en?.trim() && p.content_en?.trim()) as EnglishPost[],
  };
}

export function englishPaths(data: Awaited<ReturnType<typeof englishInventory>>) {
  return [[], ["phong"], ["blog"], ...data.hotels.map(h => ["khach-san", h.slug]), ...data.rooms.map(r => ["khach-san", data.hotels.find(h => h.id === r.hotel_id)!.slug, "phong", r.slug]), ...data.posts.map(p => ["blog", p.slug])];
}

const hotelDescriptions: Record<string, string> = {
  "anh-kim-hotel": "Stay at Anh Kim Hotel on Co Bac Street near Bui Vien and Ben Thanh Market. Compare double and family rooms, check nightly rates and book directly.",
  "ae-guesthouse": "A&E Guesthouse on Do Quang Dau Street is near Bui Vien and Pham Ngu Lao. Explore room types, check nightly rates and plan your Saigon visit.",
  "huyen-house": "Stay at Huyen House on Nguyen Thi Minh Khai Street near the US Consulate. Explore rooms and nightly rates for a short city visit or business trip.",
  huyenhomestay: "Huyen Homestay on Nguyen Thi Minh Khai Street offers rooms for nightly stays in central Ho Chi Minh City. Compare room types and plan your visit.",
};

const hotelFocus: Record<string, string> = {
  "anh-kim-hotel": "Co Bac hotel near Bui Vien",
  "ae-guesthouse": "Guesthouse near Bui Vien and Pham Ngu Lao",
  "huyen-house": "Quiet stay near the US Consulate",
  huyenhomestay: "Rooms for nightly stays on Nguyen Thi Minh Khai",
};

export async function englishPage(segments: string[]): Promise<EnglishData | null> {
  const inventory = await englishInventory();
  const path = segments.length ? "/" + segments.map(encodeURIComponent).join("/") : "/";
  const result: EnglishData = { ...inventory, kind: "home", path, title: "Hotels & homestays in central Ho Chi Minh City", description: "Compare Huyen's hotels, guesthouses and homestays in central Ho Chi Minh City. Explore rooms, check nightly rates and book directly.", hotel: null, room: null, post: null };
  if (!segments.length) return result;
  if (segments.length === 1 && segments[0] === "phong") return { ...result, kind: "rooms", title: "Rooms & rates in Ho Chi Minh City", description: "Compare room sizes, beds, guest capacity and nightly rates at Huyen's Hotels & Stays in Ho Chi Minh City." };
  if (segments.length === 1 && segments[0] === "blog") return { ...result, kind: "blog", title: "Ho Chi Minh City travel & accommodation guides", description: "Plan your visit to Saigon with Huyen's guides to neighbourhoods, choosing rooms, city breaks and business trips." };
  if (segments[0] === "blog" && segments.length === 2) {
    const post = inventory.posts.find(p => p.slug === segments[1]);
    return post ? { ...result, kind: "article", post, title: post.title_en, description: seoDescription(post.excerpt_en || cleanSeoText(post.content_en)) } : null;
  }
  if (segments[0] !== "khach-san") return null;
  const hotel = inventory.hotels.find(h => h.slug === segments[1]);
  if (!hotel) return null;
  const rooms = inventory.rooms.filter(r => r.hotel_id === hotel.id);
  if (segments.length === 2) return { ...result, kind: "hotel", hotel, rooms, title: hotel.name_en + " – " + (hotelFocus[hotel.slug] || "Ho Chi Minh City"), description: seoDescription(hotelDescriptions[hotel.slug] || hotel.description_en || "Compare rooms and rates for your stay in Ho Chi Minh City.") };
  if (segments.length !== 4 || segments[2] !== "phong") return null;
  const room = rooms.find(r => r.slug === segments[3])
    ?? rooms.find(r => canonicalRoomSlug(hotel.slug, r.slug) === segments[3]);
  return room ? { ...result, kind: "room", hotel, room, rooms, title: cleanSeoText(room.name_en) + " – " + hotel.name_en, description: seoDescription(room.description_en || "View room details and check availability for your dates.") } : null;
}
