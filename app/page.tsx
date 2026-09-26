
import { createClient } from "@supabase/supabase-js";
import HomeClient from "./HomeClient";

// =========================================================
// HOME CACHE
// =========================================================
// Revalidate mỗi 60 giây.
// Home vẫn được cache nhưng dữ liệu Supabase không bị cũ quá lâu.
export const revalidate = 60;

// Cho Next.js ưu tiên Static Rendering để Home tải nhanh.
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
// HERO SLIDES
// =========================================================
// Giữ cố định ở server để Home không phải gọi thêm Supabase.
// Khi cần đổi ảnh/nội dung hero chỉ cần sửa tại đây.

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    position: 1,
    image_url: "/hero/hero-1.webp",
    title_vi: "Huyen's Hotels & Stays — Khách sạn Quận 1 TP.HCM",
    title_en: "Huyen's Hotels & Stays — Hotels in District 1 HCMC",
    description_vi:
      "Không gian lưu trú tiện nghi, riêng tư, vị trí trung tâm Quận 1. Đặt phòng ngay!",
    description_en:
      "Comfortable, private stays in central District 1. Book directly for best rates.",
  },
  {
    id: 2,
    position: 2,
    image_url: "/hero/hero-2.webp",
    title_vi: "Phòng nghỉ hiện đại & tiện nghi",
    title_en: "Modern & Comfortable Rooms",
    description_vi:
      "Thiết kế hiện đại, đầy đủ tiện nghi — cho kỳ nghỉ hoàn hảo tại Sài Gòn.",
    description_en:
      "Thoughtfully designed rooms with full amenities for your perfect stay in Saigon.",
  },
  {
    id: 3,
    position: 3,
    image_url: "/hero/hero-3.webp",
    title_vi: "Vị trí vàng trung tâm Quận 1",
    title_en: "Prime Location in District 1",
    description_vi:
      "Gần các điểm tham quan, trung tâm thương mại & ga tàu — di chuyển cực dễ.",
    description_en:
      "Close to attractions, malls & transit — easy access everywhere.",
  },
  {
    id: 4,
    position: 4,
    image_url: "/hero/hero-4.webp",
    title_vi: "Chọn phòng phù hợp với bạn",
    title_en: "Your Ideal Stay Awaits",
    description_vi:
      "Nhiều loại phòng đa dạng — từ đơn đến gia đình. Giá tốt trực tiếp tại website.",
    description_en:
      "Rooms for every group — solo, couple or family. Best rates direct.",
  },
];

// =========================================================
// SUPABASE CLIENT
// =========================================================

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Thiếu biến môi trường Supabase: NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// =========================================================
// HOMEPAGE DATA
// =========================================================
// Chỉ lấy dữ liệu thực sự cần cho Home.
//
// Bước 1:
//   Lấy danh sách khách sạn active.
//
// Bước 2:
//   Dựa trên ID khách sạn để lấy ảnh cover.
//
// Không tải rooms, amenities, OTA, booking... ở Home.
// Những dữ liệu đó chỉ nên tải khi người dùng vào trang chi tiết.

async function getHomepageData() {
  const supabase = getSupabaseClient();

  // -------------------------------------------------------
  // 1. LẤY DANH SÁCH KHÁCH SẠN
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
    .order("id", { ascending: true });

  if (hotelError) {
    console.error("Lỗi lấy danh sách khách sạn:", hotelError);

    throw new Error(
      `Không tải được danh sách nơi lưu trú: ${hotelError.message}`
    );
  }

  const hotels = (hotelsData ?? []) as Hotel[];

  // -------------------------------------------------------
  // 2. LẤY ẢNH COVER KHÁCH SẠN
  // -------------------------------------------------------

  const hotelCovers: Record<number, string> = {};

  const hotelIds = hotels
    .map((hotel) => hotel.id)
    .filter((id): id is number => Number.isFinite(id));

  if (hotelIds.length > 0) {
    const {
      data: mediaData,
      error: mediaError,
    } = await supabase
      .from("media")
      .select("entity_id, public_url")
      .eq("entity_type", "hotel")
      .eq("is_cover", true)
      .eq("status", "active")
      .in("entity_id", hotelIds);

    if (mediaError) {
      // Ảnh cover không có thì Home vẫn có thể hiển thị.
      // Không làm toàn bộ Home lỗi chỉ vì bảng media gặp lỗi.
      console.error("Lỗi lấy ảnh cover khách sạn:", mediaError);
    } else if (mediaData) {
      for (const item of mediaData as HotelMedia[]) {
        if (
          Number.isFinite(item.entity_id) &&
          typeof item.public_url === "string" &&
          item.public_url.trim()
        ) {
          hotelCovers[item.entity_id] = item.public_url;
        }
      }
    }
  }

  // -------------------------------------------------------
  // 3. TRẢ DỮ LIỆU TỐI THIỂU CHO CLIENT
  // -------------------------------------------------------

  return {
    heroSlides,
    hotels,
    hotelCovers,
  };
}

// =========================================================
// SEO METADATA
// =========================================================

export async function generateMetadata() {
  return {
    title: "Huyen's Hotels & Stays — Khách sạn & Nhà nghỉ Quận 1 TP.HCM",

    description:
      "Đặt phòng trực tiếp tại Huyen's Hotels & Stays — hệ thống lưu trú tiện nghi tại trung tâm Quận 1, Thành phố Hồ Chí Minh. Giá tốt, đặt phòng trực tiếp.",

    keywords: [
      "khách sạn quận 1",
      "khách sạn trung tâm quận 1",
      "nhà nghỉ sài gòn",
      "lưu trú tp hcm",
      "đặt phòng quận 1",
      "hotel district 1",
      "hotel ho chi minh city",
    ],

    alternates: {
      canonical: "/",
    },

    openGraph: {
      title: "Huyen's Hotels & Stays",
      description:
        "Không gian lưu trú tiện nghi, riêng tư tại trung tâm Quận 1, Thành phố Hồ Chí Minh.",
      locale: "vi_VN",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: "Huyen's Hotels & Stays",
      description:
        "Không gian lưu trú tiện nghi tại trung tâm Quận 1, TP.HCM.",
    },
  };
}

// =========================================================
// HOME PAGE
// =========================================================

export default async function HomePage() {
  let data: Awaited<ReturnType<typeof getHomepageData>>;

  try {
    data = await getHomepageData();
  } catch (error) {
    console.error("Lỗi Trang Chủ:", error);

    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h2 className="mb-2 text-xl font-semibold text-neutral-900">
            Không thể tải trang
          </h2>

          <p className="mb-6 text-neutral-500">
            Đã xảy ra lỗi khi lấy dữ liệu. Vui lòng tải lại trang sau ít phút.
          </p>

          <a
            href="/"
            className="inline-flex rounded-lg bg-sky-500 px-6 py-2 font-medium text-white transition hover:bg-sky-600"
          >
            Tải lại
          </a>
        </div>
      </main>
    );
  }

  const { heroSlides, hotels, hotelCovers } = data;

  // =======================================================
  // STRUCTURED DATA
  // =======================================================
  // Chỉ đưa các khách sạn đang active vào schema.
  // Không đưa rooms / amenities / OTA lên Home để giảm payload.

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Danh sách cơ sở lưu trú",
    itemListElement: hotels.map((hotel, index) => {
      const item: Record<string, unknown> = {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Hotel",
          name: hotel.name_vi,
          description: hotel.description_vi || undefined,
          address: {
            "@type": "PostalAddress",
            streetAddress: hotel.address_vi || undefined,
            addressLocality: "Hồ Chí Minh",
            addressRegion: "TP.HCM",
            addressCountry: "VN",
          },
          url: `/${hotel.slug}`,
        },
      };

      const cover = hotelCovers[hotel.id];

      if (cover) {
        (
          item.item as {
            image?: string;
          }
        ).image = cover;
      }

      return item;
    }),
  };

  return (
    <>
      {/* ===================================================
          SEO STRUCTURED DATA
          =================================================== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* ===================================================
          HOME CLIENT
          =================================================== */}
      <HomeClient
        heroSlides={heroSlides}
        hotels={hotels}
        hotelCovers={hotelCovers}
      />
    </>
  );
}
