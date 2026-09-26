
"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type RefObject,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

type Language = "vi" | "en";

type SelectedRoom = {
  hotelSlug: string;
  roomSlug: string;
  quantity: number;
};

type SelectedRoomMap = {
  [roomSlug: string]: number;
};

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
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
  quantity: number | null;
  size: number | null;
  max_guests: number | null;
  beds_vi: string | null;
  beds_en: string | null;
  status: "active" | "inactive";
};

type Media = {
  id: number;
  entity_id: number | null;
  public_url: string;
  alt_vi: string | null;
  alt_en: string | null;
  is_cover: boolean;
  sort_order: number;
  status: "active" | "inactive";
};

type RoomAmenity = {
  id: number;
  room_id: number;
  name_vi: string;
  name_en: string;
  icon: string | null;
  sort_order: number;
  status: "active" | "inactive";
};

type AvailabilityRoom = {
  roomId: number;
  roomSlug: string;
  hotelSlug: string;
  basePrice?: number;
  totalQuantity: number;
  bookedQuantity: number;
  availableQuantity: number;
};

type DisplayRoom = Room & {
  image: string;
  imageAlt: string;
  amenitiesVi: string[];
  amenitiesEn: string[];
  availableQuantity: number;
  bookedQuantity: number;
  totalQuantity: number;
};

const fallbackRoomImage = "/images/hero/hero-2.jpg";
const MAX_GUESTS_FALLBACK = 10;

const formatPrice = (v: number) =>
  new Intl.NumberFormat("vi-VN").format(v);

const formatDate = (v: string) =>
  v && v.length === 10 ? v.split("-").reverse().join("/") : v;

const calculateNights = (inDate: string, outDate: string) => {
  if (!inDate || !outDate) return 1;

  const d =
    new Date(outDate).getTime() -
    new Date(inDate).getTime();

  return d > 0 ? Math.max(1, Math.ceil(d / 86400000)) : 1;
};

function TimPhongContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hotelSlug = searchParams.get("hotel") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";

  const adults = Math.max(
    1,
    Number(searchParams.get("adults")) || 2
  );

  const children = Math.max(
    0,
    Number(searchParams.get("children")) || 0
  );

  const requestedRooms = Math.max(
    1,
    Number(searchParams.get("rooms")) || 1
  );

  const totalGuests = adults + children;

  const [language, setLanguage] = useState<Language>("vi");
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomMedia, setRoomMedia] = useState<Media[]>([]);
  const [roomAmenities, setRoomAmenities] = useState<RoomAmenity[]>([]);
  const [availabilityRooms, setAvailabilityRooms] = useState<
    AvailabilityRoom[]
  >([]);
  const [selectedRooms, setSelectedRooms] =
    useState<SelectedRoomMap>({});
  const [loading, setLoading] = useState(true);
  const [loadingAvailability, setLoadingAvailability] =
    useState(true);
  const [availabilityError, setAvailabilityError] =
    useState("");

  const [editCheckIn, setEditCheckIn] = useState(checkIn);
  const [editCheckOut, setEditCheckOut] = useState(checkOut);
  const [editAdults, setEditAdults] = useState(adults);
  const [editChildren, setEditChildren] = useState(children);
  const [editError, setEditError] = useState("");

  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditCheckIn(checkIn);
    setEditCheckOut(checkOut);
    setEditAdults(adults);
    setEditChildren(children);
    setEditError("");
    setSelectedRooms({});
  }, [checkIn, checkOut, adults, children]);

  useEffect(() => {
    const saved =
      window.localStorage.getItem("huyen-language");

    if (saved === "vi" || saved === "en") {
      setLanguage(saved);
    }

    const handleLanguageChange = () => {
      const current =
        window.localStorage.getItem("huyen-language");

      if (current === "vi" || current === "en") {
        setLanguage(current);
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
    if (!hotelSlug || !checkIn || !checkOut) {
      router.replace("/");
    }
  }, [hotelSlug, checkIn, checkOut, router]);

  useEffect(() => {
    if (!hotelSlug || !checkIn || !checkOut) return;

    let cancelled = false;

    setLoading(true);

    (async () => {
      try {
        const { data: hotelData, error: hotelError } =
          await supabase
            .from("hotels")
            .select(
              "id,slug,name_vi,name_en,status"
            )
            .eq("slug", hotelSlug)
            .eq("status", "active")
            .maybeSingle();

        if (hotelError) throw hotelError;

        if (!hotelData) {
          setHotel(null);
          setRooms([]);
          return;
        }

        const currentHotel =
          hotelData as unknown as Hotel;

        setHotel(currentHotel);

        const { data: roomData, error: roomError } =
          await supabase
            .from("rooms")
            .select(
              "id,hotel_id,slug,name_vi,name_en,description_vi,description_en,base_price,quantity,size,max_guests,beds_vi,beds_en,status"
            )
            .eq("hotel_id", currentHotel.id)
            .eq("status", "active")
            .order("id");

        if (roomError) throw roomError;

        if (!roomData) return;

        const currentRooms =
          roomData as unknown as Room[];

        setRooms(currentRooms);

        if (!currentRooms.length) return;

        const ids = currentRooms.map(
          (room) => room.id
        );

        const [mediaResult, amenitiesResult] =
          await Promise.all([
            supabase
              .from("media")
              .select(
                "id,entity_id,public_url,alt_vi,alt_en,is_cover,sort_order,status"
              )
              .eq("entity_type", "room")
              .in("entity_id", ids)
              .eq("status", "active")
              .order("is_cover", {
                ascending: false,
              })
              .order("sort_order"),

            supabase
              .from("room_amenities")
              .select(
                "id,room_id,name_vi,name_en,icon,sort_order,status"
              )
              .in("room_id", ids)
              .eq("status", "active")
              .order("sort_order"),
          ]);

        if (mediaResult.error) {
          throw mediaResult.error;
        }

        if (amenitiesResult.error) {
          throw amenitiesResult.error;
        }

        if (!cancelled) {
          setRoomMedia(
            (mediaResult.data || []) as unknown as Media[]
          );

          setRoomAmenities(
            (amenitiesResult.data ||
              []) as unknown as RoomAmenity[]
          );
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setHotel(null);
          setRooms([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hotelSlug, checkIn, checkOut]);

  useEffect(() => {
    if (!hotelSlug || !checkIn || !checkOut) return;

    let cancelled = false;

    setLoadingAvailability(true);
    setAvailabilityError("");

    (async () => {
      try {
        const response = await fetch(
          "/api/availability",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hotelSlug,
              checkIn,
              checkOut,
            }),
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Không kiểm tra được tình trạng phòng"
          );
        }

        if (!cancelled) {
          setAvailabilityRooms(
            (
              Array.isArray(data?.rooms)
                ? data.rooms
                : []
            ).filter(
              (room: AvailabilityRoom) =>
                room.hotelSlug === hotelSlug
            )
          );
        }
      } catch (error) {
        if (!cancelled) {
          setAvailabilityRooms([]);
          setAvailabilityError(
            error instanceof Error
              ? error.message
              : "Lỗi kiểm tra phòng"
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingAvailability(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hotelSlug, checkIn, checkOut]);

  const roomCoverMap = useMemo(() => {
    const map: Record<number, Media> = {};

    for (const media of roomMedia) {
      if (media.entity_id === null) continue;

      const current = map[media.entity_id];

      if (
        !current ||
        (media.is_cover && !current.is_cover) ||
        (
          media.is_cover === current.is_cover &&
          media.sort_order < current.sort_order
        )
      ) {
        map[media.entity_id] = media;
      }
    }

    return map;
  }, [roomMedia]);

  const availableRooms = useMemo<DisplayRoom[]>(() => {
    if (!hotel) return [];

    return rooms
      .map((room) => {
        const availability =
          availabilityRooms.find(
            (item) => item.roomId === room.id
          );

        const cover = roomCoverMap[room.id];

        const amenities =
          roomAmenities.filter(
            (item) => item.room_id === room.id
          );

        const totalQuantity = Math.max(
          Number(
            availability?.totalQuantity ??
              room.quantity ??
              0
          ) || 0,
          0
        );

        const bookedQuantity = Math.max(
          Number(
            availability?.bookedQuantity ?? 0
          ) || 0,
          0
        );

        const availableQuantity = Math.max(
          totalQuantity - bookedQuantity,
          0
        );

        return {
          ...room,
          image:
            cover?.public_url ||
            fallbackRoomImage,
          imageAlt:
            (
              language === "vi"
                ? cover?.alt_vi
                : cover?.alt_en
            ) ||
            room.name_vi ||
            room.name_en,
          amenitiesVi: amenities.map(
            (item) => item.name_vi
          ),
          amenitiesEn: amenities.map(
            (item) => item.name_en
          ),
          totalQuantity,
          bookedQuantity,
          availableQuantity,
        };
      })
      .filter((room) => {
        const maxGuests =
          room.max_guests ??
          MAX_GUESTS_FALLBACK;

        return (
          room.status === "active" &&
          room.hotel_id === hotel.id &&
          maxGuests >= totalGuests &&
          room.availableQuantity > 0
        );
      })
      .sort(
        (a, b) =>
          (Number(a.base_price) || 0) -
          (Number(b.base_price) || 0)
      );
  }, [
    rooms,
    hotel,
    totalGuests,
    availabilityRooms,
    roomCoverMap,
    roomAmenities,
    language,
  ]);

  const nights = useMemo(
    () => calculateNights(checkIn, checkOut),
    [checkIn, checkOut]
  );

  const selectedRoomCount = useMemo(
    () =>
      Object.values(selectedRooms).reduce(
        (sum, quantity) => sum + quantity,
        0
      ),
    [selectedRooms]
  );

  const selectedTotal = useMemo(
    () =>
      availableRooms.reduce(
        (sum, room) =>
          sum +
          (Number(room.base_price) || 0) *
            (selectedRooms[room.slug] || 0) *
            nights,
        0
      ),
    [availableRooms, selectedRooms, nights]
  );

  const openDatePicker = useCallback(
    (ref: RefObject<HTMLInputElement | null>) => {
      ref.current?.focus();

      try {
        (ref.current as any)?.showPicker?.();
      } catch {}
    },
    []
  );

  const applyBookingChanges = useCallback(() => {
    setEditError("");

    if (!editCheckIn || !editCheckOut) {
      setEditError(
        language === "vi"
          ? "Chọn ngày vào và ngày ra"
          : "Select check-in/out dates"
      );
      return;
    }

    if (editCheckOut <= editCheckIn) {
      setEditError(
        language === "vi"
          ? "Ngày ra phải sau ngày vào"
          : "Check-out must be after check-in"
      );
      return;
    }

    if (
      calculateNights(
        editCheckIn,
        editCheckOut
      ) < 1
    ) {
      setEditError(
        language === "vi"
          ? "Khoảng thời gian không hợp lệ"
          : "Invalid date range"
      );
      return;
    }

    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("hotel", hotelSlug);
    params.set("checkIn", editCheckIn);
    params.set("checkOut", editCheckOut);
    params.set(
      "adults",
      String(Math.max(1, editAdults))
    );
    params.set(
      "children",
      String(Math.max(0, editChildren))
    );
    params.set(
      "rooms",
      String(requestedRooms)
    );

    router.replace(
      `/tim-phong?${params.toString()}`
    );
  }, [
    editCheckIn,
    editCheckOut,
    editAdults,
    editChildren,
    hotelSlug,
    searchParams,
    requestedRooms,
    router,
    language,
  ]);

  const changeRoomQuantity = useCallback(
    (
      room: DisplayRoom,
      delta: number
    ) => {
      setSelectedRooms((previous) => {
        const current =
          previous[room.slug] || 0;

        const next = Math.min(
          Math.max(
            current + delta,
            0
          ),
          room.availableQuantity
        );

        const result = {
          ...previous,
        };

        if (next <= 0) {
          delete result[room.slug];
        } else {
          result[room.slug] = next;
        }

        return result;
      });
    },
    []
  );

  const continueBooking = useCallback(() => {
    if (
      selectedRoomCount <= 0 ||
      !hotel
    ) {
      return;
    }

    const selected: SelectedRoom[] =
      Object.entries(selectedRooms)
        .filter(([, quantity]) => quantity > 0)
        .map(([slug, quantity]) => ({
          hotelSlug: hotel.slug,
          roomSlug: slug,
          quantity,
        }));

    if (!selected.length) return;

    const params = new URLSearchParams();

    params.set(
      "hotel",
      hotel.slug
    );

    params.set(
      "rooms",
      JSON.stringify(selected)
    );

    params.set(
      "checkIn",
      checkIn
    );

    params.set(
      "checkOut",
      checkOut
    );

    params.set(
      "adults",
      String(adults)
    );

    params.set(
      "children",
      String(children)
    );

    params.set(
      "roomsCount",
      String(requestedRooms)
    );

    router.push(
      `/dat-phong?${params.toString()}`
    );
  }, [
    selectedRoomCount,
    selectedRooms,
    hotel,
    checkIn,
    checkOut,
    adults,
    children,
    requestedRooms,
    router,
  ]);

  if (
    !hotelSlug ||
    !checkIn ||
    !checkOut
  ) {
    return null;
  }

  const hotelName = hotel
    ? language === "vi"
      ? hotel.name_vi
      : hotel.name_en
    : "";

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-slate-900"
            >
              Huyen's Hotels & Stays
            </Link>

            {hotelName && (
              <p className="mt-1 text-sm text-neutral-500">
                {hotelName}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-medium text-slate-700 hover:text-slate-950"
          >
            ←{" "}
            {language === "vi"
              ? "Quay lại"
              : "Back"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            {language === "vi"
              ? "Tìm phòng"
              : "Find a room"}
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {language === "vi"
              ? "Chọn phòng"
              : "Choose your room"}
          </h1>
        </div>

        <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              {language === "vi"
                ? "Thông tin đặt phòng"
                : "Booking information"}
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {language === "vi"
                ? "Điều chỉnh ngày ở, ngày đi và số khách."
                : "Adjust dates and guests."}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr_1fr_1.5fr_auto]">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {language === "vi"
                  ? "Khách sạn"
                  : "Hotel"}
              </label>

              <div className="flex h-12 items-center rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-medium text-slate-900">
                {hotelName || "—"}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {language === "vi"
                  ? "Ngày ở"
                  : "Check-in"}
              </label>

              <div
                role="button"
                tabIndex={0}
                onClick={() =>
                  openDatePicker(checkInRef)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    openDatePicker(checkInRef);
                  }
                }}
                className="relative flex h-12 w-full cursor-pointer items-center rounded-xl border border-neutral-200 bg-white px-4 hover:border-slate-400 focus-within:border-slate-500"
              >
                <input
                  ref={checkInRef}
                  type="date"
                  value={editCheckIn}
                  onChange={(event) =>
                    setEditCheckIn(
                      event.target.value
                    )
                  }
                  className="h-full w-full cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {language === "vi"
                  ? "Ngày đi"
                  : "Check-out"}
              </label>

              <div
                role="button"
                tabIndex={0}
                onClick={() =>
                  openDatePicker(checkOutRef)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    openDatePicker(checkOutRef);
                  }
                }}
                className="relative flex h-12 w-full cursor-pointer items-center rounded-xl border border-neutral-200 bg-white px-4 hover:border-slate-400 focus-within:border-slate-500"
              >
                <input
                  ref={checkOutRef}
                  type="date"
                  value={editCheckOut}
                  min={
                    editCheckIn || undefined
                  }
                  onChange={(event) =>
                    setEditCheckOut(
                      event.target.value
                    )
                  }
                  className="h-full w-full cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {language === "vi"
                  ? "Khách"
                  : "Guests"}
              </label>

              <div className="flex h-12 items-center gap-4 rounded-xl border border-neutral-200 bg-white px-3">
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className="text-sm text-neutral-600">
                    {language === "vi"
                      ? "Người lớn"
                      : "Adults"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditAdults(
                          (value) =>
                            Math.max(
                              1,
                              value - 1
                            )
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-slate-700 hover:bg-neutral-100"
                    >
                      −
                    </button>

                    <span className="w-5 text-center text-sm font-semibold text-slate-900">
                      {editAdults}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setEditAdults(
                          (value) =>
                            value + 1
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-slate-700 hover:bg-neutral-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="h-6 w-px bg-neutral-200" />

                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className="text-sm text-neutral-600">
                    {language === "vi"
                      ? "Trẻ em"
                      : "Children"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditChildren(
                          (value) =>
                            Math.max(
                              0,
                              value - 1
                            )
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-slate-700 hover:bg-neutral-100"
                    >
                      −
                    </button>

                    <span className="w-5 text-center text-sm font-semibold text-slate-900">
                      {editChildren}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setEditChildren(
                          (value) =>
                            value + 1
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-slate-700 hover:bg-neutral-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={applyBookingChanges}
                className="h-12 w-full rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 lg:min-w-[120px]"
              >
                {language === "vi"
                  ? "Cập nhật"
                  : "Update"}
              </button>
            </div>
          </div>

          {editError && (
            <div
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              role="alert"
            >
              {editError}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
            <span>
              {language === "vi"
                ? "Ở:"
                : "Check-in:"}{" "}
              <strong className="text-slate-800">
                {formatDate(checkIn)}
              </strong>
            </span>

            <span>
              {language === "vi"
                ? "Đi:"
                : "Check-out:"}{" "}
              <strong className="text-slate-800">
                {formatDate(checkOut)}
              </strong>
            </span>

            <span>
              {nights}{" "}
              {language === "vi"
                ? "đêm"
                : "nights"}
            </span>

            <span>
              {totalGuests}{" "}
              {language === "vi"
                ? "khách"
                : "guests"}
            </span>

            <span>
              {requestedRooms}{" "}
              {language === "vi"
                ? "phòng"
                : "room(s)"}
            </span>
          </div>
        </section>

        {loading && (
          <div className="space-y-5">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-2xl bg-neutral-200"
              />
            ))}
          </div>
        )}

        {!loading && loadingAvailability && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-600">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-slate-800" />
            {language === "vi"
              ? "Đang kiểm tra phòng trống..."
              : "Checking availability..."}
          </div>
        )}

        {!loading &&
          !loadingAvailability &&
          availabilityError && (
            <div
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
              role="alert"
            >
              {availabilityError}
            </div>
          )}

        {!loading &&
          !loadingAvailability &&
          !availabilityError &&
          availableRooms.length === 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                {language === "vi"
                  ? "Không còn phòng phù hợp"
                  : "No suitable rooms available"}
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-500">
                {language === "vi"
                  ? "Thay đổi ngày hoặc số khách thử lại."
                  : "Try changing dates or guest count."}
              </p>
            </div>
          )}

        {!loading &&
          !loadingAvailability &&
          availableRooms.length > 0 && (
            <div className="space-y-6">
              {availableRooms.map((room) => {
                const quantity =
                  selectedRooms[room.slug] || 0;

                const roomName =
                  language === "vi"
                    ? room.name_vi
                    : room.name_en;

                const description =
                  language === "vi"
                    ? room.description_vi
                    : room.description_en;

                const beds =
                  language === "vi"
                    ? room.beds_vi
                    : room.beds_en;

                const amenities =
                  language === "vi"
                    ? room.amenitiesVi
                    : room.amenitiesEn;

                return (
                  <article
                    key={room.id}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
                  >
                    <div className="grid lg:grid-cols-[360px_1fr]">
                      <div className="relative h-64 bg-neutral-100 sm:h-80 lg:h-full lg:min-h-[360px]">
                        <img
                          src={room.image}
                          alt={room.imageAlt}
                          className="absolute inset-0 h-full w-full object-cover"
                        />

                        {room.availableQuantity > 0 && (
                          <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800">
                            {language === "vi"
                              ? `Còn ${room.availableQuantity} phòng`
                              : `${room.availableQuantity} available`}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col p-5 sm:p-7">
                        <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
                          <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                              {roomName}
                            </h2>

                            {description && (
                              <p className="mt-3 text-sm text-neutral-600">
                                {description}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 text-left sm:text-right">
                            <div className="text-xl font-bold text-slate-900">
                              {formatPrice(
                                Number(
                                  room.base_price
                                ) || 0
                              )}{" "}
                              ₫
                            </div>

                            <div className="text-xs text-neutral-500">
                              {language === "vi"
                                ? "/đêm"
                                : "/night"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                          {room.size && (
                            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs">
                              {room.size} m²
                            </span>
                          )}

                          {room.max_guests && (
                            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs">
                              {language === "vi"
                                ? `Tối đa ${room.max_guests} khách`
                                : `Up to ${room.max_guests}`}
                            </span>
                          )}

                          {beds && (
                            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs">
                              {beds}
                            </span>
                          )}
                        </div>

                        {amenities.length > 0 && (
                          <div className="mt-6">
                            <h3 className="text-sm font-semibold text-slate-900">
                              {language === "vi"
                                ? "Tiện nghi"
                                : "Amenities"}
                            </h3>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {amenities.map(
                                (amenity, index) => (
                                  <span
                                    key={index}
                                    className="rounded-lg border border-neutral-200 px-3 py-2 text-xs text-neutral-600"
                                  >
                                    {amenity}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-auto flex flex-col gap-4 border-t border-neutral-100 pt-6 sm:flex-row sm:justify-between">
                          <Link
                            href={`/khach-san/${hotelSlug}/phong/${room.slug}`}
                            className="text-sm font-semibold text-slate-800 hover:text-slate-950"
                          >
                            {language === "vi"
                              ? "Xem chi tiết"
                              : "View details"}{" "}
                            →
                          </Link>

                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-neutral-600">
                              {language === "vi"
                                ? "Số phòng"
                                : "Rooms"}
                            </span>

                            <div className="flex items-center rounded-full border border-neutral-300">
                              <button
                                type="button"
                                onClick={() =>
                                  changeRoomQuantity(
                                    room,
                                    -1
                                  )
                                }
                                disabled={
                                  quantity <= 0
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-l-full disabled:opacity-40"
                              >
                                −
                              </button>

                              <span className="w-10 text-center text-sm font-bold">
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  changeRoomQuantity(
                                    room,
                                    1
                                  )
                                }
                                disabled={
                                  quantity >=
                                  room.availableQuantity
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-r-full disabled:opacity-40"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </div>

      {selectedRoomCount > 0 && (
        <div className="sticky bottom-0 z-40 border-t border-neutral-200 bg-white/95 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <div className="text-sm font-medium text-neutral-500">
                {selectedRoomCount}{" "}
                {language === "vi"
                  ? "phòng đã chọn"
                  : "room(s) selected"}
              </div>

              <div className="mt-1 text-xl font-bold text-slate-900">
                {formatPrice(selectedTotal)} ₫
              </div>

              <div className="text-xs text-neutral-500">
                {nights}{" "}
                {language === "vi"
                  ? "đêm"
                  : "nights"}
              </div>
            </div>

            <button
              type="button"
              onClick={continueBooking}
              className="rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {language === "vi"
                ? "Tiếp tục đặt phòng"
                : "Continue booking"}{" "}
              →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function TimPhongLoading() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-neutral-200" />
        <div className="mt-6 h-48 animate-pulse rounded-2xl bg-neutral-200" />
        <div className="mt-6 h-72 animate-pulse rounded-2xl bg-neutral-200" />
      </div>
    </main>
  );
}

export default function TimPhongPage() {
  return (
    <Suspense fallback={<TimPhongLoading />}>
      <TimPhongContent />
    </Suspense>
  );
}

