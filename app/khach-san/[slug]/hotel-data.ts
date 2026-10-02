import { unstable_cache } from "next/cache";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

export type Hotel = {
  id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
  address_vi: string | null;
  address_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  image: string | null;
  status: string | null;
  business_model: string | null;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
  nearby_vi: string | null;
  nearby_en: string | null;
};

export type Room = {
  id: number;
  hotel_id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  image: string | null;
  size: number | null;
  max_guests: number | null;
  beds_vi: string | null;
  beds_en: string | null;
  base_price: number | null;
  quantity: number | null;
  amenities_vi: unknown;
  amenities_en: unknown;
  amenities: unknown;
  status: string | null;
};

export type HotelFaq = {
  id: string;
  hotel_id: number;
  question_vi: string;
  answer_vi: string;
  question_en: string | null;
  answer_en: string | null;
  sort_order: number;
};

export type HotelListItem = {
  id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
};

export type ClientRoomMedia = {
  entity_id: number;
  public_url: string;
};

export type NearbyCategory = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  icon: string | null;
  sort_order: number;
  status: boolean;
};

export type HotelNearbyPlace = {
  id: number;
  hotel_id: number;
  category_id: number;
  name_vi: string;
  name_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  distance_m: number | null;
  walking_minutes: number | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  image: string | null;
  sort_order: number;
  status: boolean;
};

export type HotelNearbyData = {
  categories: NearbyCategory[];
  places: HotelNearbyPlace[];
};

function getSupabaseServerClient(): SupabaseClient {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return createClient(
    supabaseUrl,
    supabaseKey
  );
}

export async function getCachedHotel(
  slug: string
): Promise<Hotel | null> {
  const getHotel = unstable_cache(
    async (
      currentSlug: string
    ): Promise<Hotel | null> => {
      const supabase =
        getSupabaseServerClient();

      const {
        data,
        error,
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
            description_en,
            image,
            status,
            business_model,
            latitude,
            longitude,
            map_url,
            nearby_vi,
            nearby_en
          `
        )
        .eq("slug", currentSlug)
        .eq("status", "active")
        .maybeSingle();

      if (error) {
        console.error(
          "getCachedHotel error:",
          error
        );
        return null;
      }

      return data
        ? (data as Hotel)
        : null;
    },
    [
      "hotel-detail",
      slug,
    ],
    {
      revalidate: 60,
    }
  );

  return getHotel(slug);
}

export const getCachedHotelSlugs =
  unstable_cache(
    async (): Promise<string[]> => {
      const supabase =
        getSupabaseServerClient();

      const {
        data,
        error,
      } = await supabase
        .from("hotels")
        .select("slug")
        .eq("status", "active");

      if (error) {
        console.error(
          "getCachedHotelSlugs error:",
          error
        );
        return [];
      }

      return (data || [])
        .filter(
          (
            item
          ): item is { slug: string } =>
            typeof item.slug === "string" &&
            item.slug.trim().length > 0
        )
        .map(
          (item) => item.slug
        );
    },
    ["hotel-slugs"],
    {
      revalidate: 60,
    }
  );

export const getCachedHotelList =
  unstable_cache(
    async (): Promise<
      HotelListItem[]
    > => {
      const supabase =
        getSupabaseServerClient();

      const {
        data,
        error,
      } = await supabase
        .from("hotels")
        .select(
          "id, slug, name_vi, name_en"
        )
        .eq("status", "active")
        .order("id", {
          ascending: true,
        });

      if (error) {
        console.error(
          "getCachedHotelList error:",
          error
        );
        return [];
      }

      return (data || []) as HotelListItem[];
    },
    ["hotel-list"],
    {
      revalidate: 60,
    }
  );

export async function getCachedRoomsAndFaqs(
  hotelId: number
): Promise<{
  rooms: Room[];
  faqs: HotelFaq[];
}> {
  const getRoomsAndFaqs =
    unstable_cache(
      async (
        currentHotelId: number
      ): Promise<{
        rooms: Room[];
        faqs: HotelFaq[];
      }> => {
        const supabase =
          getSupabaseServerClient();

        const [
          roomsResult,
          faqsResult,
        ] = await Promise.all([
          supabase
            .from("rooms")
            .select(
              `
                id,
                hotel_id,
                slug,
                name_vi,
                name_en,
                description_vi,
                description_en,
                image,
                size,
                max_guests,
                beds_vi,
                beds_en,
                base_price,
                quantity,
                amenities_vi,
                amenities_en,
                amenities,
                status
              `
            )
            .eq(
              "hotel_id",
              currentHotelId
            )
            .eq("status", "active")
            .order("id", {
              ascending: true,
            }),

          supabase
            .from("hotel_faqs")
            .select(
              `
                id,
                hotel_id,
                question_vi,
                answer_vi,
                question_en,
                answer_en,
                sort_order
              `
            )
            .eq(
              "hotel_id",
              currentHotelId
            )
            .eq("is_active", true)
            .order("sort_order", {
              ascending: true,
            })
            .order("id", {
              ascending: true,
            }),
        ]);

        if (roomsResult.error) {
          console.error(
            "getCachedRoomsAndFaqs rooms error:",
            roomsResult.error
          );
        }

        if (faqsResult.error) {
          console.error(
            "getCachedRoomsAndFaqs FAQ error:",
            faqsResult.error
          );
        }

        return {
          rooms:
            (roomsResult.data || []) as Room[],

          faqs:
            (faqsResult.data || []).map(
              (faq) => ({
                id: String(faq.id),
                hotel_id:
                  faq.hotel_id,
                question_vi:
                  faq.question_vi,
                answer_vi:
                  faq.answer_vi,
                question_en:
                  faq.question_en,
                answer_en:
                  faq.answer_en,
                sort_order:
                  faq.sort_order,
              })
            ),
        };
      },
      [
        "hotel-rooms-faqs",
        String(hotelId),
      ],
      {
        revalidate: 60,
      }
    );

  return getRoomsAndFaqs(hotelId);
}

/**
 * Nearby được đọc trực tiếp từ Supabase.
 *
 * Không dùng unstable_cache ở đây trong giai đoạn này
 * để tránh dữ liệu Nearby mới thêm vào bị giữ cache.
 */
export async function getCachedHotelNearby(
  hotelId: number
): Promise<HotelNearbyData> {
  const supabase =
    getSupabaseServerClient();

  const [
    categoriesResult,
    placesResult,
  ] = await Promise.all([
    supabase
      .from("nearby_categories")
      .select(
        `
          id,
          slug,
          name_vi,
          name_en,
          icon,
          sort_order,
          status
        `
      )
      .eq("status", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      }),

    supabase
      .from("hotel_nearby_places")
      .select(
        `
          id,
          hotel_id,
          category_id,
          name_vi,
          name_en,
          description_vi,
          description_en,
          distance_m,
          walking_minutes,
          latitude,
          longitude,
          google_maps_url,
          image,
          sort_order,
          status
        `
      )
      .eq(
        "hotel_id",
        hotelId
      )
      .eq("status", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      }),
  ]);

  if (categoriesResult.error) {
    console.error(
      "getCachedHotelNearby categories error:",
      categoriesResult.error
    );
  }

  if (placesResult.error) {
    console.error(
      "getCachedHotelNearby places error:",
      placesResult.error
    );
  }

  const categories =
    (categoriesResult.data || []) as NearbyCategory[];

  const places =
    (placesResult.data || []) as HotelNearbyPlace[];

  console.log(
    `[Nearby] hotel=${hotelId} categories=${categories.length} places=${places.length}`
  );

  return {
    categories,
    places,
  };
}

export async function getCachedRoomCovers(
  roomIdsKey: string
): Promise<ClientRoomMedia[]> {
  if (!roomIdsKey) {
    return [];
  }

  const getRoomCovers =
    unstable_cache(
      async (
        currentRoomIdsKey: string
      ): Promise<ClientRoomMedia[]> => {
        if (!currentRoomIdsKey) {
          return [];
        }

        const roomIds =
          currentRoomIdsKey
            .split(",")
            .map(Number)
            .filter(Number.isFinite);

        if (roomIds.length === 0) {
          return [];
        }

        const supabase =
          getSupabaseServerClient();

        const {
          data,
          error,
        } = await supabase
          .from("media")
          .select(
            "id, entity_id, public_url, sort_order"
          )
          .eq(
            "entity_type",
            "room"
          )
          .eq(
            "is_cover",
            true
          )
          .eq(
            "status",
            "active"
          )
          .in(
            "entity_id",
            roomIds
          )
          .order(
            "sort_order",
            {
              ascending: true,
            }
          )
          .order("id", {
            ascending: true,
          });

        if (error) {
          console.error(
            "getCachedRoomCovers error:",
            error
          );
          return [];
        }

        const coverMap =
          new Map<number, string>();

        for (
          const media of data || []
        ) {
          if (
            typeof media.entity_id !==
              "number" ||
            !media.public_url ||
            coverMap.has(
              media.entity_id
            )
          ) {
            continue;
          }

          coverMap.set(
            media.entity_id,
            media.public_url
          );
        }

        return Array.from(
          coverMap.entries()
        ).map(
          ([
            entity_id,
            public_url,
          ]) => ({
            entity_id,
            public_url,
          })
        );
      },
      [
        "room-covers",
        roomIdsKey,
      ],
      {
        revalidate: 60,
      }
    );

  return getRoomCovers(
    roomIdsKey
  );
}