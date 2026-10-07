import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
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
    console.error(
      "Sitemap: Supabase environment variables are missing; returning static URLs only."
    );

    return staticUrls;
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
        .select("id, slug, updated_at")
        .eq("status", "active"),

      supabase
        .from("rooms")
        .select("hotel_id, slug, updated_at")
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
      console.error(
        "Sitemap: failed to load hotels:",
        hotelsResult.error
      );
    } else {
      activeHotels = (hotelsResult.data ?? []) as HotelRow[];
    }

    if (roomsResult.error) {
      console.error(
        "Sitemap: failed to load rooms:",
        roomsResult.error
      );
    } else {
      activeRooms = (roomsResult.data ?? []) as RoomRow[];
    }

    if (blogPostsResult.error) {
      console.error(
        "Sitemap: failed to load blog posts:",
        blogPostsResult.error
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

    return staticUrls;
  }

  const hotelUrls: MetadataRoute.Sitemap =
    activeHotels
      .filter(
        (hotel) =>
          typeof hotel.slug === "string" &&
          hotel.slug.trim().length > 0
      )
      .map((hotel) => ({
        url: `${siteUrl}/khach-san/${hotel.slug}`,
        lastModified: hotel.updated_at
          ? new Date(hotel.updated_at)
          : undefined,
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
          url: `${siteUrl}/khach-san/${hotelSlug}/phong/${room.slug}`,
          lastModified: room.updated_at
            ? new Date(room.updated_at)
            : undefined,
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
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: post.updated_at
          ? new Date(post.updated_at)
          : post.date
            ? new Date(post.date)
            : undefined,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

  return [
    ...staticUrls,
    ...hotelUrls,
    ...roomUrls,
    ...blogUrls,
  ];
}