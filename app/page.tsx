import type { Metadata } from "next";
import { cache } from "react";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

import HomeClient from "./HomeClient";

export const revalidate = 60;

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenhotels.com"
).replace(/\/+$/, "");

const SITE_NAME = "Huyen's Hotels & Stays";

const SEO_TITLE =
  "Khách sạn, Homestay TP.HCM | Huyen's Hotels & Stays";

const SEO_DESCRIPTION =
  "Huyen's Hotels & Stays cung cấp khách sạn, guesthouse và homestay tại TP.HCM. Khám phá phòng nghỉ tiện nghi, vị trí thuận tiện và đặt phòng trực tiếp.";

const FALLBACK_OG_IMAGE =
  `${SITE_URL}/hero/hero-1.webp`;

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

type OTAChannelRow = {
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
type CustomerReview = {
  id: number;
  guest_name: string;
  rating: number;
  review_vi: string;
  review_en: string | null;
  guest_country: string | null;
};

/*
 * Supabase server client.
 *
 * persistSession=false vì trang Home không cần session Supabase.
 */
let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Thiếu biến môi trường Supabase: NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }

  supabaseClient = createClient(
    url,
    key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  return supabaseClient;
}

/* =========================================================
   HERO
========================================================= */

const getHeroSlides = cache(
  async (): Promise<HeroSlide[]> => {
    const { data, error } =
      await getSupabase()
        .from("hero_slides")
        .select(
          "id, position, image_url, title_vi, title_en, description_vi, description_en"
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

    return (data ??
      []) as HeroSlide[];
  }
);

/* =========================================================
   HOTELS
========================================================= */

async function getHotels(): Promise<
  Hotel[]
> {
  const { data, error } =
    await getSupabase()
      .from("hotels")
      .select(
        "id, slug, name_vi, name_en, address_vi, address_en, description_vi, description_en"
      )
      .eq("status", "active")
      .order("id", {
        ascending: true,
      });

  if (error) {
    console.error(
      "Lỗi lấy danh sách khách sạn:",
      error
    );

    throw new Error(
      `Không tải được danh sách nơi lưu trú: ${error.message}`
    );
  }

  return (data ??
    []) as Hotel[];
}

/* =========================================================
   HOTEL COVERS
========================================================= */

async function getCustomerReviews(): Promise<CustomerReview[]> {
  const { data, error } = await getSupabase()
    .from("customer_reviews")
    .select(
      "id, guest_name, rating, review_vi, review_en, guest_country"
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Lỗi lấy nhận xét khách hàng:", error);
    return [];
  }

  return (data ?? []) as CustomerReview[];
}
async function getHotelCovers(
  hotelIds: number[]
): Promise<Record<number, string>> {
  const covers: Record<
    number,
    string
  > = {};

  if (hotelIds.length === 0) {
    return covers;
  }

  const { data, error } =
    await getSupabase()
      .from("media")
      .select(
        "entity_id, public_url"
      )
      .eq("entity_type", "hotel")
      .eq("is_cover", true)
      .eq("status", "active")
      .in(
        "entity_id",
        hotelIds
      );

  if (error) {
    console.error(
      "Lỗi lấy ảnh cover khách sạn:",
      error
    );

    return covers;
  }

  for (const item of data ?? []) {
    if (
      Number.isFinite(
        Number(item.entity_id)
      ) &&
      typeof item.public_url ===
        "string" &&
      item.public_url.trim()
    ) {
      covers[
        Number(item.entity_id)
      ] = item.public_url;
    }
  }

  return covers;
}

/* =========================================================
   OTA
   OTA VẪN ĐƯỢC HIỂN THỊ TRÊN HOME
========================================================= */

async function getHotelOTAs(
  hotelIds: number[]
): Promise<
  Record<number, HotelOTA[]>
> {
  const result: Record<
    number,
    HotelOTA[]
  > = {};

  if (hotelIds.length === 0) {
    return result;
  }

  const supabase = getSupabase();

  const { data, error } =
    await supabase
      .from("hotel_ota_channels")
      .select(
        "id, hotel_id, ota_id, listing_url, external_hotel_id, sort_order, status"
      )
      .in(
        "hotel_id",
        hotelIds
      )
      .order("sort_order", {
        ascending: true,
      });

  if (error) {
    console.error(
      "Lỗi lấy OTA của khách sạn:",
      error
    );

    return result;
  }

  const rows =
    ((data ?? []) as OTAChannelRow[])
      .filter(
        (row) =>
          row.status
            ?.trim()
            .toLowerCase() ===
          "active"
      );

  const platformIds =
    Array.from(
      new Set(
        rows
          .map(
            (row) =>
              row.ota_id
          )
          .filter(
            (
              id
            ): id is number =>
              typeof id ===
              "number"
          )
      )
    );

  const platformMap =
    new Map<
      number,
      OTAPlatform
    >();

  if (
    platformIds.length > 0
  ) {
    const {
      data: platforms,
      error:
        platformsError,
    } = await supabase
      .from("ota_platforms")
      .select(
        "id, name, slug, logo, website"
      )
      .in(
        "id",
        platformIds
      );

    if (platformsError) {
      console.error(
        "Lỗi lấy thông tin nền tảng OTA:",
        platformsError
      );
    } else {
      for (const platform of
        (platforms ??
          []) as OTAPlatform[]) {
        platformMap.set(
          platform.id,
          platform
        );
      }
    }
  }

  /*
   * hotel_ota_channels đã được DB sắp xếp theo sort_order.
   */
  for (const row of rows) {
    const platform =
      row.ota_id !== null
        ? platformMap.get(
            row.ota_id
          )
        : undefined;

    const ota: HotelOTA = {
      id: row.id,

      name:
        platform?.name ||
        (row.ota_id !== null
          ? `OTA ${row.ota_id}`
          : "OTA"),

      slug:
        platform?.slug || "",

      logo:
        platform?.logo || null,

      website:
        platform?.website ||
        null,

      listing_url:
        row.listing_url ||
        null,

      external_hotel_id:
        row.external_hotel_id ||
        null,

      sort_order:
        typeof row.sort_order ===
        "number"
          ? row.sort_order
          : 0,
    };

    (
      result[row.hotel_id] ??=
        []
    ).push(ota);
  }

  return result;
}

/* =========================================================
   HOMEPAGE DATA
========================================================= */

async function getHomepageData() {
  /*
   * Các query độc lập chạy song song.
   */
  const [heroSlides, hotels, customerReviews] = await Promise.all([
    getHeroSlides(),
    getHotels(),
    getCustomerReviews(),
  ]);

  const hotelIds =
    hotels.map(
      (hotel) =>
        hotel.id
    );

  /*
   * Cover + OTA cũng chạy song song.
   */
  const [
    hotelCovers,
    hotelOTAs,
  ] =
    hotelIds.length > 0
      ? await Promise.all([
          getHotelCovers(
            hotelIds
          ),
          getHotelOTAs(
            hotelIds
          ),
        ])
      : [
          {} as Record<
            number,
            string
          >,
          {} as Record<
            number,
            HotelOTA[]
          >,
        ];

  return {
    heroSlides,
    hotels,
    hotelCovers,
    hotelOTAs,
    customerReviews,
  };
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata(): Promise<Metadata> {
  const heroSlides =
    await getHeroSlides();

  const ogImage =
    heroSlides[0]
      ?.image_url ||
    FALLBACK_OG_IMAGE;

  return {
    metadataBase:
      new URL(SITE_URL),

    /*
     * absolute để không bị layout template nối thương hiệu
     * thêm một lần nữa.
     */
    title: {
      absolute: SEO_TITLE,
    },

    description:
      SEO_DESCRIPTION,

    /*
     * Chỉ Home mới canonical về SITE_URL.
     * Các trang con tự khai báo canonical riêng.
     */
    alternates: {
      canonical: SITE_URL,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview":
          "large",
        "max-snippet": -1,
        "max-video-preview":
          -1,
      },
    },

    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SEO_TITLE,
      description:
        SEO_DESCRIPTION,

      images: [
        {
          url: ogImage,
          alt:
            "Huyen's Hotels & Stays - Khách sạn, guesthouse và homestay tại TP.HCM",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: SEO_TITLE,
      description:
        SEO_DESCRIPTION,
      images: [ogImage],
    },
  };
}

/* =========================================================
   STRUCTURED DATA
========================================================= */

function buildStructuredData(
  hotels: Hotel[],
  hotelCovers: Record<
    number,
    string
  >
) {
  return {
    "@context":
      "https://schema.org",

    "@graph": [
      {
        "@type":
          "Organization",

        "@id":
          `${SITE_URL}/#organization`,

        name: SITE_NAME,

        url: SITE_URL,

        description:
          SEO_DESCRIPTION,
      },

      {
        "@type":
          "WebSite",

        "@id":
          `${SITE_URL}/#website`,

        url: SITE_URL,

        name: SITE_NAME,

        description:
          SEO_DESCRIPTION,

        publisher: {
          "@id":
            `${SITE_URL}/#organization`,
        },

        inLanguage:
          "vi-VN",
      },

      {
        "@type":
          "ItemList",

        "@id":
          `${SITE_URL}/#hotel-list`,

        name:
          "Khách sạn và nơi lưu trú tại TP.HCM",

        itemListElement:
          hotels.map(
            (
              hotel,
              index
            ) => ({
              "@type":
                "ListItem",

              position:
                index + 1,

              item: {
                "@type":
                  "Hotel",

                name:
                  hotel.name_vi,

                description:
                  hotel.description_vi ||
                  undefined,

                url:
                  `${SITE_URL}/khach-san/${hotel.slug}`,

                image:
                  hotelCovers[
                    hotel.id
                  ] ||
                  undefined,

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
            })
          ),
      },
    ],
  };
}

/*
 * Escape "<" để dữ liệu từ DB không thể
 * kết thúc thẻ script JSON-LD sớm.
 */
function toSafeJsonLd(
  data: unknown
) {
  return JSON.stringify(
    data
  ).replace(
    /</g,
    "\\u003c"
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function HomePage() {
  const {
    heroSlides,
    hotels,
    hotelCovers,
    hotelOTAs,
    customerReviews,
  } = await getHomepageData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            toSafeJsonLd(
              buildStructuredData(
                hotels,
                hotelCovers
              )
            ),
        }}
      />

      <HomeClient
        heroSlides={heroSlides}
        hotels={hotels}
        hotelCovers={hotelCovers}
        hotelOTAs={hotelOTAs}
        customerReviews={customerReviews}
      />
    </>
  );
}