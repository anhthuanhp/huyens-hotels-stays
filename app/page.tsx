
import type { Metadata } from "next";

import Link from "next/link";

import { createClient } from "@supabase/supabase-js";

import HomeClient from "./HomeClient";

// =========================================================
// HOME CACHE
// =========================================================

export const revalidate = 60;
export const dynamic = "force-static";

// =========================================================
// TYPES
// =========================================================

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string | null;
  address_en: string | null;
  description_vi: string | null;
  description_en: string | null;
};

type HeroSlide = {
  id: number;
  position: number;
  image_url: string | null;
  title_vi: string | null;
  title_en: string | null;
  description_vi: string | null;
  description_en: string | null;
};

type HotelMedia = {
  entity_id: number;
  public_url: string;
};

// =========================================================
// SUPABASE CLIENT
// =========================================================

function getSupabaseClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Thiếu biến môi trường Supabase: NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }

  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

// =========================================================
// HERO SLIDES
// =========================================================

async function getHeroSlides(
  supabase: ReturnType<typeof getSupabaseClient>
): Promise<HeroSlide[]> {
  const {
    data,
    error,
  } = await supabase
    .from("hero_slides")
    .select(
      `
        id,
        position,
        image_url,
        title_vi,
        title_en,
        description_vi,
        description_en
      `
    )
    .eq("status", "active")
    .order("position", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Lỗi lấy Hero từ Supabase:",
      error
    );

    return [];
  }

  return (data ?? []) as HeroSlide[];
}

// =========================================================
// HOMEPAGE DATA
// =========================================================

async function getHomepageData() {
  const supabase = getSupabaseClient();

  // -------------------------------------------------------
  // HERO
  // -------------------------------------------------------

  const heroSlides =
    await getHeroSlides(supabase);

  // -------------------------------------------------------
  // HOTELS
  // -------------------------------------------------------

  const {
    data: hotelsData,
    error: hotelError,
  } = await supabase
    .from("hotels")
    .select(
      `
        id,
        slug,
        name_vi,
        name_en,
        address_vi,
        address_en,
        description_vi,
        description_en
      `
    )
    .eq("status", "active")
    .order("id", {
      ascending: true,
    });

  if (hotelError) {
    console.error(
      "Lỗi lấy danh sách khách sạn:",
      hotelError
    );

    throw new Error(
      `Không tải được danh sách nơi lưu trú: ${hotelError.message}`
    );
  }

  const hotels =
    (hotelsData ?? []) as Hotel[];

  // -------------------------------------------------------
  // HOTEL COVERS
  // -------------------------------------------------------

  const hotelCovers: Record<
    number,
    string
  > = {};

  const hotelIds = hotels
    .map((hotel) => hotel.id)
    .filter(
      (id): id is number =>
        Number.isFinite(id)
    );

  if (hotelIds.length > 0) {
    const {
      data: mediaData,
      error: mediaError,
    } = await supabase
      .from("media")
      .select(
        "entity_id, public_url"
      )
      .eq("entity_type", "hotel")
      .eq("is_cover", true)
      .eq("status", "active")
      .in("entity_id", hotelIds);

    if (mediaError) {
      console.error(
        "Lỗi lấy ảnh cover khách sạn:",
        mediaError
      );
    } else if (mediaData) {
      for (const item of mediaData as HotelMedia[]) {
        if (
          Number.isFinite(
            item.entity_id
          ) &&
          typeof item.public_url ===
            "string" &&
          item.public_url.trim()
        ) {
          hotelCovers[item.entity_id] =
            item.public_url;
        }
      }
    }
  }

  return {
    heroSlides,
    hotels,
    hotelCovers,
  };
}

// =========================================================
// SEO METADATA
// =========================================================

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://huyenstays.vercel.app";

  const canonicalUrl =
    siteUrl.replace(/\/$/, "");

  const title =
    "Huyen's Hotels & Stays | Khách sạn, guesthouse & homestay Quận 1 TP.HCM";

  const description =
    "Huyen's Hotels & Stays cung cấp khách sạn, guesthouse và homestay tại Quận 1, TP.HCM. Khám phá phòng nghỉ, xem tiện nghi và đặt phòng trực tiếp.";

  // -------------------------------------------------------
  // HERO IMAGE FOR SEO / OG
  // -------------------------------------------------------

  let heroImageUrl =
    `${canonicalUrl}/hero/hero-1.webp`;

  try {
    const supabase =
      getSupabaseClient();

    const {
      data: heroData,
      error: heroError,
    } = await supabase
      .from("hero_slides")
      .select("image_url")
      .eq("status", "active")
      .order("position", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (
      !heroError &&
      heroData?.image_url
    ) {
      heroImageUrl =
        heroData.image_url;
    }
  } catch (error) {
    console.error(
      "Lỗi lấy Hero image cho SEO:",
      error
    );
  }

  return {
    title,
    description,

    keywords: [
      "khách sạn Quận 1",
      "khách sạn trung tâm Quận 1",
      "khách sạn TP.HCM",
      "khách sạn Hồ Chí Minh",
      "guesthouse Quận 1",
      "homestay Quận 1",
      "homestay TP.HCM",
      "nhà nghỉ Quận 1",
      "đặt phòng Quận 1",
      "đặt phòng khách sạn TP.HCM",
      "phòng khách sạn Quận 1",
      "Huyen's Hotels & Stays",
    ],

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: canonicalUrl,
      siteName: "Huyen's Hotels & Stays",
      title,
      description,

      images: [
        {
          url: heroImageUrl,
          width: 1600,
          height: 900,
          alt: "Huyen's Hotels & Stays - Khách sạn, guesthouse và homestay Quận 1 TP.HCM",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [heroImageUrl],
    },
  };
}

// =========================================================
// HOME PAGE
// =========================================================

export default async function HomePage() {
  let data: Awaited<
    ReturnType<typeof getHomepageData>
  >;

  try {
    data =
      await getHomepageData();
  } catch (error) {
    console.error(
      "Lỗi Trang Chủ:",
      error
    );

    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h2 className="mb-2 text-xl font-semibold text-neutral-900">
            Không thể tải trang
          </h2>

          <p className="mb-6 text-neutral-500">
            Đã xảy ra lỗi khi lấy dữ liệu.
            Vui lòng tải lại trang sau ít phút.
          </p>

          <Link
            href="/"
            className="inline-flex rounded-lg bg-sky-500 px-6 py-2 font-medium text-white transition hover:bg-sky-600"
          >
            Tải lại
          </Link>
        </div>
      </main>
    );
  }

  const {
    heroSlides,
    hotels,
    hotelCovers,
  } = data;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://huyenstays.vercel.app";

  const canonicalUrl =
    siteUrl.replace(/\/$/, "");

  // =======================================================
  // STRUCTURED DATA
  // =======================================================

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",

    name:
      "Khách sạn và nơi lưu trú tại Quận 1, TP.HCM",

    itemListElement: hotels.map(
      (hotel, index) => {
        const hotelUrl =
          `${canonicalUrl}/khach-san/${hotel.slug}`;

        const item: Record<
          string,
          unknown
        > = {
          "@type": "ListItem",

          position: index + 1,

          item: {
            "@type": "Hotel",

            name: hotel.name_vi,

            description:
              hotel.description_vi ||
              undefined,

            url: hotelUrl,

            address: {
              "@type":
                "PostalAddress",

              streetAddress:
                hotel.address_vi ||
                undefined,

              addressLocality:
                "Hồ Chí Minh",

              addressRegion:
                "TP.HCM",

              addressCountry:
                "VN",
            },
          },
        };

        const cover =
          hotelCovers[hotel.id];

        if (cover) {
          (
            item.item as {
              image?: string;
            }
          ).image = cover;
        }

        return item;
      }
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ),
        }}
      />

      <HomeClient
        heroSlides={heroSlides}
        hotels={hotels}
        hotelCovers={hotelCovers}
      />
    </>
  );
}
