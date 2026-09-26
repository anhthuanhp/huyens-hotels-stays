
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  Check,
  ChevronRight,
  MapPin,
  Maximize2,
  Minus,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";

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
  image: string | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
  google_business_url: string | null;
  [key: string]: unknown;
};

type Room = {
  id: number;
  hotel_id: number;
  slug?: string | null;
  name_vi: string | null;
  name_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  image: string | null;
  base_price?: number | string | null;
  price?: number | string | null;
  size?: number | string | null;
  area?: number | string | null;
  max_guests?: number | null;
  guests?: number | null;
  max_adults?: number | null;
  max_children?: number | null;
  beds_vi?: string | null;
  beds_en?: string | null;
  bed_type_vi?: string | null;
  bed_type_en?: string | null;
  amenities_vi?: unknown;
  amenities_en?: unknown;
  status: string | null;
  [key: string]: unknown;
};

type RoomMedia = {
  id: number;
  entity_id: number;
  public_url: string | null;
  is_cover: boolean | null;
  sort_order: number | null;
};

type HotelOTAChannel = {
  id: number;
  hotel_id: number;
  ota_id: number;
  listing_url: string | null;
  external_hotel_id: string | null;
  status: string | null;
  sort_order: number | null;
};

type OTAPlatform = {
  id: number;
  name: string | null;
  slug: string | null;
  logo: string | null;
  website: string | null;
  status: string | null;
  sort_order: number | null;
};

type ActiveOTA = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  listing_url: string;
  sort_order: number;
};

function GoogleIcon() {
  return (
    <div
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[25px] font-bold shadow-sm"
    >
      <span className="text-[#4285F4]">G</span>
    </div>
  );
}

function parseAmenities(
  value: unknown,
  language: Language
): string[] {
  if (value == null) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (
          item &&
          typeof item === "object"
        ) {
          const obj =
            item as Record<
              string,
              unknown
            >;

          const selected =
            language === "vi"
              ? obj.name_vi ??
                obj.vi ??
                obj.name
              : obj.name_en ??
                obj.en ??
                obj.name;

          return typeof selected ===
            "string"
            ? selected
            : "";
        }

        return "";
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(
        trimmed
      );

      if (Array.isArray(parsed)) {
        return parseAmenities(
          parsed,
          language
        );
      }

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        const obj =
          parsed as Record<
            string,
            unknown
          >;

        const selected =
          language === "vi"
            ? obj.name_vi ??
              obj.vi ??
              obj.name
            : obj.name_en ??
              obj.en ??
              obj.name;

        if (
          typeof selected ===
          "string"
        ) {
          return [selected];
        }
      }
    } catch {}

    return trimmed
      .split(/[,;\n|]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (
    typeof value === "object"
  ) {
    const obj =
      value as Record<
        string,
        unknown
      >;

    const selected =
      language === "vi"
        ? obj.name_vi ??
          obj.vi ??
          obj.name
        : obj.name_en ??
          obj.en ??
          obj.name;

    return typeof selected ===
      "string" &&
      selected.trim()
      ? [selected.trim()]
      : [];
  }

  return [];
}

function getRoomPrice(
  room: Room
): number | null {
  const value =
    room.base_price ??
    room.price ??
    null;

  if (
    value == null ||
    value === ""
  ) {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : null;
}

/**
 * Tìm đơn vị giá trong dữ liệu Supabase.
 * Hỗ trợ các tên cột thường gặp.
 */
function getPriceUnit(
  room: Room,
  language: Language
): string {
  const possibleKeys = [
    "price_unit",
    "pricing_unit",
    "rate_unit",
    "unit",
    "price_type",
    "pricing_type",
    "rate_type",
    "price_period",
    "pricing_period",
    "billing_unit",
  ];

  let value: unknown = null;

  for (const key of possibleKeys) {
    if (
      room[key] !== undefined &&
      room[key] !== null &&
      room[key] !== ""
    ) {
      value = room[key];
      break;
    }
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const obj =
      value as Record<
        string,
        unknown
      >;

    value =
      language === "vi"
        ? obj.name_vi ??
          obj.vi ??
          obj.name ??
          obj.value
        : obj.name_en ??
          obj.en ??
          obj.name ??
          obj.value;
  }

  const normalized =
    String(value ?? "")
      .trim()
      .toLowerCase();

  if (
    normalized.includes("day") ||
    normalized.includes("ngày") ||
    normalized === "daily"
  ) {
    return language === "vi"
      ? "ngày"
      : "day";
  }

  if (
    normalized.includes("night") ||
    normalized.includes("đêm") ||
    normalized === "nightly"
  ) {
    return language === "vi"
      ? "đêm"
      : "night";
  }

  /*
   * Nếu database dùng giá theo đêm
   * nhưng chưa có giá trị đơn vị,
   * giữ mặc định theo thông lệ phòng khách sạn.
   */
  return language === "vi"
    ? "đêm"
    : "night";
}

function getRoomSize(
  room: Room
): string {
  const value =
    room.size ??
    room.area ??
    null;

  if (
    value == null ||
    value === ""
  ) {
    return "";
  }

  return String(value);
}

function getRoomGuests(
  room: Room
): number | null {
  const value =
    room.max_guests ??
    room.guests ??
    room.max_adults ??
    null;

  if (value == null) {
    return null;
  }

  const numberValue =
    Number(value);

  return Number.isFinite(
    numberValue
  )
    ? numberValue
    : null;
}

function getRoomBed(
  room: Room,
  language: Language
): string {
  if (language === "vi") {
    return (
      room.beds_vi ??
      room.bed_type_vi ??
      ""
    );
  }

  return (
    room.beds_en ??
    room.bed_type_en ??
    ""
  );
}

function formatPrice(
  value: number | null
): string {
  if (value == null) return "";

  return new Intl.NumberFormat(
    "vi-VN"
  ).format(value);
}

function formatDate(
  value: string,
  language: Language
) {
  if (!value) return "";

  const date = new Date(
    value + "T00:00:00"
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    language === "vi"
      ? "vi-VN"
      : "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}

export default function HotelDetailPage() {
  const params = useParams();

  const slug =
    typeof params?.slug ===
    "string"
      ? params.slug
      : "";

  const [language, setLanguage] =
    useState<Language>("vi");

  const [hotel, setHotel] =
    useState<Hotel | null>(null);

  const [rooms, setRooms] =
    useState<Room[]>([]);

  const [roomMedia, setRoomMedia] =
    useState<RoomMedia[]>([]);

  const [otas, setOtas] =
    useState<ActiveOTA[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [checkIn, setCheckIn] =
    useState("");

  const [checkOut, setCheckOut] =
    useState("");

  const [adults, setAdults] =
    useState(1);

  const [children, setChildren] =
    useState(0);

  const checkInRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const checkOutRef =
    useRef<HTMLInputElement | null>(
      null
    );

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem(
        "huyen-language"
      );

    if (
      savedLanguage === "vi" ||
      savedLanguage === "en"
    ) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "huyen-language",
      language
    );
  }, [language]);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function loadHotel() {
      setLoading(true);
      setError("");

      try {
        const {
          data: hotelData,
          error: hotelError,
        } = await supabase
          .from("hotels")
          .select("*")
          .eq("slug", slug)
          .eq("status", "active")
          .maybeSingle();

        if (hotelError) {
          throw hotelError;
        }

        if (!hotelData) {
          throw new Error(
            language === "vi"
              ? "Không tìm thấy khách sạn."
              : "Hotel not found."
          );
        }

        if (cancelled) {
          return;
        }

        setHotel(
          hotelData as Hotel
        );

        const hotelId =
          hotelData.id;

        const [
          roomsResult,
          otaChannelsResult,
        ] = await Promise.all([
          supabase
            .from("rooms")
            .select("*")
            .eq(
              "hotel_id",
              hotelId
            )
            .eq(
              "status",
              "active"
            )
            .order("id", {
              ascending: true,
            }),

          supabase
            .from(
              "hotel_ota_channels"
            )
            .select(
              "id, hotel_id, ota_id, listing_url, external_hotel_id, status, sort_order"
            )
            .eq(
              "hotel_id",
              hotelId
            )
            .eq(
              "status",
              "active"
            )
            .order(
              "sort_order",
              {
                ascending: true,
              }
            ),
        ]);

        if (
          roomsResult.error
        ) {
          throw roomsResult.error;
        }

        if (
          otaChannelsResult.error
        ) {
          throw otaChannelsResult.error;
        }

        const roomData =
          (roomsResult.data ??
            []) as Room[];

        const otaChannelData =
          (otaChannelsResult.data ??
            []) as HotelOTAChannel[];

        if (cancelled) {
          return;
        }

        setRooms(roomData);

        const roomIds =
          roomData.map(
            (room) => room.id
          );

        if (roomIds.length > 0) {
          const {
            data: mediaData,
            error: mediaError,
          } = await supabase
            .from("media")
            .select(
              "id, entity_id, public_url, is_cover, sort_order"
            )
            .eq(
              "entity_type",
              "room"
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
            );

          if (mediaError) {
            throw mediaError;
          }

          if (!cancelled) {
            setRoomMedia(
              (mediaData ??
                []) as RoomMedia[]
            );
          }
        } else {
          setRoomMedia([]);
        }

        if (
          otaChannelData.length >
          0
        ) {
          const otaIds =
            otaChannelData.map(
              (item) =>
                item.ota_id
            );

          const {
            data: platformData,
            error: platformError,
          } = await supabase
            .from("ota_platforms")
            .select(
              "id, name, slug, logo, website, status, sort_order"
            )
            .in(
              "id",
              otaIds
            )
            .eq(
              "status",
              "active"
            );

          if (platformError) {
            throw platformError;
          }

          const platforms =
            (platformData ??
              []) as OTAPlatform[];

          const platformMap =
            new Map<
              number,
              OTAPlatform
            >();

          platforms.forEach(
            (platform) => {
              platformMap.set(
                platform.id,
                platform
              );
            }
          );

          const activeOtas =
            otaChannelData
              .map(
                (channel) => {
                  const platform =
                    platformMap.get(
                      channel.ota_id
                    );

                  if (
                    !platform ||
                    !channel.listing_url
                  ) {
                    return null;
                  }

                  return {
                    id: channel.id,
                    name:
                      platform.name ??
                      platform.slug ??
                      "OTA",
                    slug:
                      platform.slug ??
                      "",
                    logo:
                      platform.logo ??
                      null,
                    website:
                      platform.website ??
                      null,
                    listing_url:
                      channel.listing_url,
                    sort_order:
                      channel.sort_order ??
                      0,
                  };
                }
              )
              .filter(
                (
                  item
                ): item is ActiveOTA =>
                  item !== null
              )
              .sort(
                (a, b) =>
                  a.sort_order -
                  b.sort_order
              );

          if (!cancelled) {
            setOtas(
              activeOtas
            );
          }
        } else {
          setOtas([]);
        }
      } catch (err) {
        console.error(
          "Hotel detail load error:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : language === "vi"
              ? "Không thể tải thông tin khách sạn."
              : "Unable to load hotel information."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHotel();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const roomMediaMap =
    useMemo(() => {
      const map =
        new Map<
          number,
          RoomMedia[]
        >();

      roomMedia.forEach(
        (media) => {
          const current =
            map.get(
              media.entity_id
            ) ?? [];

          current.push(media);

          map.set(
            media.entity_id,
            current
          );
        }
      );

      return map;
    }, [roomMedia]);

  function getRoomImage(
    room: Room
  ): string | null {
    const media =
      roomMediaMap.get(
        room.id
      ) ?? [];

    const cover =
      media.find(
        (item) =>
          item.is_cover === true
      );

    if (
      cover?.public_url
    ) {
      return cover.public_url;
    }

    const firstMedia =
      media.find(
        (item) =>
          !!item.public_url
      );

    if (
      firstMedia?.public_url
    ) {
      return firstMedia.public_url;
    }

    return room.image ?? null;
  }

  function openDatePicker(
    inputRef: React.RefObject<HTMLInputElement | null>
  ) {
    const input =
      inputRef.current;

    if (!input) return;

    try {
      if (
        typeof input.showPicker ===
        "function"
      ) {
        input.showPicker();
        return;
      }
    } catch {}

    input.focus();
    input.click();
  }

  function handleSearch() {
    if (
      checkIn &&
      checkOut &&
      checkOut <= checkIn
    ) {
      alert(
        language === "vi"
          ? "Ngày trả phòng phải sau ngày nhận phòng."
          : "Check-out date must be after check-in date."
      );

      return;
    }

    document
      .getElementById(
        "rooms-section"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function handleBookRoom(
    room: Room
  ) {
    const roomName =
      language === "vi"
        ? room.name_vi
        : room.name_en;

    const section =
      document.getElementById(
        "booking-search"
      );

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    sessionStorage.setItem(
      "huyen-selected-room",
      JSON.stringify({
        hotel_id:
          hotel?.id ?? null,
        hotel_slug:
          hotel?.slug ?? null,
        room_id: room.id,
        room_name:
          roomName ?? "",
        check_in:
          checkIn,
        check_out:
          checkOut,
        adults,
        children,
      })
    );
  }

  const hotelName =
    language === "vi"
      ? hotel?.name_vi
      : hotel?.name_en;

  const hotelAddress =
    language === "vi"
      ? hotel?.address_vi
      : hotel?.address_en;

  /*
   * MAP
   * hotels.map_url phải chứa
   * URL Google Maps Embed trực tiếp.
   *
   * Ví dụ:
   * https://www.google.com/maps/embed?pb=...
   *
   * Không cần bóc <iframe>,
   * không cần xử lý maps.app.goo.gl.
   */
  const mapEmbedUrl =
    hotel?.map_url?.trim() ||
    null;

  /*
   * LINK ĐÁNH GIÁ GOOGLE
   * Lấy trực tiếp từ hotels.google_business_url
   * trong Supabase.
   */
  const googleReviewUrl =
    hotel?.google_business_url?.trim() ||
    null;

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-950"
          >
            <ArrowLeft
              size={18}
            />
            {language === "vi"
              ? "Quay về trang chủ"
              : "Back to home"}
          </Link>

          <div className="flex min-h-[500px] items-center justify-center">
            <div className="text-sm text-slate-500">
              {language === "vi"
                ? "Đang tải..."
                : "Loading..."}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !hotel) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-950"
          >
            <ArrowLeft
              size={18}
            />
            {language === "vi"
              ? "Quay về trang chủ"
              : "Back to home"}
          </Link>

          <div className="mt-12 rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-700">
            {error ||
              (language ===
              "vi"
                ? "Không tìm thấy khách sạn."
                : "Hotel not found.")}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        {/* BACK */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-slate-950"
          >
            <ArrowLeft
              size={18}
            />
            {language === "vi"
              ? "Quay về trang chủ"
              : "Back to home"}
          </Link>

          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() =>
                setLanguage("vi")
              }
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                language === "vi"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500"
              }`}
            >
              VI
            </button>

            <button
              type="button"
              onClick={() =>
                setLanguage("en")
              }
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                language === "en"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500"
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* HOTEL NAME / GOOGLE
            70:30 CHỈ Ở ĐÂY */}
        <section className="grid grid-cols-1 gap-6 border-b border-slate-200 pb-7 md:grid-cols-[7fr_3fr]">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {hotelName ||
                (language ===
                "vi"
                  ? "Khách sạn"
                  : "Hotel")}
            </h1>

            {hotelAddress && (
              <div className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span>
                  {hotelAddress}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-start md:justify-end">
            {googleReviewUrl ? (
              <a
                href={
                  googleReviewUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3"
              >
                <GoogleIcon />

                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-950">
                  {language ===
                  "vi"
                    ? "Xem đánh giá Google >>"
                    : "View Google reviews >>"}
                </span>
              </a>
            ) : (
              <div className="flex items-center gap-3">
                <GoogleIcon />

                <span className="text-sm text-slate-400">
                  {language ===
                  "vi"
                    ? "Đánh giá Google"
                    : "Google reviews"}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ROOMS + SEARCH */}
        <section
          id="rooms-section"
          className="mt-8 scroll-mt-6"
        >
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* ROOM LIST */}
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold uppercase tracking-wide text-slate-950">
                  {language === "vi"
                    ? "DANH SÁCH PHÒNG"
                    : "ROOMS"}
                </h2>

                <span className="text-sm text-slate-500">
                  {rooms.length}{" "}
                  {language ===
                  "vi"
                    ? "loại phòng"
                    : rooms.length ===
                      1
                    ? "room type"
                    : "room types"}
                </span>
              </div>

              {rooms.length ===
              0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  {language ===
                  "vi"
                    ? "Hiện chưa có phòng đang hoạt động."
                    : "There are no active rooms at the moment."}
                </div>
              ) : (
                <div className="space-y-5">
                  {rooms.map(
                    (room) => {
                      const image =
                        getRoomImage(
                          room
                        );

                      const roomName =
                        language ===
                        "vi"
                          ? room.name_vi
                          : room.name_en;

                      const description =
                        language ===
                        "vi"
                          ? room.description_vi
                          : room.description_en;

                      const bed =
                        getRoomBed(
                          room,
                          language
                        );

                      const size =
                        getRoomSize(
                          room
                        );

                      const guests =
                        getRoomGuests(
                          room
                        );

                      const amenities =
                        parseAmenities(
                          language ===
                            "vi"
                            ? room.amenities_vi
                            : room.amenities_en,
                          language
                        );

                      const price =
                        getRoomPrice(
                          room
                        );

                      const priceUnit =
                        getPriceUnit(
                          room,
                          language
                        );

                      return (
                        <article
                          key={
                            room.id
                          }
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
                            {/* IMAGE */}
                            <div className="relative min-h-[220px] bg-slate-100">
                              {image ? (
                                <img
                                  src={
                                    image
                                  }
                                  alt={
                                    roomName ??
                                    "Room"
                                  }
                                  className="absolute inset-0 h-full w-full object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                                  {language ===
                                  "vi"
                                    ? "Chưa có hình ảnh"
                                    : "No image"}
                                </div>
                              )}
                            </div>

                            {/* ROOM INFO */}
                            <div className="p-5 sm:p-6">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <h3 className="text-xl font-bold text-slate-950">
                                    {roomName ||
                                      (language ===
                                      "vi"
                                        ? "Phòng"
                                        : "Room")}
                                  </h3>

                                  {description && (
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                      {
                                        description
                                      }
                                    </p>
                                  )}
                                </div>

                                {price !=
                                  null && (
                                  <div className="shrink-0 text-left sm:text-right">
                                    <div className="text-lg font-bold text-slate-950">
                                      {formatPrice(
                                        price
                                      )}
                                    </div>

                                    <div className="text-xs text-slate-500">
                                      /{" "}
                                      {
                                        priceUnit
                                      }
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-3">
                                {size && (
                                  <div className="flex items-center gap-2">
                                    <Maximize2
                                      size={
                                        17
                                      }
                                    />
                                    <span>
                                      {
                                        size
                                      }{" "}
                                      m²
                                    </span>
                                  </div>
                                )}

                                {guests !=
                                  null && (
                                  <div className="flex items-center gap-2">
                                    <Users
                                      size={
                                        17
                                      }
                                    />
                                    <span>
                                      {language ===
                                      "vi"
                                        ? `Tối đa ${guests} khách`
                                        : `Up to ${guests} guests`}
                                    </span>
                                  </div>
                                )}

                                {bed && (
                                  <div className="flex items-center gap-2">
                                    <BedDouble
                                      size={
                                        17
                                      }
                                    />
                                    <span>
                                      {
                                        bed
                                      }
                                    </span>
                                  </div>
                                )}
                              </div>

                              {amenities.length >
                                0 && (
                                <div className="mt-5 border-t border-slate-100 pt-4">
                                  <div className="mb-2 text-sm font-semibold text-slate-900">
                                    {language ===
                                    "vi"
                                      ? "Tiện nghi phòng"
                                      : "Room amenities"}
                                  </div>

                                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {amenities.map(
                                      (
                                        amenity,
                                        index
                                      ) => (
                                        <div
                                          key={`${room.id}-${index}`}
                                          className="flex items-start gap-2 text-sm text-slate-600"
                                        >
                                          <Check
                                            size={
                                              16
                                            }
                                            className="mt-0.5 shrink-0 text-emerald-600"
                                          />
                                          <span>
                                            {
                                              amenity
                                            }
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* BOOK ROOM */}
                              <div className="mt-6 border-t border-slate-100 pt-5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleBookRoom(
                                      room
                                    )
                                  }
                                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 text-sm font-bold text-white transition hover:bg-sky-600"
                                >
                                  <Search
                                    size={
                                      17
                                    }
                                  />

                                  {language ===
                                  "vi"
                                    ? "Đặt phòng"
                                    : "Book this room"}

                                  <ChevronRight
                                    size={
                                      17
                                    }
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* SEARCH */}
            <aside
              id="booking-search"
              className="lg:sticky lg:top-6"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <Search
                    size={19}
                  />

                  <h2 className="text-lg font-bold text-slate-950">
                    {language ===
                    "vi"
                      ? "TÌM PHÒNG"
                      : "FIND ROOMS"}
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* HOTEL */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      {language ===
                      "vi"
                        ? "Khách sạn"
                        : "Hotel"}
                    </label>

                    <input
                      type="text"
                      value={
                        hotelName ??
                        ""
                      }
                      readOnly
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none"
                    />
                  </div>

                  {/* CHECK IN */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      {language ===
                      "vi"
                        ? "Nhận phòng"
                        : "Check-in"}
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        openDatePicker(
                          checkInRef
                        )
                      }
                      className="relative flex h-11 w-full cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-700"
                    >
                      <span>
                        {checkIn
                          ? formatDate(
                              checkIn,
                              language
                            )
                          : language ===
                            "vi"
                          ? "Chọn ngày"
                          : "Select date"}
                      </span>

                      <input
                        ref={
                          checkInRef
                        }
                        type="date"
                        value={
                          checkIn
                        }
                        onChange={(
                          event
                        ) => {
                          const value =
                            event
                              .target
                              .value;

                          setCheckIn(
                            value
                          );

                          if (
                            checkOut &&
                            value &&
                            checkOut <=
                              value
                          ) {
                            setCheckOut(
                              ""
                            );
                          }
                        }}
                        className="pointer-events-none absolute h-0 w-0 opacity-0"
                        tabIndex={-1}
                        aria-hidden="true"
                      />

                      <span className="ml-auto text-slate-400">
                        📅
                      </span>
                    </button>
                  </div>

                  {/* CHECK OUT */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      {language ===
                      "vi"
                        ? "Trả phòng"
                        : "Check-out"}
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        openDatePicker(
                          checkOutRef
                        )
                      }
                      className="relative flex h-11 w-full cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-700"
                    >
                      <span>
                        {checkOut
                          ? formatDate(
                              checkOut,
                              language
                            )
                          : language ===
                            "vi"
                          ? "Chọn ngày"
                          : "Select date"}
                      </span>

                      <input
                        ref={
                          checkOutRef
                        }
                        type="date"
                        value={
                          checkOut
                        }
                        min={
                          checkIn ||
                          undefined
                        }
                        onChange={(
                          event
                        ) =>
                          setCheckOut(
                            event
                              .target
                              .value
                          )
                        }
                        className="pointer-events-none absolute h-0 w-0 opacity-0"
                        tabIndex={-1}
                        aria-hidden="true"
                      />

                      <span className="ml-auto text-slate-400">
                        📅
                      </span>
                    </button>
                  </div>

                  {/* ADULTS */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      {language ===
                      "vi"
                        ? "Người lớn"
                        : "Adults"}
                    </label>

                    <div className="flex h-11 items-center justify-between rounded-xl border border-slate-200 px-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAdults(
                            Math.max(
                              1,
                              adults -
                                1
                            )
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                      >
                        <Minus
                          size={
                            16
                          }
                        />
                      </button>

                      <span className="text-sm font-semibold">
                        {adults}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setAdults(
                            adults +
                              1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                      >
                        <Plus
                          size={
                            16
                          }
                        />
                      </button>
                    </div>
                  </div>

                  {/* CHILDREN */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      {language ===
                      "vi"
                        ? "Trẻ em"
                        : "Children"}
                    </label>

                    <div className="flex h-11 items-center justify-between rounded-xl border border-slate-200 px-2">
                      <button
                        type="button"
                        onClick={() =>
                          setChildren(
                            Math.max(
                              0,
                              children -
                                1
                            )
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                      >
                        <Minus
                          size={
                            16
                          }
                        />
                      </button>

                      <span className="text-sm font-semibold">
                        {children}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setChildren(
                            children +
                              1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                      >
                        <Plus
                          size={
                            16
                          }
                        />
                      </button>
                    </div>
                  </div>

                  {/* SEARCH */}
                  <button
                    type="button"
                    onClick={
                      handleSearch
                    }
                    className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-bold text-white transition hover:bg-sky-600"
                  >
                    <Search
                      size={
                        18
                      }
                    />

                    {language ===
                    "vi"
                      ? "Tìm phòng"
                      : "Find rooms"}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* OTA */}
        <section className="mt-12 border-t border-slate-200 pt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold uppercase tracking-wide text-slate-950">
              {language ===
              "vi"
                ? "Đặt phòng trực tuyến"
                : "Booking online - OTAs"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {language ===
              "vi"
                ? "Đặt phòng qua các nền tảng đang bán phòng của khách sạn."
                : "Book through the platforms currently selling rooms at this hotel."}
            </p>
          </div>

          {otas.length ===
          0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              {language ===
              "vi"
                ? "Hiện chưa có OTA nào được kết nối."
                : "No OTA channels are currently connected."}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {otas.map(
                (ota) => (
                  <a
                    key={
                      ota.id
                    }
                    href={
                      ota.listing_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-[58px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    {ota.logo ? (
                      <img
                        src={
                          ota.logo
                        }
                        alt={
                          ota.name
                        }
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                        {ota.name
                          .charAt(
                            0
                          )
                          .toUpperCase()}
                      </div>
                    )}

                    <span className="text-sm font-semibold text-slate-900 group-hover:text-sky-600">
                      {ota.name}
                    </span>

                    <ChevronRight
                      size={16}
                      className="ml-auto shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-sky-500"
                    />
                  </a>
                )
              )}
            </div>
          )}
        </section>

        {/* MAP */}
        <section className="mt-12 border-t border-slate-200 pt-10">
          <h2 className="mb-5 text-xl font-bold uppercase tracking-wide text-slate-950">
            {language ===
            "vi"
              ? "BẢN ĐỒ"
              : "MAP"}
          </h2>

          {mapEmbedUrl ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <iframe
                src={mapEmbedUrl}
                title={
                  language ===
                  "vi"
                    ? "Bản đồ vị trí khách sạn"
                    : "Hotel location map"
                }
                className="h-[420px] w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
              {language ===
              "vi"
                ? "Chưa có link nhúng bản đồ trong hệ thống."
                : "No embedded map link is available."}
            </div>
          )}
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            ©{" "}
            {new Date().getFullYear()}{" "}
            Huyen&apos;s Hotels &
            Stays
          </div>

          <div>
            {language ===
            "vi"
              ? "Thoải mái theo cách của bạn."
              : "Comfort, your way."}
          </div>
        </div>
      </footer>
    </main>
  );
}
