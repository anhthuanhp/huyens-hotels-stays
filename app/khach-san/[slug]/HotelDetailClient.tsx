
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
    vi: "Khách sạn tại khu vực Cô Bắc, thuận tiện di chuyển đến Bùi Viện, Bến Thành và các điểm tham quan ở trung tâm TP.HCM.",
    en: "A hotel in the Co Bac area, conveniently located for Bui Vien, Ben Thanh and central Ho Chi Minh City attractions.",
  },

  "ae-guesthouse": {
    vi: "Guesthouse gần Bùi Viện và Phạm Ngũ Lão, thuận tiện đến Bến Thành và các điểm tham quan ở trung tâm TP.HCM.",
    en: "A guesthouse near Bui Vien and Pham Ngu Lao, convenient for Ben Thanh and central Ho Chi Minh City attractions.",
  },

  "huyen-house": {
    vi: "Lưu trú tại khu vực Nguyễn Thị Minh Khai, thuận tiện di chuyển đến Bến Thành, Đại sứ quán Mỹ và các điểm trung tâm TP.HCM.",
    en: "Stay in the Nguyen Thi Minh Khai area, conveniently located near Ben Thanh, the US Consulate and central Ho Chi Minh City.",
  },

  huyenhomestay: {
    vi: "Homestay tại khu vực Nguyễn Thị Minh Khai, thuận tiện di chuyển đến Bến Thành, Đại sứ quán Mỹ và trung tâm TP.HCM.",
    en: "A homestay in the Nguyen Thi Minh Khai area, conveniently located near Ben Thanh, the US Consulate and central Ho Chi Minh City.",
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
    vi: "Anh Kim Hotel – Gần Bùi Viện và Bến Thành",
    en: "Anh Kim Hotel – Near Bui Vien and Ben Thanh",
  },

  "ae-guesthouse": {
    vi: "A&E Guesthouse – Gần Bùi Viện, Phạm Ngũ Lão và Bến Thành",
    en: "A&E Guesthouse – Near Bui Vien, Pham Ngu Lao and Ben Thanh",
  },

  "huyen-house": {
    vi: "Huyen House – Gần Nguyễn Thị Minh Khai, Bến Thành và Đại sứ quán Mỹ",
    en: "Huyen House – Near Nguyen Thi Minh Khai, Ben Thanh and the US Consulate",
  },

  huyenhomestay: {
    vi: "Huyen Homestay – Gần Nguyễn Thị Minh Khai, Bến Thành và Đại sứ quán Mỹ",
    en: "Huyen Homestay – Near Nguyen Thi Minh Khai, Ben Thanh and the US Consulate",
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

  return language === "vi" ? "/ngày" : "/day";
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
  const [language, setLanguage] =
    useState<Language>("vi");

  const [activeNearbyCategory, setActiveNearbyCategory] =
    useState<number | null>(null);

  const [showAllNearby, setShowAllNearby] =
    useState(false);

  useEffect(() => {
    const savedLanguage =
      window.localStorage.getItem("language");

    if (
      savedLanguage === "vi" ||
      savedLanguage === "en"
    ) {
      setLanguage(savedLanguage);
    }

    const handleLanguageChange = () => {
      const currentLanguage =
        window.localStorage.getItem("language");

      if (
        currentLanguage === "vi" ||
        currentLanguage === "en"
      ) {
        setLanguage(currentLanguage);
      }
    };

    window.addEventListener(
      "language-change",
      handleLanguageChange
    );

    return () => {
      window.removeEventListener(
        "language-change",
        handleLanguageChange
      );
    };
  }, []);

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

  useEffect(() => {
    if (
      activeNearbyCategory === null &&
      nearbyGroups.length > 0
    ) {
      setActiveNearbyCategory(
        nearbyGroups[0].category.id
      );
    }
  }, [activeNearbyCategory, nearbyGroups]);

  useEffect(() => {
    setShowAllNearby(false);
  }, [activeNearbyCategory]);

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
    seoH1?.[language] || hotelName;

  const displayLocalDescription =
    localSeoContent?.[language] || "";

  const mapUrl = extractMapUrl(
    initialHotel.map_url
  );

  const priceUnit = getPriceUnit(
    initialHotel.business_model,
    language
  );

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <section>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {displayH1}
              </h1>

              {hotelAddress && (
                <div className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                  <span>{hotelAddress}</span>
                </div>
              )}

              {hotelDescription && (
                <div className="mt-5 whitespace-pre-line text-[15px] leading-7 text-slate-600">
                  {hotelDescription}
                </div>
              )}

              {displayLocalDescription && (
                <p className="mt-3 text-[15px] leading-7 text-slate-600">
                  {displayLocalDescription}
                </p>
              )}
            </section>

            <section
              id="rooms"
              className="mt-10 scroll-mt-24"
            >
              <div className="mb-5">
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                  {language === "vi"
                    ? "Các loại phòng"
                    : "Room types"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {language === "vi"
                    ? "Lựa chọn phòng phù hợp với nhu cầu lưu trú của bạn."
                    : "Choose a room that suits your stay."}
                </p>
              </div>

              {activeRooms.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
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
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                          {roomImage ? (
                            <Image
                              src={roomImage}
                              alt={roomName}
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

                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-xl font-bold text-slate-950">
                              {roomName}
                            </h3>

                            <Link
                              href={`/khach-san/${initialHotel.slug}/phong/${room.slug}`}
                              className="shrink-0 text-sm font-medium text-slate-600 transition hover:text-slate-950"
                            >
                              {language === "vi"
                                ? "Chi tiết"
                                : "Details"}
                            </Link>
                          </div>

                          {roomDescription && (
                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                              {roomDescription}
                            </p>
                          )}

                          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-slate-600">
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

                          {amenities.length > 0 && (
                            <div className="mt-4 border-t border-slate-100 pt-4">
                              <div className="mb-2 text-sm font-semibold text-slate-800">
                                {language === "vi"
                                  ? "Tiện nghi"
                                  : "Amenities"}
                              </div>

                              <div className="grid gap-2 sm:grid-cols-2">
                                {amenities.map(
                                  (
                                    amenity,
                                    index
                                  ) => (
                                    <div
                                      key={`${room.id}-${index}`}
                                      className="flex items-start gap-2 text-sm text-slate-600"
                                    >
                                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                                      <span>
                                        {amenity}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                              <div className="text-xs text-slate-500">
                                {language === "vi"
                                  ? "Giá từ"
                                  : "From"}
                              </div>

                              <div className="mt-1 text-xl font-bold text-slate-950">
                                {formatPrice(
                                  room.base_price,
                                  language
                                )}

                                <span className="ml-1 text-sm font-normal text-slate-500">
                                  VND
                                  {room.base_price &&
                                    room.base_price > 0 &&
                                    priceUnit}
                                </span>
                              </div>
                            </div>

                            <Link
                              href={bookingUrl}
                              prefetch={true}
                              className="inline-flex min-w-[120px] items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
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
                className="mt-12 scroll-mt-24 border-t border-slate-200 pt-10"
              >
                <div className="mb-5">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    {language === "vi"
                      ? "Khám phá xung quanh"
                      : "Explore nearby"}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
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
                            }}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                              isActive
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
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
                          className="flex min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                        >
                          {place.image ? (
                            <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden bg-slate-100">
                              <Image
                                src={place.image}
                                alt={placeName}
                                fill
                                sizes="92px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-[92px] w-[92px] shrink-0 items-center justify-center bg-slate-100">
                              <MapPin className="h-5 w-5 text-slate-400" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1 p-3.5">
                            <div className="flex items-start gap-2">
                              <h3 className="min-w-0 flex-1 line-clamp-2 text-[15px] font-semibold leading-5 text-slate-900">
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
                                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                >
                                  <Navigation className="h-4 w-4" />
                                </a>
                              )}
                            </div>

                            {(distance ||
                              typeof place.walking_minutes ===
                                "number") && (
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
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
                      className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
                      className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
                className="mt-12 scroll-mt-24 border-t border-slate-200 pt-10"
              >
                <div className="mb-5">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    {language === "vi"
                      ? "Vị trí"
                      : "Location"}
                  </h2>

                  {hotelAddress && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{hotelAddress}</span>
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
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
                className="mt-12 border-t border-slate-200 pt-10"
                aria-labelledby="hotel-faq-heading"
              >
                <h2
                  id="hotel-faq-heading"
                  className="mb-5 text-2xl font-bold tracking-tight text-slate-950"
                >
                  {language === "vi"
                    ? `Hỏi đáp về ${hotelName}`
                    : `FAQs about ${hotelName}`}
                </h2>

                <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5">
                  {initialFaqs.map((faq) => (
                    <details
                      key={faq.id}
                      className="group py-4"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-800">
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

                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
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

      <footer className="mt-16 border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-semibold text-slate-800">
                HUYEN&apos;S
              </span>{" "}
              Hotels &amp; Stays
            </div>

            <div>
              © {new Date().getFullYear()} Huyen&apos;s
              Hotels &amp; Stays
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
