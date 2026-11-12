import { englishInventory, englishPaths } from "./lib/english-data";
import { canonicalRoomSlug, canonicalSeoPath } from "./lib/room-seo-slugs";
import { languageAlternates, localizedHref } from "./lib/localized-path";
import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

// Refresh database-backed URLs hourly instead of keeping the build snapshot.
export const revalidate = 3600;

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenhotels.com";

const siteUrl = baseUrl.replace(/\/+$/, "");

type HotelRow = {
  id: number;
  slug: string;
  updated_at: string | null;
};

type RoomRow = {
  hotel_id: number;
  slug: string;
  updated_at: string | null;
};

type BlogPostRow = {
  slug: string;
  date: string | null;
  updated_at: string | null;
};


function validLastModified(
  ...values: (string | null | undefined)[]
): Date | undefined {
  for (const value of values) {
    if (!value) continue;

    const time = Date.parse(value);

    if (
      Number.isFinite(time) &&
      time <= Date.now() + 86400000
    ) {
      return new Date(time);
    }
  }

  return undefined;
}

function uniqueSitemap(
  entries: MetadataRoute.Sitemap
): MetadataRoute.Sitemap {
  const seen = new Set<string>();

  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/khach-san-quan-1-cu`, changeFrequency: "monthly", priority: 0.8 },
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/phong`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/kham-pha-huyens`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/trai-nghiem`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/lien-he`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/chinh-sach-dat-phong`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/chinh-sach-huy-phong`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/chinh-sach-khac`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/chinh-sach-bao-mat`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let activeHotels: HotelRow[] = [];
  let activeRooms: RoomRow[] = [];
  let activeBlogPosts: BlogPostRow[] = [];

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Sitemap: missing Supabase environment variables"
    );
  }

  try {
    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    );

    const [
      hotelsResult,
      roomsResult,
      blogPostsResult,
    ] = await Promise.all([
      supabase
        .from("hotels")
        .select("id, slug")
        .eq("status", "active"),

      supabase
        .from("rooms")
        .select("hotel_id, slug")
        .eq("status", "active"),

      supabase
        .from("blog_posts")
        .select("slug, date, updated_at")
        .eq("status", "active")
        .order("date", {
          ascending: false,
        }),
    ]);

    if (hotelsResult.error) {
      throw new Error(
        "Sitemap: cannot load hotels: " +
        hotelsResult.error.message
      );
    } else {
      activeHotels = (hotelsResult.data ?? []) as HotelRow[];
    }

    if (roomsResult.error) {
      throw new Error(
        "Sitemap: cannot load rooms: " +
        roomsResult.error.message
      );
    } else {
      activeRooms = (roomsResult.data ?? []) as RoomRow[];
    }

    if (blogPostsResult.error) {
      throw new Error(
        "Sitemap: cannot load blog_posts: " +
        blogPostsResult.error.message
      );
    } else {
      activeBlogPosts =
        (blogPostsResult.data ?? []) as BlogPostRow[];
    }
  } catch (error) {
    console.error(
      "Sitemap: Supabase request failed:",
      error
    );
    throw error;
  }

  const hotelUrls: MetadataRoute.Sitemap =
    activeHotels
      .filter(
        (hotel) =>
          typeof hotel.slug === "string" &&
          hotel.slug.trim().length > 0
      )
      .map((hotel) => ({
        url: `${siteUrl}/khach-san/${encodeURIComponent(hotel.slug)}`,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }));

  const activeHotelIds = new Set(
    activeHotels.map((hotel) => hotel.id)
  );

  const hotelSlugById = new Map(
    activeHotels.map((hotel) => [
      hotel.id,
      hotel.slug,
    ])
  );

  const roomUrls: MetadataRoute.Sitemap =
    activeRooms
      .filter(
        (room) =>
          activeHotelIds.has(room.hotel_id) &&
          typeof room.slug === "string" &&
          room.slug.trim().length > 0 &&
          hotelSlugById.has(room.hotel_id)
      )
      .map((room) => {
        const hotelSlug = hotelSlugById.get(
          room.hotel_id
        );

        return {
          url: `${siteUrl}/khach-san/${encodeURIComponent(hotelSlug!)}/phong/${encodeURIComponent(canonicalRoomSlug(hotelSlug!, room.slug))}`,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        };
      });

  const blogUrls: MetadataRoute.Sitemap =
    activeBlogPosts
      .filter(
        (post) =>
          typeof post.slug === "string" &&
          post.slug.trim().length > 0
      )
      .map((post) => ({
        url: `${siteUrl}/blog/${encodeURIComponent(post.slug)}`,
        lastModified: validLastModified(post.updated_at, post.date),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

  const english = englishPaths(await englishInventory())
    .map(parts => parts.length ? "/" + parts.map(encodeURIComponent).join("/") : "/")
    .map(canonicalSeoPath)
    .filter((url, index, urls) => urls.indexOf(url) === index);
  const paired = new Set(english);
  const vietnamese = [...staticUrls, ...hotelUrls, ...roomUrls, ...blogUrls].map(entry => {
    const path = new URL(entry.url).pathname;
    return paired.has(path) ? { ...entry, alternates: { languages: languageAlternates(path, siteUrl).languages } } : entry;
  });
  return uniqueSitemap([
    ...vietnamese,
    ...english.map(path => ({
      url: siteUrl + localizedHref(path, "en"),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: languageAlternates(path, siteUrl).languages
      }
    }))
  ]);
}