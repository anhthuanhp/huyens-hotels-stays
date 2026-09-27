"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  Check,
  ChevronRight,
  MapPin,
  Maximize2,
  Users,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

type Language = "vi" | "en";

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string | null;
  address_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  map_url: string | null;
};

type Room = {
  id: number;
  hotel_id: number;
  slug: string;
  name_vi: string;
  name_en: string;
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
  status: string;
};

type RoomMedia = {
  entity_id: number;
  public_url: string;
};

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Thiếu biến môi trường Supabase: NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }

  return createClient(supabaseUrl, supabaseKey);
}

function extractMapUrl(value: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();

  /*
   * Nếu map_url đã là URL Google Maps Embed
   */
  if (
    trimmed.startsWith(
      "https://www.google.com/maps/embed"
    ) ||
    trimmed.startsWith("https://maps.google.com/maps")
  ) {
    return trimmed;
  }

  /*
   * Nếu map_url đang lưu nguyên thẻ iframe:
   * <iframe src="https://www.google.com/maps/embed?..."></iframe>
   *
   * Ta chỉ lấy phần src.
   */
  const srcMatch = trimmed.match(
    /<iframe[^>]+src=["']([^"']+)["']/i
  );

  if (srcMatch?.[1]) {
    return srcMatch[1];
  }

  /*
   * Trường hợp dữ liệu có HTML entity hoặc bị escape.
   */
  const htmlDecoded = trimmed
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, "&");

  const decodedMatch = htmlDecoded.match(
    /<iframe[^>]+src=["']([^"']+)["']/i
  );

  if (decodedMatch?.[1]) {
    return decodedMatch[1];
  }

  return null;
}

function parseAmenities(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (
          item &&
          typeof item === "object" &&
          "name" in item &&
          typeof item.name === "string"
        ) {
          return item.name;
        }

        return "";
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }

            if (
              item &&
              typeof item === "object" &&
              "name" in item &&
              typeof item.name === "string"
            ) {
              return item.name;
            }

            return "";
          })
          .filter(Boolean);
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [value];
  }

  return [];
}

export default function HotelDetailPage({
  initialHotel,
}: {
  initialHotel: Hotel;
}) {
  const params = useParams();
  const router = useRouter();

  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
        ? params.slug[0]
        : "";

  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "vi";
    }

    const savedLanguage =
      window.localStorage.getItem("language");

    return savedLanguage === "vi" ||
      savedLanguage === "en"
      ? savedLanguage
      : "vi";
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomCovers, setRoomCovers] = useState<
    Record<number, string>
  >({});
  const [error, setError] = useState("");

  useEffect(() => {
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

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadHotel() {
      try {
        setError("");

        const supabase = getSupabaseClient();

        const { data: roomData, error: roomError } =
          await supabase
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
            .eq("hotel_id", initialHotel.id)
            .eq("status", "active")
            .order("id", { ascending: true });

        if (roomError) {
          throw new Error(roomError.message);
        }

        const loadedRooms = (roomData || []) as Room[];

        const loadedRoomCovers: Record<number, string> =
          {};

        if (loadedRooms.length > 0) {
          const roomIds = loadedRooms.map(
            (room) => room.id
          );

          const {
            data: mediaData,
            error: mediaError,
          } = await supabase
            .from("media")
            .select("entity_id, public_url")
            .eq("entity_type", "room")
            .eq("is_cover", true)
            .eq("status", "active")
            .in("entity_id", roomIds);

          if (mediaError) {
            console.error(
              "⚠️ Lỗi lấy ảnh cover phòng:",
              mediaError
            );
          } else if (mediaData) {
            (mediaData as RoomMedia[]).forEach((item) => {
              if (
                item.entity_id &&
                item.public_url
              ) {
                loadedRoomCovers[item.entity_id] =
                  item.public_url;
              }
            });
          }
        }

        if (cancelled) return;

        setRooms(loadedRooms);
        setRoomCovers(loadedRoomCovers);
      } catch (err) {
        console.error(
          "❌ Lỗi trang chi tiết khách sạn:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải thông tin khách sạn."
          );
        }
      }
    }

    loadHotel();

    return () => {
      cancelled = true;
    };
  }, [slug, initialHotel.id]);

  const hotel = initialHotel;

  const hotelName = useMemo(() => {
    if (!hotel) return "";

    return language === "vi"
      ? hotel.name_vi
      : hotel.name_en;
  }, [hotel, language]);

  const hotelAddress = useMemo(() => {
    if (!hotel) return "";

    return language === "vi"
      ? hotel.address_vi
      : hotel.address_en;
  }, [hotel, language]);

  const hotelDescription = useMemo(() => {
    if (!hotel) return "";

    return language === "vi"
      ? hotel.description_vi
      : hotel.description_en;
  }, [hotel, language]);

  const mapUrl = useMemo(() => {
    return extractMapUrl(hotel?.map_url || null);
  }, [hotel]);

  const formatPrice = (price: number | null) => {
    if (
      price === null ||
      Number.isNaN(Number(price))
    ) {
      return language === "vi"
        ? "Liên hệ"
        : "Contact us";
    }

    return new Intl.NumberFormat(
      language === "vi" ? "vi-VN" : "en-US"
    ).format(Number(price));
  };

  const handleBooking = (room: Room) => {
    if (!hotel) return;

    const bookingParams = new URLSearchParams();

    bookingParams.set("hotel", hotel.slug);
    bookingParams.set("room", room.slug);

    router.push(
      `/tim-phong?${bookingParams.toString()}`
    );
  };

  if (error || !hotel) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">
            {language === "vi"
              ? "Không tìm thấy khách sạn"
              : "Hotel not found"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            {error ||
              (language === "vi"
                ? "Khách sạn không tồn tại hoặc đã ngừng hoạt động."
                : "The hotel does not exist or is no longer active.")}
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            <ArrowLeft size={17} />
            {language === "vi"
              ? "Quay lại"
              : "Go back"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* HEADER */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-sky-900"
          >
            Huyen&apos;s Hotels &amp; Stays
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-sky-700"
          >
            <ArrowLeft size={16} />
            {language === "vi"
              ? "Quay lại"
              : "Back"}
          </button>
        </div>
      </header>

      {/* HOTEL INFORMATION */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight text-sky-950 md:text-4xl">
              {hotelName}
            </h1>

            {hotelAddress && (
              <div className="mt-4 flex items-start gap-2 text-sm text-neutral-600">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-sky-600"
                />

                <span>{hotelAddress}</span>
              </div>
            )}

            {hotelDescription && (
              <p className="mt-5 text-base leading-7 text-neutral-600">
                {hotelDescription}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ROOMS */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">
                {language === "vi"
                  ? "Các loại phòng"
                  : "Available rooms"}
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                {language === "vi"
                  ? "Lựa chọn phòng phù hợp với nhu cầu lưu trú của bạn."
                  : "Choose the room that best suits your stay."}
              </p>
            </div>

            {rooms.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm text-neutral-500">
                  {language === "vi"
                    ? "Hiện chưa có phòng đang được mở bán."
                    : "There are currently no available rooms."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {rooms.map((room) => {
                  const roomImage =
                    roomCovers[room.id] ||
                    room.image;

                  const roomName =
                    language === "vi"
                      ? room.name_vi
                      : room.name_en;

                  const roomDescription =
                    language === "vi"
                      ? room.description_vi
                      : room.description_en;

                  const beds =
                    language === "vi"
                      ? room.beds_vi
                      : room.beds_en;

                  const amenities =
                    language === "vi"
                      ? parseAmenities(
                          room.amenities_vi
                        )
                      : parseAmenities(
                          room.amenities_en
                        );

                  return (
                    <article
                      key={room.id}
                      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
                        {/* ROOM COVER */}
                        <div className="relative h-56 overflow-hidden bg-neutral-100 md:h-full md:min-h-[280px]">
                          {roomImage ? (
                            <Image
                              src={roomImage}
                              alt={roomName}
                              fill
                              unoptimized
                              sizes="(max-width: 768px) 100vw, 260px"
                              className="object-cover transition duration-500 hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                              {language === "vi"
                                ? "Chưa có hình ảnh"
                                : "No image"}
                            </div>
                          )}
                        </div>

                        {/* ROOM INFORMATION */}
                        <div className="flex flex-col p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-semibold text-neutral-900">
                                {roomName}
                              </h3>

                              {roomDescription && (
                                <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-500">
                                  {roomDescription}
                                </p>
                              )}
                            </div>

                            <Link
                              href={`/khach-san/${hotel.slug}/phong/${room.slug}`}
                              className="shrink-0 rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-sky-700"
                              aria-label={
                                language === "vi"
                                  ? "Xem chi tiết phòng"
                                  : "View room details"
                              }
                            >
                              <ChevronRight size={20} />
                            </Link>
                          </div>

                          {/* ROOM META */}
                          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-neutral-600">
                            {room.size !== null && (
                              <div className="flex items-center gap-2">
                                <Maximize2
                                  size={16}
                                  className="text-sky-600"
                                />
                                <span>
                                  {room.size} m²
                                </span>
                              </div>
                            )}

                            {room.max_guests !== null && (
                              <div className="flex items-center gap-2">
                                <Users
                                  size={16}
                                  className="text-sky-600"
                                />
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
                                <BedDouble
                                  size={16}
                                  className="text-sky-600"
                                />
                                <span>{beds}</span>
                              </div>
                            )}
                          </div>

                          {/* AMENITIES */}
                          {amenities.length > 0 && (
                            <div className="mt-5">
                              <div className="flex flex-wrap gap-x-5 gap-y-2">
                                {amenities.map(
                                  (
                                    amenity,
                                    index
                                  ) => (
                                    <div
                                      key={`${room.id}-${index}`}
                                      className="flex items-center gap-2 text-sm text-neutral-600"
                                    >
                                      <Check
                                        size={15}
                                        className="text-sky-600"
                                      />
                                      <span>
                                        {amenity}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* PRICE + BOOK */}
                          <div className="mt-auto flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                              <div className="text-xs text-neutral-500">
                                {language === "vi"
                                  ? "Giá từ"
                                  : "From"}
                              </div>

                              <div className="mt-1 text-xl font-bold text-sky-700">
                                {formatPrice(
                                  room.base_price
                                )}{" "}
                                <span className="text-sm font-medium">
                                  VND
                                </span>
                              </div>

                              <div className="mt-1 text-xs text-neutral-400">
                                {language === "vi"
                                  ? "mỗi đêm"
                                  : "per night"}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleBooking(room)
                              }
                              className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 active:scale-[0.99]"
                            >
                              {language === "vi"
                                ? "Đặt phòng"
                                : "Book now"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* BOOKING CARD */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-neutral-900">
                {language === "vi"
                  ? "Đặt phòng"
                  : "Book your stay"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                {language === "vi"
                  ? "Chọn loại phòng bên trái để bắt đầu đặt phòng."
                  : "Choose a room on the left to start your booking."}
              </p>

              <div className="mt-6 rounded-xl bg-neutral-50 p-4">
                <div className="flex items-start gap-3">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-sky-600"
                  />

                  <div>
                    <div className="text-sm font-semibold text-neutral-900">
                      {hotelName}
                    </div>

                    {hotelAddress && (
                      <div className="mt-1 text-sm leading-5 text-neutral-500">
                        {hotelAddress}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {rooms.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const firstRoom = rooms[0];

                    const bookingParams =
                      new URLSearchParams();

                    bookingParams.set(
                      "hotel",
                      hotel.slug
                    );

                    bookingParams.set(
                      "room",
                      firstRoom.slug
                    );

                    router.push(
                      `/tim-phong?${bookingParams.toString()}`
                    );
                  }}
                  className="mt-6 w-full rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  {language === "vi"
                    ? "Tìm phòng"
                    : "Find a room"}
                </button>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* GOOGLE MAP */}
      {mapUrl && (
        <section className="border-t border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">
                {language === "vi"
                  ? "Vị trí"
                  : "Location"}
              </h2>

              {hotelAddress && (
                <div className="mt-2 flex items-start gap-2 text-sm text-neutral-500">
                  <MapPin
                    size={17}
                    className="mt-0.5 shrink-0 text-sky-600"
                  />
                  <span>{hotelAddress}</span>
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <iframe
                src={mapUrl}
                title={`${hotelName} Google Maps`}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="h-[420px] w-full border-0"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-3 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
            <div>
              © {new Date().getFullYear()} Huyen&apos;s
              Hotels &amp; Stays
            </div>

            <Link
              href="/"
              className="font-medium text-sky-700 transition hover:text-sky-900"
            >
              {language === "vi"
                ? "Về trang chủ"
                : "Back to home"}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}