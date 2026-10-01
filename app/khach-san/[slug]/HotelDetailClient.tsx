"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  Check,
  MapPin,
  Maximize2,
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

type Props = {
  initialHotel: Hotel;
  initialRooms: Room[];
  initialRoomCovers: RoomMedia[];
  initialHotels: HotelListItem[];
  initialFaqs: HotelFaq[];
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
        return parsed.trim()
          ? [parsed.trim()]
          : [];
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
    return language === "vi"
      ? "Liên hệ"
      : "Contact";
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
    return language === "vi"
      ? "/tháng"
      : "/month";
  }

  return language === "vi"
    ? "/ngày"
    : "/day";
}

export default function HotelDetailClient({
  initialHotel,
  initialRooms,
  initialRoomCovers,
  initialHotels,
  initialFaqs,
}: Props) {
  const router = useRouter();

  const [language, setLanguage] =
    useState<Language>("vi");

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

  const mapUrl = extractMapUrl(
    initialHotel.map_url
  );

  const priceUnit = getPriceUnit(
    initialHotel.business_model,
    language
  );

  const handleBooking = (room: Room) => {
    const params = new URLSearchParams();

    params.set(
      "hotel",
      initialHotel.slug
    );

    params.set("room", room.slug);

    const stayType =
      initialHotel.business_model?.trim().toLowerCase() ===
      "monthly"
        ? "month"
        : "day";

    params.set("stayType", stayType);

    if (stayType === "month") {
      params.set("months", "1");
    }

    router.push(
      `/tim-phong?${params.toString()}`
    );
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <section>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {hotelName}
              </h1>

              {hotelAddress && (
                <div className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

                  <span>
                    {hotelAddress}
                  </span>
                </div>
              )}

              {hotelDescription && (
                <div className="mt-5 whitespace-pre-line text-[15px] leading-7 text-slate-600">
                  {hotelDescription}
                </div>
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

                    /*
                     * Ảnh đại diện phòng:
                     * Chỉ lấy Cover từ /admin/hinh-anh.
                     * Không sử dụng rooms.image.
                     */
                    const roomImage =
                      roomCovers[room.id] || null;

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

                                <span>
                                  {beds}
                                </span>
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
                                    room.base_price >
                                      0 &&
                                    priceUnit}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleBooking(room)
                              }
                              className="inline-flex min-w-[120px] items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                            >
                              {language === "vi"
                                ? "Đặt phòng"
                                : "Book now"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {mapUrl && (
              <section className="mt-12 border-t border-slate-200 pt-10">
                <div className="mb-5">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    {language === "vi"
                      ? "Vị trí"
                      : "Location"}
                  </h2>

                  {hotelAddress && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                      <span>
                        {hotelAddress}
                      </span>
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
              © {new Date().getFullYear()}{" "}
              Huyen&apos;s Hotels &amp; Stays
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}