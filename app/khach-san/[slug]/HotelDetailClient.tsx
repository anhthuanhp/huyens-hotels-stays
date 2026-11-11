
"use client";
import { canonicalRoomSlug } from "@/app/lib/room-seo-slugs";

import { useLanguage } from "@/app/lib/use-language";

import Image from "next/image";
import Link from "@/app/components/LocalizedLink";
import { useMemo, useState } from "react";
import {
  BedDouble,
  Check,
  Clock3,
  MapPin,
  Maximize2,
  Navigation,
  Users,
} from "lucide-react";
import HotelBookingSidebar from "./HotelBookingSidebar";
import BoltHotelHero from "./bolt/components/HotelHero";
import BoltFinalCta from "./bolt/components/FinalCta";
import HotelGuides from "../../components/HotelGuides";

type Language = "vi" | "en";

type Hotel = {
  id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
  address_vi: string | null;
  address_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  map_url: string | null;
  business_model: string | null;
  property_type: string | null;
  official_star_rating: number | null;
};

type Room = {
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

type RoomMedia = {
  entity_id: number;
  public_url: string;
};

type HotelListItem = {
  id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
};

type HotelFaq = {
  id: string;
  question_vi: string;
  answer_vi: string;
  question_en: string | null;
  answer_en: string | null;
  sort_order: number;
};

type NearbyCategory = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  icon: string | null;
  sort_order: number;
  status: boolean;
};

type HotelNearbyPlace = {
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

type HotelNearbyData = {
  categories: NearbyCategory[];
  places: HotelNearbyPlace[];
};

type Props = {
  initialHotel: Hotel;
  initialRooms: Room[];
  initialRoomCovers: RoomMedia[];
  initialHotels: HotelListItem[];
  initialFaqs: HotelFaq[];
  initialNearby: HotelNearbyData;
};

/* =========================================================
  SEO LOCAL CONTENT
  Chỉ phục vụ H1 và nội dung giới thiệu địa phương.
  Không ảnh hưởng booking hoặc dữ liệu khách sạn.
========================================================= */

const HOTEL_LOCAL_SEO: Record<
  string,
  {
    vi: string;
    en: string;
  }
> = {
  "anh-kim-hotel": {
    vi: "Anh Kim Hotel trên đường Cô Bắc là lựa chọn để cân nhắc khi tìm khách sạn gần Bùi Viện và chợ Bến Thành. Khách đi công tác, cặp đôi và gia đình có thể so sánh phòng theo diện tích, số giường và sức chứa bên dưới. Chọn ngày ở để kiểm tra phòng và giá phù hợp với lịch trình.",
    en: "Looking for a Co Bac hotel near Bui Vien and Ben Thanh Market? Compare the double and family rooms at Anh Kim Hotel by floor area, bed setup and guest capacity. Check your travel dates for available rooms and rates, whether you are visiting Ho Chi Minh City for work or a city break.",
  },

  "ae-guesthouse": {
    vi: "A&E Guesthouse tại Đỗ Quang Đẩu phù hợp để khám phá khu Bùi Viện và Phạm Ngũ Lão. Nếu ưu tiên ngân sách, hãy so sánh giá theo ngày ở cùng đặc điểm cửa sổ, ban công và số khách của từng phòng. Khu vực có nhiều hoạt động về đêm; bạn nên trao đổi trước với cơ sở nếu nhạy cảm với tiếng ồn.",
    en: "A&E Guesthouse offers accommodation near Pham Ngu Lao and Bui Vien on Do Quang Dau Street. If you are looking for a budget hotel near Bui Vien, compare the actual room rates, window options and guest capacity here before booking. This is a lively nightlife area; ask the property about room placement if you are sensitive to noise.",
  },

  "huyen-house": {
    vi: "Huyen House tại Nguyễn Thị Minh Khai hướng đến kỳ lưu trú yên tĩnh cho khách đi công tác, học tập hoặc có lịch hẹn gần Tổng Lãnh sự quán Mỹ. So sánh phòng cho một hoặc hai người, xác nhận giờ nhận phòng và kiểm tra đường đi đến đúng địa điểm hẹn trước chuyến đi.",
    en: "Consider Huyen House for a quiet stay in Ho Chi Minh City on Nguyen Thi Minh Khai Street, near the US Consulate. Compare rooms for solo travellers and couples when planning a work trip, study visit or consular appointment. Confirm check-in arrangements and the route to your exact appointment address before travelling.",
  },

  huyenhomestay: {
    vi: "Huyen Homestay tại Nguyễn Thị Minh Khai là lựa chọn chỗ ở dài ngày ở trung tâm TP.HCM cho khách đi học, làm việc hoặc tham gia sự kiện. So sánh phòng theo số người và nhu cầu sinh hoạt; khi thuê tháng, cần xác nhận thời hạn thuê, tiền cọc, điện nước, lịch vệ sinh và dịch vụ đi kèm trước khi đặt.",
    en: "Looking for long stay accommodation in Saigon? Huyen Homestay on Nguyen Thi Minh Khai Street offers room options for study, work and longer visits to central Ho Chi Minh City. Compare room capacity and monthly rates, then confirm the rental period, deposit, utilities, cleaning schedule and included services with the property.",
  },
};

const HOTEL_H1_SEO: Record<
  string,
  {
    vi: string;
    en: string;
  }
> = {
  "anh-kim-hotel": {
    vi: "Anh Kim Hotel – Khách sạn Cô Bắc, gần Bùi Viện",
    en: "Anh Kim Hotel – Co Bac hotel near Bui Vien",
  },

  "ae-guesthouse": {
    vi: "A&E Guesthouse – Gần Bùi Viện, Phạm Ngũ Lão và Bến Thành",
    en: "A&E Guesthouse – Stay near Bui Vien and Pham Ngu Lao",
  },

  "huyen-house": {
    vi: "Huyen House – Lưu trú gần Tổng Lãnh sự quán Mỹ",
    en: "Huyen House – Quiet stay near the US Consulate",
  },

  huyenhomestay: {
    vi: "Huyen Homestay – Lưu trú dài ngày tại Nguyễn Thị Minh Khai",
    en: "Huyen Homestay – Long stays on Nguyen Thi Minh Khai",
  },
};

function extractMapUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (
    trimmed.includes("google.com/maps/embed") ||
    trimmed.includes("google.com/maps")
  ) {
    return trimmed;
  }

  const iframeMatch = trimmed.match(
    /<iframe[^>]+src=["']([^"']+)["']/i
  );

  if (iframeMatch?.[1]) {
    return iframeMatch[1];
  }

  const urlMatch = trimmed.match(
    /https?:\/\/[^\s"'<>]+/i
  );

  if (urlMatch?.[0]) {
    return urlMatch[0];
  }

  return trimmed;
}

function parseAmenities(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item.trim();
        }

        if (
          typeof item === "object" &&
          item !== null &&
          "name" in item
        ) {
          return String(
            (item as { name?: unknown }).name ?? ""
          ).trim();
        }

        return String(item).trim();
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const text = value.trim();

    if (!text) {
      return [];
    }

    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        return parseAmenities(parsed);
      }

      if (typeof parsed === "string") {
        return parsed.trim() ? [parsed.trim()] : [];
      }
    } catch {
      // Xử lý như chuỗi thông thường.
    }

    return text
      .split(/\r?\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function formatPrice(
  price: number | null,
  language: Language
): string {
  if (
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return language === "vi" ? "Liên hệ" : "Contact";
  }

  return new Intl.NumberFormat(
    language === "vi" ? "vi-VN" : "en-US"
  ).format(price);
}

function getPriceUnit(
  businessModel: string | null,
  language: Language
): string {
  const model =
    typeof businessModel === "string"
      ? businessModel.trim().toLowerCase()
      : "";

  if (model === "monthly") {
    return language === "vi" ? "/tháng" : "/month";
  }

  return language === "vi" ? "/đêm" : "/night";
}

function formatDistance(
  distanceM: number | null,
  language: Language
): string | null {
  if (
    typeof distanceM !== "number" ||
    !Number.isFinite(distanceM) ||
    distanceM < 0
  ) {
    return null;
  }

  if (distanceM >= 1000) {
    const km = distanceM / 1000;

    const formatted = Number.isInteger(km)
      ? String(km)
      : km.toFixed(1);

    return language === "vi"
      ? `${formatted} km`
      : `${formatted} km`;
  }

  return language === "vi"
    ? `${Math.round(distanceM)} m`
    : `${Math.round(distanceM)} m`;
}

export default function HotelDetailClient({
  initialHotel,
  initialRooms,
  initialRoomCovers,
  initialHotels,
  initialFaqs,
  initialNearby,
}: Props) {
  const language = useLanguage();
  // ROOM_EXPAND_INLINE_V2
  const [expandedRoomIds, setExpandedRoomIds] = useState<number[]>([]);

  const toggleRoom = (id: number) => {
    setExpandedRoomIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  };

  const [activeNearbyCategory, setActiveNearbyCategory] =
    useState<number | null>(null);

  const [showAllNearby, setShowAllNearby] =
    useState(false);

  const roomCovers = useMemo(() => {
    const result: Record<number, string> = {};

    for (const item of initialRoomCovers) {
      if (
        typeof item.entity_id === "number" &&
        item.public_url &&
        !result[item.entity_id]
      ) {
        result[item.entity_id] = item.public_url;
      }
    }

    return result;
  }, [initialRoomCovers]);

  const activeRooms = useMemo(() => {
    return initialRooms.filter((room) => {
      const status =
        typeof room.status === "string"
          ? room.status.trim().toLowerCase()
          : "";

      return status === "active";
    });
  }, [initialRooms]);

  const nearbyGroups = useMemo(() => {
    const categories = Array.isArray(
      initialNearby?.categories
    )
      ? initialNearby.categories
      : [];

    const places = Array.isArray(
      initialNearby?.places
    )
      ? initialNearby.places
      : [];

    return categories
      .filter((category) => category.status === true)
      .map((category) => ({
        category,
        places: places
          .filter(
            (place) =>
              place.category_id === category.id &&
              place.status === true
          )
          .sort(
            (a, b) => a.sort_order - b.sort_order
          ),
      }))
      .filter((group) => group.places.length > 0);
  }, [initialNearby]);

  const hasNearby = nearbyGroups.length > 0;

  const activeNearbyGroup = useMemo(() => {
    if (!nearbyGroups.length) {
      return null;
    }

    const selected = nearbyGroups.find(
      (group) =>
        group.category.id === activeNearbyCategory
    );

    return selected || nearbyGroups[0];
  }, [activeNearbyCategory, nearbyGroups]);

  const visibleNearbyPlaces = useMemo(() => {
    if (!activeNearbyGroup) {
      return [];
    }

    if (showAllNearby) {
      return activeNearbyGroup.places;
    }

    return activeNearbyGroup.places.slice(0, 3);
  }, [activeNearbyGroup, showAllNearby]);

  const hotelName =
    language === "vi"
      ? initialHotel.name_vi ||
        initialHotel.name_en ||
        "Khách sạn"
      : initialHotel.name_en ||
        initialHotel.name_vi ||
        "Hotel";

  const hotelAddress =
    language === "vi"
      ? initialHotel.address_vi ||
        initialHotel.address_en ||
        ""
      : initialHotel.address_en ||
        initialHotel.address_vi ||
        "";

  const hotelDescription =
    language === "vi"
      ? initialHotel.description_vi ||
        initialHotel.description_en ||
        ""
      : initialHotel.description_en ||
        initialHotel.description_vi ||
        "";

  const localSeoContent =
    HOTEL_LOCAL_SEO[initialHotel.slug];

  const seoH1 =
    HOTEL_H1_SEO[initialHotel.slug];

  const displayH1 =
    (seoH1?.[language] || hotelName).normalize("NFC");

  const displayLocalDescription =
    localSeoContent?.[language] || "";

  const mapUrl = extractMapUrl(
    initialHotel.map_url
  );

  const priceUnit = getPriceUnit(
    initialHotel.business_model,
    language
  );


  // Real room photos belonging to this hotel.
  // No stock or demo imagery is used.
  const galleryImages = Array.from(
    new Set(
      activeRooms
        .map((room) => roomCovers[room.id])
        .filter((url): url is string =>
          typeof url === "string" && url.trim().length > 0
        )
    )
  ).map((url) => ({
    url,
    alt: {
      vi: "Hình ảnh phòng tại " + hotelName,
      en: "Room photo at " + hotelName
    }
  }));

  return (
    <main className="min-h-screen bg-cream text-ink">
      <BoltHotelHero
        images={galleryImages}
        hotelName={displayH1}
        propertyType={initialHotel.property_type}
        officialStarRating={initialHotel.official_star_rating}
        locale={language}
        placeholderText={language === "vi"
          ? "Hình ảnh phòng đang được cập nhật"
          : "Room photos coming soon"}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <section>


              {hotelAddress && (
                <div className="mt-3 flex items-start gap-2 text-sm text-mist">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-mist" />
                  <span>{hotelAddress}</span>
                </div>
              )}

              {hotelDescription && (
                <div className="mt-5 whitespace-pre-line text-[15px] leading-7 text-mist">
                  {hotelDescription}
                </div>
              )}

              {displayLocalDescription && (
                <p className="mt-3 text-[15px] leading-7 text-mist">
                  {displayLocalDescription}
                </p>
              )}
            </section>

            <HotelGuides slug={initialHotel.slug} language={language} />

            <section
              id="rooms"
              className="mt-10 scroll-mt-24"
            >
              <div className="mb-5">
                <h2 className="text-2xl font-bold tracking-tight text-brand">
                  {language === "vi"
                    ? "Các loại phòng"
                    : "Room types"}
                </h2>

                <p className="mt-1 text-sm text-mist">
                  {language === "vi"
                    ? "Lựa chọn phòng phù hợp với nhu cầu lưu trú của bạn."
                    : "Choose a room that suits your stay."}
                </p>
              </div>

              {activeRooms.length === 0 ? (
                <div className="rounded-2xl border border-brand/10 bg-sage/50 p-8 text-center text-sm text-mist">
                  {language === "vi"
                    ? "Hiện chưa có loại phòng đang hoạt động."
                    : "No active room types are currently available."}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {activeRooms.map((room) => {
                    const roomName =
                      language === "vi"
                        ? room.name_vi ||
                          room.name_en ||
                          "Phòng"
                        : room.name_en ||
                          room.name_vi ||
                          "Room";

                    const roomDescription =
                      language === "vi"
                        ? room.description_vi ||
                          room.description_en ||
                          ""
                        : room.description_en ||
                          room.description_vi ||
                          "";

                    const beds =
                      language === "vi"
                        ? room.beds_vi ||
                          room.beds_en ||
                          ""
                        : room.beds_en ||
                          room.beds_vi ||
                          "";

                    const amenities =
                      language === "vi"
                        ? parseAmenities(
                            room.amenities_vi ??
                              room.amenities
                          )
                        : parseAmenities(
                            room.amenities_en ??
                              room.amenities
                          );

                    const roomImage =
                      roomCovers[room.id] || null;

                    const stayType =
                      initialHotel.business_model
                        ?.trim()
                        .toLowerCase() === "monthly"
                        ? "month"
                        : "day";

                    const bookingParams =
                      new URLSearchParams();

                    bookingParams.set(
                      "hotel",
                      initialHotel.slug
                    );

                    bookingParams.set(
                      "room",
                      room.slug
                    );

                    bookingParams.set(
                      "stayType",
                      stayType
                    );

                    if (stayType === "month") {
                      bookingParams.set(
                        "months",
                        "1"
                      );
                    }

                    const bookingUrl = `/tim-phong?${bookingParams.toString()}`;

                    return (
                      <article
                        key={room.id}
                        className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand/10 bg-white shadow-sm transition hover:shadow-md"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-sage">
                          {roomImage ? (
                            <Image
                              src={roomImage}
                              alt={[roomName, hotelName].filter(Boolean).join(" – ")}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 45vw"
                              className="object-cover transition duration-300 hover:scale-[1.02]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-400">
                              {language === "vi"
                                ? "Chưa có hình ảnh"
                                : "No image available"}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex min-h-[56px] items-start justify-between gap-4">
                            <h3 className="text-xl font-bold text-brand">
                              {roomName}
                            </h3>

                            <Link
                              href={`/khach-san/${initialHotel.slug}/phong/${canonicalRoomSlug(initialHotel.slug, room.slug)}`}
                              className="shrink-0 text-sm font-medium text-mist transition hover:text-brand"
                            >
                              {language === "vi"
                                ? "Chi tiết"
                                : "Details"}
                            </Link>
                          </div>

                          
                          {/* ROOM_CARD_UNIFORM_V1 */}
                          <div className="mt-3 min-h-[48px]">
                            {roomDescription && (
                              <p className={`text-sm leading-6 text-mist ${expandedRoomIds.includes(room.id) ? "" : "line-clamp-2"}`}>
                                {roomDescription}
                              </p>
                            )}
                          </div>

                          <div className="mt-4 grid min-h-[76px] grid-cols-2 content-start gap-x-4 gap-y-3 text-sm text-mist">
                            {typeof room.size ===
                              "number" &&
                              room.size > 0 && (
                                <div className="flex items-center gap-2">
                                  <Maximize2 className="h-4 w-4 shrink-0" />
                                  <span>
                                    {room.size} m²
                                  </span>
                                </div>
                              )}

                            {typeof room.max_guests ===
                              "number" &&
                              room.max_guests > 0 && (
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 shrink-0" />
                                  <span>
                                    {room.max_guests}{" "}
                                    {language === "vi"
                                      ? "khách"
                                      : "guests"}
                                  </span>
                                </div>
                              )}

                            {beds && (
                              <div className="flex items-center gap-2">
                                <BedDouble className="h-4 w-4 shrink-0" />
                                <span>{beds}</span>
                              </div>
                            )}

                            {typeof room.quantity ===
                              "number" &&
                              room.quantity > 0 && (
                                <div className="flex items-center gap-2">
                                  <BedDouble className="h-4 w-4 shrink-0" />
                                  <span>
                                    {language === "vi"
                                      ? `${room.quantity} phòng`
                                      : `${room.quantity} rooms`}
                                  </span>
                                </div>
                              )}
                          </div>

                          
                          <div className="mt-4 min-h-[126px] border-t border-brand/10 pt-4">
                            {amenities.length > 0 && (
                              <>
                                <div className="mb-2 text-sm font-semibold text-ink">
                                  {language === "vi" ? "Tiện nghi" : "Amenities"}
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {(expandedRoomIds.includes(room.id) ? amenities : amenities.slice(0, 4)).map((amenity, index) => (
                                    <div
                                      key={room.id + "-amenity-" + index}
                                      className="flex items-start gap-2 text-sm text-mist"
                                    >
                                      <Check className="mt-0.5 h-4 w-4 shrink-0" />
                                      <span>{amenity}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>

                          
                          <div className="flex min-h-[48px] items-center">
                            {(roomDescription || amenities.length > 4) && (
                              <button
                                type="button"
                                onClick={() => toggleRoom(room.id)}
                                aria-expanded={expandedRoomIds.includes(room.id)}
                                className="flex w-full items-center justify-between rounded-lg border border-brand/25 bg-sage/60 px-4 py-3 text-sm font-bold uppercase tracking-wide text-brand transition-colors hover:border-brand hover:bg-sage"
                              >
                                <span>
                                  {expandedRoomIds.includes(room.id)
                                    ? (language === "vi" ? "THU GỌN" : "SHOW LESS")
                                    : (language === "vi" ? "XEM ĐẦY ĐỦ THÔNG TIN" : "VIEW ALL DETAILS")}
                                </span>
                                <svg
                                  aria-hidden="true"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className={`h-5 w-5 transition-transform ${
                                    expandedRoomIds.includes(room.id) ? "rotate-180" : ""
                                  }`}
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </button>
                            )}
                          </div>

                          <div className="mt-auto flex flex-col gap-4 border-t border-brand/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                              <div className="text-xs text-mist">
                                {language === "vi"
                                  ? "Giá từ"
                                  : "From"}
                              </div>

                              <div className="mt-1 text-xl font-bold text-brand">
                                {formatPrice(
                                  room.base_price,
                                  language
                                )}

                                {typeof room.base_price === "number" &&
                                  Number.isFinite(room.base_price) &&
                                  room.base_price > 0 && (
                                    <span className="ml-1 text-sm font-normal text-mist">
                                      VND{priceUnit}
                                    </span>
                                  )}
                              </div>
                            </div>

                            <Link
                              href={bookingUrl}
                              prefetch={false}
                              className="inline-flex min-w-[120px] items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-accent"
                            >
                              {language === "vi"
                                ? "Đặt phòng"
                                : "Book now"}
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {hasNearby && activeNearbyGroup && (
              <section
                id="nearby"
                className="mt-12 scroll-mt-24 border-t border-brand/10 pt-10"
              >
                <div className="mb-5">
                  <h2 className="text-2xl font-bold tracking-tight text-brand">
                    {language === "vi"
                      ? "Khám phá xung quanh"
                      : "Explore nearby"}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-mist">
                    {language === "vi"
                      ? `Những địa điểm gần ${hotelName}.`
                      : `Places near ${hotelName}.`}
                  </p>
                </div>

                <div className="mb-5 -mx-1 overflow-x-auto px-1 pb-1">
                  <div className="flex min-w-max gap-2">
                    {nearbyGroups.map(
                      ({ category }) => {
                        const isActive =
                          category.id ===
                          activeNearbyGroup.category.id;

                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              setActiveNearbyCategory(
                                category.id
                              );
                              setShowAllNearby(false);
                            }}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                              isActive
                                ? "border-slate-900 bg-brand-deep text-white"
                                : "border-brand/10 bg-white text-mist hover:border-brand/20 hover:bg-sage/50"
                            }`}
                          >
                            {category.icon && (
                              <span aria-hidden="true">
                                {category.icon}
                              </span>
                            )}

                            <span>
                              {language === "vi"
                                ? category.name_vi
                                : category.name_en ||
                                  category.name_vi}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {visibleNearbyPlaces.map(
                    (place) => {
                      const placeName =
                        language === "vi"
                          ? place.name_vi ||
                            place.name_en ||
                            ""
                          : place.name_en ||
                            place.name_vi ||
                            "";

                      const distance =
                        formatDistance(
                          place.distance_m,
                          language
                        );

                      return (
                        <article
                          key={place.id}
                          className="flex min-w-0 overflow-hidden rounded-xl border border-brand/10 bg-white transition hover:border-brand/20 hover:shadow-sm"
                        >
                          {place.image ? (
                            <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden bg-sage">
                              <Image
                                src={place.image}
                                alt={placeName}
                                fill
                                sizes="92px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-[92px] w-[92px] shrink-0 items-center justify-center bg-sage">
                              <MapPin className="h-5 w-5 text-slate-400" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1 p-3.5">
                            <div className="flex items-start gap-2">
                              <h3 className="min-w-0 flex-1 line-clamp-2 text-[15px] font-semibold leading-5 text-ink">
                                {placeName}
                              </h3>

                              {place.google_maps_url && (
                                <a
                                  href={
                                    place.google_maps_url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={
                                    language === "vi"
                                      ? `Chỉ đường đến ${placeName}`
                                      : `Directions to ${placeName}`
                                  }
                                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand/10 text-mist transition hover:border-brand/20 hover:bg-sage/50 hover:text-ink"
                                >
                                  <Navigation className="h-4 w-4" />
                                </a>
                              )}
                            </div>

                            {(distance ||
                              typeof place.walking_minutes ===
                                "number") && (
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mist">
                                {distance && (
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                    {distance}
                                  </span>
                                )}

                                {typeof place.walking_minutes ===
                                  "number" &&
                                  place.walking_minutes >=
                                    0 && (
                                    <span className="inline-flex items-center gap-1">
                                      <Clock3 className="h-3.5 w-3.5 shrink-0" />

                                      {language === "vi"
                                        ? `${place.walking_minutes} phút`
                                        : `${place.walking_minutes} min`}
                                    </span>
                                  )}
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>

                {activeNearbyGroup.places.length >
                  3 && (
                  <div className="mt-5 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setShowAllNearby(
                          (current) => !current
                        )
                      }
                      className="inline-flex items-center rounded-full border border-brand/20 px-5 py-2.5 text-sm font-semibold text-mist transition hover:bg-sage/50"
                    >
                      {showAllNearby
                        ? language === "vi"
                          ? "Thu gọn"
                          : "Show less"
                        : language === "vi"
                          ? `Xem thêm ${
                              activeNearbyGroup
                                .places.length - 3
                            } địa điểm`
                          : `Show ${
                              activeNearbyGroup
                                .places.length - 3
                            } more`}
                    </button>
                  </div>
                )}

                {mapUrl && (
                  <div className="mt-5 text-center">
                    <a
                      href="#hotel-map"
                      className="inline-flex items-center rounded-full border border-brand/20 px-5 py-2.5 text-sm font-semibold text-mist transition hover:bg-sage/50"
                    >
                      <MapPin className="mr-2 h-4 w-4" />

                      {language === "vi"
                        ? "Xem trên bản đồ"
                        : "View on map"}
                    </a>
                  </div>
                )}
              </section>
            )}

            {mapUrl && (
              <section
                id="hotel-map"
                className="mt-12 scroll-mt-24 border-t border-brand/10 pt-10"
              >
                <div className="mb-5">
                  <h2 className="text-2xl font-bold tracking-tight text-brand">
                    {language === "vi"
                      ? "Vị trí"
                      : "Location"}
                  </h2>

                  {hotelAddress && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-mist">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{hotelAddress}</span>
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-brand/10">
                  <iframe
                    src={mapUrl}
                    title={`${hotelName} map`}
                    className="h-[380px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </section>
            )}

            {initialFaqs.length > 0 && (
              <section
                className="mt-12 border-t border-brand/10 pt-10"
                aria-labelledby="hotel-faq-heading"
              >
                <h2
                  id="hotel-faq-heading"
                  className="mb-5 text-2xl font-bold tracking-tight text-brand"
                >
                  {language === "vi"
                    ? `Hỏi đáp về ${hotelName}`
                    : `FAQs about ${hotelName}`}
                </h2>

                <div className="divide-y divide-slate-200 rounded-2xl border border-brand/10 bg-white px-5">
                  {initialFaqs.map((faq) => (
                    <details
                      key={faq.id}
                      className="group py-4"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                        <span>
                          {language === "vi"
                            ? faq.question_vi
                            : faq.question_en ||
                              faq.question_vi}
                        </span>

                        <span
                          aria-hidden="true"
                          className="text-lg text-slate-400 transition group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>

                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-mist">
                        {language === "vi"
                          ? faq.answer_vi
                          : faq.answer_en ||
                            faq.answer_vi}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="order-last h-fit self-start lg:order-none lg:sticky lg:top-24 lg:h-fit lg:self-start">
            <HotelBookingSidebar
              hotel={{
                id: initialHotel.id,
                slug: initialHotel.slug,
                name_vi: initialHotel.name_vi,
                name_en: initialHotel.name_en,
              }}
              hotels={initialHotels}
            />
          </div>
        </div>
      </div>
      <BoltFinalCta hotelName={hotelName} locale={language} />
    </main>
  );
}
