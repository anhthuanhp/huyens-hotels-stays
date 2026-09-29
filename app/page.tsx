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
// SEO
// =========================================================

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenhotels.com";

const SITE_NAME = "Huyen's Hotels & Stays";

const SEO_TITLE =
  "Khách sạn, Guesthouse & Homestay TP.HCM | Huyen's Hotels & Stays";

const SEO_DESCRIPTION =
  "Huyen's Hotels & Stays cung cấp khách sạn, guesthouse và homestay tại TP.HCM. Khám phá phòng nghỉ tiện nghi, vị trí thuận tiện và đặt phòng trực tiếp.";

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
// OTA TYPES
// =========================================================

type HotelOTAChannelRow = {
  id: number;
  hotel_id: number;
  ota_id: number | null;
  listing_url: string | null;
  external_hotel_id: string | null;
  sort_order: number | null;
  status: string | null;
};

type OTAPlatform = {
  id: number;
  name: string | null;
  slug: string | null;
  logo: string | null;
  website: string | null;
};

type HotelOTA = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  listing_url: string | null;
  external_hotel_id: string | null;
  sort_order: number;
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
      "Thiáº¿u biáº¿n mÃ´i trÆ°á»ng Supabase: NEXT_PUBLIC_SUPABASE_URL hoáº·c NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
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
      "Lá»—i láº¥y Hero tá»« Supabase:",
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
      "Lá»—i láº¥y danh sÃ¡ch khÃ¡ch sáº¡n:",
      hotelError
    );

    throw new Error(
      `KhÃ´ng táº£i Ä‘Æ°á»£c danh sÃ¡ch nÆ¡i lÆ°u trÃº: ${hotelError.message}`
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
        "Lá»—i láº¥y áº£nh cover khÃ¡ch sáº¡n:",
        mediaError
      );
    } else if (mediaData) {
      for (const item of mediaData as HotelMedia[]) {
        if (
          Number.isFinite(item.entity_id) &&
          typeof item.public_url === "string" &&
          item.public_url.trim()
        ) {
          hotelCovers[item.entity_id] =
            item.public_url;
        }
      }
    }
  }

  // -------------------------------------------------------
  // HOTEL OTAs
  // -------------------------------------------------------

  const hotelOTAs: Record<
    number,
    HotelOTA[]
  > = {};

  if (hotelIds.length > 0) {
    const {
      data: otaChannelsData,
      error: otaChannelsError,
    } = await supabase
      .from("hotel_ota_channels")
      .select(
        `
          id,
          hotel_id,
          ota_id,
          listing_url,
          external_hotel_id,
          sort_order,
          status
        `
      )
      .in("hotel_id", hotelIds)
      .order("sort_order", {
        ascending: true,
      });

    if (otaChannelsError) {
      console.error(
        "Lá»—i láº¥y OTA cá»§a khÃ¡ch sáº¡n:",
        otaChannelsError
      );
    } else {
      const otaRows: HotelOTAChannelRow[] =
        (otaChannelsData ?? [])
          .filter(
            (row) =>
              typeof row.status === "string" &&
              row.status.trim().toLowerCase() ===
                "active"
          )
          .map((row) => ({
            id: row.id,
            hotel_id: row.hotel_id,
            ota_id: row.ota_id,
            listing_url: row.listing_url,
            external_hotel_id:
              row.external_hotel_id,
            sort_order: row.sort_order,
            status: row.status,
          }));

      const platformIds = Array.from(
        new Set(
          otaRows
            .map((row) => row.ota_id)
            .filter(
              (id): id is number =>
                typeof id === "number" &&
                Number.isFinite(id)
            )
        )
      );

      let platforms: OTAPlatform[] = [];

      if (platformIds.length > 0) {
        const {
          data: platformsData,
          error: platformsError,
        } = await supabase
          .from("ota_platforms")
          .select(
            `
              id,
              name,
              slug,
              logo,
              website
            `
          )
          .in("id", platformIds);

        if (platformsError) {
          console.error(
            "Lá»—i láº¥y thÃ´ng tin ná»n táº£ng OTA:",
            platformsError
          );
        } else {
          platforms =
            (platformsData ?? []) as OTAPlatform[];
        }
      }

      const platformMap =
        new Map<number, OTAPlatform>();

      for (const platform of platforms) {
        platformMap.set(
          platform.id,
          platform
        );
      }

      for (const row of otaRows) {
        const platform =
          row.ota_id !== null
            ? platformMap.get(row.ota_id)
            : undefined;

        const name =
          platform?.name ||
          (row.ota_id !== null
            ? `OTA ${row.ota_id}`
            : "OTA");

        const ota: HotelOTA = {
          id: row.id,
          name,
          slug: platform?.slug || "",
          logo: platform?.logo || null,
          website:
            platform?.website || null,
          listing_url:
            row.listing_url || null,
          external_hotel_id:
            row.external_hotel_id || null,
          sort_order:
            typeof row.sort_order === "number"
              ? row.sort_order
              : 0,
        };

        if (!hotelOTAs[row.hotel_id]) {
          hotelOTAs[row.hotel_id] = [];
        }

        hotelOTAs[row.hotel_id].push(
          ota
        );
      }

      for (const hotelId of Object.keys(
        hotelOTAs
      )) {
        hotelOTAs[Number(hotelId)].sort(
          (a, b) =>
            (a.sort_order ?? 0) -
            (b.sort_order ?? 0)
        );
      }
    }
  }

  return {
    heroSlides,
    hotels,
    hotelCovers,
    hotelOTAs,
  };
}

// =========================================================
// SEO METADATA
// =========================================================

export async function generateMetadata(): Promise<Metadata> {
  const canonicalUrl =
    SITE_URL.replace(/\/+$/, "");

  // -------------------------------------------------------
  // HERO IMAGE FOR OPEN GRAPH / SOCIAL SHARING
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
      "Lá»—i láº¥y Hero image cho SEO:",
      error
    );
  }

  return {
    metadataBase: new URL(canonicalUrl),

    title: SEO_TITLE,

    description: SEO_DESCRIPTION,

    keywords: [
      "khÃ¡ch sáº¡n TP.HCM",
      "khÃ¡ch sáº¡n Há»“ ChÃ­ Minh",
      "khÃ¡ch sáº¡n trung tÃ¢m TP.HCM",
      "guesthouse TP.HCM",
      "homestay TP.HCM",
      "khÃ¡ch sáº¡n Quáº­n 1",
      "guesthouse Quáº­n 1",
      "homestay Quáº­n 1",
      "nhÃ  nghá»‰ TP.HCM",
      "Ä‘áº·t phÃ²ng khÃ¡ch sáº¡n TP.HCM",
      "Ä‘áº·t phÃ²ng Quáº­n 1",
      "phÃ²ng khÃ¡ch sáº¡n TP.HCM",
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
      siteName: SITE_NAME,
      title: SEO_TITLE,
      description: SEO_DESCRIPTION,

      images: [
        {
          url: heroImageUrl,
          width: 1600,
          height: 900,
          alt:
            "Huyen's Hotels & Stays - KhÃ¡ch sáº¡n, guesthouse vÃ  homestay táº¡i TP.HCM",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: SEO_TITLE,
      description: SEO_DESCRIPTION,
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
      "Lá»—i Trang Chá»§:",
      error
    );

    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h2 className="mb-2 text-xl font-semibold text-neutral-900">
            KhÃ´ng thá»ƒ táº£i trang
          </h2>

          <p className="mb-6 text-neutral-500">
            ÄÃ£ xáº£y ra lá»—i khi láº¥y dá»¯ liá»‡u.
            Vui lÃ²ng táº£i láº¡i trang sau Ã­t phÃºt.
          </p>

          <Link
            href="/"
            className="inline-flex rounded-lg bg-sky-500 px-6 py-2 font-medium text-white transition hover:bg-sky-600"
          >
            Táº£i láº¡i
          </Link>
        </div>
      </main>
    );
  }

  const {
    heroSlides,
    hotels,
    hotelCovers,
    hotelOTAs,
  } = data;

  const canonicalUrl =
    SITE_URL.replace(/\/+$/, "");

  // =======================================================
  // STRUCTURED DATA
  // =======================================================

  const structuredData = {
    "@context": "https://schema.org",

    "@graph": [
      // ---------------------------------------------------
      // ORGANIZATION
      // ---------------------------------------------------

      {
        "@type": "Organization",

        "@id": `${canonicalUrl}/#organization`,

        name: SITE_NAME,

        url: canonicalUrl,

        description: SEO_DESCRIPTION,
      },

      // ---------------------------------------------------
      // WEBSITE
      // ---------------------------------------------------

      {
        "@type": "WebSite",

        "@id": `${canonicalUrl}/#website`,

        url: canonicalUrl,

        name: SITE_NAME,

        description: SEO_DESCRIPTION,

        publisher: {
          "@id": `${canonicalUrl}/#organization`,
        },

        inLanguage: "vi-VN",
      },

      // ---------------------------------------------------
      // HOTEL LIST
      // ---------------------------------------------------

      {
        "@type": "ItemList",

        "@id": `${canonicalUrl}/#hotel-list`,

        name:
          "KhÃ¡ch sáº¡n vÃ  nÆ¡i lÆ°u trÃº táº¡i TP.HCM",

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
                    "Há»“ ChÃ­ Minh",

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
      },
    ],
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
        hotelOTAs={hotelOTAs}
      />
    </>
  );
}