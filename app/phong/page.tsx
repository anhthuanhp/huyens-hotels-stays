"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Language = "vi" | "en";
type BusinessModel = "daily" | "monthly";

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string | null;
  address_en: string | null;
  business_model: BusinessModel;
  status: "active" | "inactive";
};

type Room = {
  id: number;
  hotel_id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  description_vi: string | null;
  description_en: string | null;
  base_price: number | null;
  size: number | null;
  max_guests: number | null;
  beds_vi: string | null;
  beds_en: string | null;
  amenities: unknown;
  quantity: number | null;
  status: "active" | "inactive";
};

type RoomMedia = {
  entity_id: number;
  public_url: string;
  is_cover: boolean;
  sort_order: number;
  status: "active" | "inactive";
};

type RoomWithHotel = {
  room: Room;
  hotel: Hotel;
};

export default function RoomsPage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "vi";
    }

    const savedLanguage = localStorage.getItem("huyen-language");

    return savedLanguage === "vi" || savedLanguage === "en"
      ? savedLanguage
      : "vi";
  });

  const [rooms, setRooms] = useState<RoomWithHotel[]>([]);
  const [roomCovers, setRoomCovers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<Language>;

      if (
        customEvent.detail === "vi" ||
        customEvent.detail === "en"
      ) {
        setLanguage(customEvent.detail);
      }
    };

    window.addEventListener("language-change", handleLanguageChange);

    return () => {
      window.removeEventListener(
        "language-change",
        handleLanguageChange
      );
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadRooms = async () => {
      setLoading(true);

      try {
        const { data: hotelData, error: hotelError } =
          await supabase
            .from("hotels")
            .select(
              "id, slug, name_vi, name_en, address_vi, address_en, business_model, status"
            )
            .eq("status", "active")
            .order("created_at", { ascending: true });

        if (hotelError) {
          console.error("Load hotels error:", hotelError);

          if (!cancelled) {
            setRooms([]);
            setRoomCovers({});
          }

          return;
        }

        const hotels = (hotelData ?? []).map((hotel) => ({
          ...(hotel as Hotel),
          business_model:
            hotel.business_model === "monthly"
              ? "monthly"
              : "daily",
        })) as Hotel[];

        if (hotels.length === 0) {
          if (!cancelled) {
            setRooms([]);
            setRoomCovers({});
          }

          return;
        }

        const hotelIds = hotels.map((hotel) => hotel.id);

        const { data: roomData, error: roomError } =
          await supabase
            .from("rooms")
            .select(
              "id, hotel_id, slug, name_vi, name_en, description_vi, description_en, base_price, size, max_guests, beds_vi, beds_en, amenities, quantity, status"
            )
            .in("hotel_id", hotelIds)
            .eq("status", "active")
            .order("hotel_id", { ascending: true })
            .order("id", { ascending: true });

        if (roomError) {
          console.error("Load rooms error:", roomError);

          if (!cancelled) {
            setRooms([]);
            setRoomCovers({});
          }

          return;
        }

        const activeRooms = (roomData ?? []) as Room[];

        const hotelMap: Record<number, Hotel> = {};

        for (const hotel of hotels) {
          hotelMap[hotel.id] = hotel;
        }

        const combinedRooms: RoomWithHotel[] = activeRooms
          .map((room) => {
            const hotel = hotelMap[room.hotel_id];

            if (!hotel) {
              return null;
            }

            return {
              room,
              hotel,
            };
          })
          .filter(
            (item): item is RoomWithHotel => item !== null
          );

        const roomIds = activeRooms.map((room) => room.id);

        const coverMap: Record<number, string> = {};

        if (roomIds.length > 0) {
          const { data: mediaData, error: mediaError } =
            await supabase
              .from("media")
              .select(
                "entity_id, public_url, is_cover, sort_order, status"
              )
              .eq("entity_type", "room")
              .in("entity_id", roomIds)
              .eq("status", "active")
              .order("is_cover", { ascending: false })
              .order("sort_order", { ascending: true });

          if (mediaError) {
            console.error(
              "Load room media error:",
              mediaError
            );
          } else {
            const media = (mediaData ?? []) as RoomMedia[];

            for (const item of media) {
              if (!coverMap[item.entity_id]) {
                coverMap[item.entity_id] = item.public_url;
              }
            }
          }
        }

        if (!cancelled) {
          setRooms(combinedRooms);
          setRoomCovers(coverMap);
        }
      } catch (error) {
        console.error("Load rooms error:", error);

        if (!cancelled) {
          setRooms([]);
          setRoomCovers({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRooms();

    return () => {
      cancelled = true;
    };
  }, []);

  const getAmenities = (amenities: unknown): string[] => {
    if (Array.isArray(amenities)) {
      return amenities
        .filter((item) => typeof item === "string")
        .map((item) => String(item));
    }

    if (typeof amenities === "string") {
      try {
        const parsed = JSON.parse(amenities);

        if (Array.isArray(parsed)) {
          return parsed
            .filter((item) => typeof item === "string")
            .map((item) => String(item));
        }
      } catch {
        return [];
      }
    }

    return [];
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) {
      return language === "vi" ? "Liên hệ" : "Contact";
    }

    return `${new Intl.NumberFormat("vi-VN").format(price)} ₫`;
  };

  const getPriceUnit = (businessModel: BusinessModel) => {
    if (businessModel === "monthly") {
      return language === "vi" ? "tháng" : "month";
    }

    return language === "vi" ? "đêm" : "night";
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* BACK TO MAIN */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center px-6 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-sky-600"
          >
            <span aria-hidden="true">←</span>

            <span>
              {language === "vi"
                ? "Quay về trang chính"
                : "Back to Main"}
            </span>
          </Link>
        </div>
      </div>

      {/* PAGE BANNER */}
      <section className="relative mx-auto h-[220px] max-w-[1200px] overflow-hidden bg-[#eaf3f6]">
        <div className="relative z-10 flex h-full w-full items-center px-6 lg:px-10">
          <div className="text-slate-900">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">
              Huyen&apos;s Hotels &amp; Stays
            </p>

            <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
              {language === "vi"
                ? "Những căn phòng dành cho hành trình của bạn."
                : "Rooms designed for your journey."}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
              {language === "vi"
                ? "Khám phá các loại phòng đang được cung cấp tại hệ thống Huyen's Hotels & Stays."
                : "Explore the room types available across Huyen's Hotels & Stays."}
            </p>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-[1200px] px-6 py-16 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            {language === "vi" ? "CÁC LOẠI PHÒNG" : "ROOM TYPES"}
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {language === "vi"
              ? "Chọn không gian phù hợp với bạn."
              : "Choose the space that suits you."}
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600">
            {language === "vi"
              ? "Khám phá các loại phòng tại từng khách sạn, guesthouse và homestay trong hệ thống Huyen's."
              : "Explore the room types available across every hotel, guesthouse and homestay in Huyen's collection."}
          </p>
        </div>
      </section>

      {/* ROOM LIST */}
      <section className="mx-auto max-w-[1200px] px-6 pb-24 lg:px-10">
        {loading && (
          <div className="grid gap-8 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="h-[280px] animate-pulse bg-slate-200" />

                <div className="space-y-4 p-6">
                  <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />

                  <div className="h-7 w-2/3 animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && rooms.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center">
            <p className="text-base text-slate-500">
              {language === "vi"
                ? "Hiện chưa có phòng nào đang được cung cấp."
                : "There are currently no active rooms available."}
            </p>
          </div>
        )}

        {!loading && rooms.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2">
            {rooms.map(({ room, hotel }) => {
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

              const hotelName =
                language === "vi"
                  ? hotel.name_vi
                  : hotel.name_en;

              const hotelAddress =
                language === "vi"
                  ? hotel.address_vi
                  : hotel.address_en;

              const amenities = getAmenities(room.amenities);

              const roomImage =
                roomCovers[room.id] ||
                "/images/hero/hero-2.jpg";

              const roomUrl =
                `/khach-san/${hotel.slug}/phong/${room.slug}`;

              const priceUnit = getPriceUnit(
                hotel.business_model
              );

              return (
                <article
                  key={room.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <Link
                    href={roomUrl}
                    className="group block"
                  >
                    <div className="relative h-[280px] overflow-hidden bg-slate-200">
                      <Image
                        src={roomImage}
                        alt={roomName}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
                        {hotelName}
                      </div>
                    </div>
                  </Link>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-[0.15em] text-sky-600">
                          {hotelName}
                        </p>

                        <Link
                          href={roomUrl}
                          className="mt-1 block text-2xl font-semibold text-slate-900 transition hover:text-sky-600"
                        >
                          {roomName}
                        </Link>

                        {hotelAddress && (
                          <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-500">
                            <span aria-hidden="true">
                              📍
                            </span>

                            <span>{hotelAddress}</span>
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs text-slate-500">
                          {language === "vi"
                            ? "Từ"
                            : "From"}
                        </p>

                        <p className="text-lg font-bold text-slate-900">
                          {formatPrice(room.base_price)}
                        </p>

                        {room.base_price !== null && (
                          <p className="text-xs text-slate-500">
                            / {priceUnit}
                          </p>
                        )}
                      </div>
                    </div>

                    {roomDescription && (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                        {roomDescription}
                      </p>
                    )}

                    <div className="mt-5 grid grid-cols-3 gap-3 border-y border-slate-100 py-4">
                      <div>
                        <p className="text-xs text-slate-500">
                          {language === "vi"
                            ? "Diện tích"
                            : "Size"}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {room.size !== null
                            ? `${room.size} m²`
                            : "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          {language === "vi"
                            ? "Khách"
                            : "Guests"}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {room.max_guests !== null
                            ? room.max_guests
                            : "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          {language === "vi"
                            ? "Giường"
                            : "Bed"}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {beds || "—"}
                        </p>
                      </div>
                    </div>

                    {amenities.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {amenities
                          .slice(0, 4)
                          .map((amenity, index) => (
                            <span
                              key={`${room.id}-${index}-${amenity}`}
                              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600"
                            >
                              {amenity}
                            </span>
                          ))}
                      </div>
                    )}

                    {room.quantity !== null &&
                      room.quantity > 0 && (
                        <p className="mt-4 text-xs text-slate-400">
                          {language === "vi"
                            ? `Có ${room.quantity} phòng`
                            : `${room.quantity} rooms available`}
                        </p>
                      )}

                    <Link
                      href={roomUrl}
                      className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                    >
                      {language === "vi"
                        ? "XEM CHI TIẾT PHÒNG"
                        : "VIEW ROOM DETAILS"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-[1200px] px-6 py-16 text-center lg:px-10">
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            {language === "vi"
              ? "Đã tìm thấy không gian phù hợp?"
              : "Found the right space?"}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            {language === "vi"
              ? "Tìm ngay nơi lưu trú và kiểm tra phòng phù hợp với hành trình của bạn."
              : "Choose your dates and check the rooms available for your stay."}
          </p>

          <Link
            href="/tim-phong"
            className="mt-7 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            {language === "vi"
              ? "TÌM PHÒNG"
              : "FIND A ROOM"}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white">
        <div className="mx-auto max-w-[1200px] px-6 py-12 lg:px-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <div>
              <Link
                href="/"
                className="text-lg font-semibold tracking-wide"
              >
                Huyen&apos;s Hotels &amp; Stays
              </Link>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                {language === "vi"
                  ? "Lưu trú theo cách của riêng bạn."
                  : "Stay your own way."}
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <Link
                href="/"
                className="transition hover:text-white"
              >
                {language === "vi"
                  ? "Trang chủ"
                  : "Home"}
              </Link>

              <Link
                href="/kham-pha-huyens"
                className="transition hover:text-white"
              >
                {language === "vi"
                  ? "Khách sạn"
                  : "Hotels"}
              </Link>

              <Link
                href="/phong"
                className="transition hover:text-white"
              >
                {language === "vi"
                  ? "Phòng"
                  : "Rooms"}
              </Link>

              <Link
                href="/tim-phong"
                className="transition hover:text-white"
              >
                {language === "vi"
                  ? "Đặt phòng"
                  : "Book"}
              </Link>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} Huyen&apos;s Hotels &amp; Stays
          </div>
        </div>
      </footer>
    </main>
  );
}