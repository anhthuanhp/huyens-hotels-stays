"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

type Language = "vi" | "en";

export type HotelOption = {
  id: number;
  name: string;
  slug: string;
  name_vi?: string;
  name_en?: string;
};

type BookingSearchProps = {
  hotels: HotelOption[];
  initialHotelSlug?: string;
};

declare global {
  interface WindowEventMap {
    "language-change": CustomEvent<Language>;
  }
}

export default function BookingSearch({
  hotels,
  initialHotelSlug = "",
}: BookingSearchProps) {
  const router = useRouter();

  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "vi";
    }

    const saved =
      window.localStorage.getItem("language") ||
      window.localStorage.getItem("huyen-language");

    return saved === "vi" || saved === "en"
      ? saved
      : "vi";
  });

  const [hotel, setHotel] =
    useState(initialHotelSlug);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const checkInRef =
    useRef<HTMLInputElement>(null);

  const checkOutRef =
    useRef<HTMLInputElement>(null);

  const today = new Date()
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    if (initialHotelSlug) {
      setHotel(initialHotelSlug);
    }
  }, [initialHotelSlug]);

  useEffect(() => {
    const handler = (e: CustomEvent<Language>) => {
      if (
        e.detail === "vi" ||
        e.detail === "en"
      ) {
        setLanguage(e.detail);
      }
    };

    window.addEventListener(
      "language-change",
      handler
    );

    return () => {
      window.removeEventListener(
        "language-change",
        handler
      );
    };
  }, []);

  const isVi = language === "vi";

  const openDatePicker = useCallback(
    (
      inputRef: React.RefObject<
        HTMLInputElement | null
      >
    ) => {
      const input = inputRef.current;

      if (!input) return;

      input.focus();

      if ("showPicker" in input) {
        try {
          input.showPicker();
        } catch {}
      }
    },
    []
  );

  const handleSearch = useCallback(() => {
    if (!hotel) {
      alert(
        isVi
          ? "Vui lòng chọn khách sạn"
          : "Please select a hotel"
      );
      return;
    }

    if (!checkIn || !checkOut) {
      alert(
        isVi
          ? "Vui lòng chọn ngày nhận và trả phòng"
          : "Please select check-in and check-out dates"
      );
      return;
    }

    if (checkOut <= checkIn) {
      alert(
        isVi
          ? "Ngày trả phòng phải sau ngày nhận phòng"
          : "Check-out must be after check-in date"
      );
      return;
    }

    const params = new URLSearchParams();

    params.set("hotel", hotel);
    params.set("checkIn", checkIn);
    params.set("checkOut", checkOut);
    params.set("adults", String(adults));
    params.set("children", String(children));

    router.push(
      `/tim-phong?${params.toString()}`
    );
  }, [
    hotel,
    checkIn,
    checkOut,
    adults,
    children,
    router,
    isVi,
  ]);

  const increaseAdults = () =>
    setAdults((value) => value + 1);

  const decreaseAdults = () =>
    setAdults((value) =>
      Math.max(1, value - 1)
    );

  const increaseChildren = () =>
    setChildren((value) => value + 1);

  const decreaseChildren = () =>
    setChildren((value) =>
      Math.max(0, value - 1)
    );

  return (
    <div className="w-full min-w-0">
      <div className="rounded-2xl border border-neutral-300 bg-white/70 p-3 shadow-lg backdrop-blur-md">
        <div className="grid min-w-0 grid-cols-2 gap-2.5 lg:grid-cols-7">
          {/* KHÁCH SẠN */}
          <div className="col-span-2 min-w-0 lg:col-span-2">
            <label className="mb-1 block text-xs font-medium text-neutral-900 sm:text-sm">
              {isVi ? "Khách sạn" : "Hotel"}
            </label>

            <select
              value={hotel}
              onChange={(e) =>
                setHotel(e.target.value)
              }
              className="h-10 w-full min-w-0 rounded-xl border border-neutral-400 bg-white px-3 text-sm text-neutral-900 shadow-sm outline-none transition hover:border-neutral-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 sm:px-4"
            >
              <option value="">
                {isVi
                  ? "Chọn khách sạn"
                  : "Select hotel"}
              </option>

              {hotels.map((item) => {
                const displayName =
                  language === "vi"
                    ? item.name_vi || item.name
                    : item.name_en || item.name;

                return (
                  <option
                    key={item.id}
                    value={item.slug}
                  >
                    {displayName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* NGÀY NHẬN */}
          <div className="min-w-0 lg:col-span-1">
            <label className="mb-1 block text-xs font-medium text-neutral-900 sm:text-sm">
              {isVi
                ? "Ngày nhận"
                : "Check-in"}
            </label>

            <div
              onClick={() =>
                openDatePicker(checkInRef)
              }
              className="relative flex h-10 w-full min-w-0 cursor-pointer items-center overflow-hidden rounded-xl border border-neutral-400 bg-white px-2.5 shadow-sm transition hover:border-neutral-500 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 sm:px-3"
            >
              <input
                ref={checkInRef}
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => {
                  const value = e.target.value;

                  setCheckIn(value);

                  if (
                    checkOut &&
                    value >= checkOut
                  ) {
                    setCheckOut("");
                  }
                }}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />

              {checkIn ? (
                <span className="relative z-0 block w-full truncate whitespace-nowrap text-xs text-neutral-900 sm:text-sm">
                  {checkIn}
                </span>
              ) : (
                <span className="relative z-0 block w-full truncate whitespace-nowrap text-xs text-neutral-400 sm:text-sm">
                  {isVi
                    ? "Chọn ngày"
                    : "Select date"}
                </span>
              )}
            </div>
          </div>

          {/* NGÀY TRẢ */}
          <div className="min-w-0 lg:col-span-1">
            <label className="mb-1 block text-xs font-medium text-neutral-900 sm:text-sm">
              {isVi
                ? "Ngày trả"
                : "Check-out"}
            </label>

            <div
              onClick={() =>
                openDatePicker(checkOutRef)
              }
              className="relative flex h-10 w-full min-w-0 cursor-pointer items-center overflow-hidden rounded-xl border border-neutral-400 bg-white px-2.5 shadow-sm transition hover:border-neutral-500 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 sm:px-3"
            >
              <input
                ref={checkOutRef}
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => {
                  const value = e.target.value;

                  if (
                    checkIn &&
                    value <= checkIn
                  ) {
                    setCheckOut("");
                  } else {
                    setCheckOut(value);
                  }
                }}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />

              {checkOut ? (
                <span className="relative z-0 block w-full truncate whitespace-nowrap text-xs text-neutral-900 sm:text-sm">
                  {checkOut}
                </span>
              ) : (
                <span className="relative z-0 block w-full truncate whitespace-nowrap text-xs text-neutral-400 sm:text-sm">
                  {isVi
                    ? "Chọn ngày"
                    : "Select date"}
                </span>
              )}
            </div>
          </div>

          {/* NGƯỜI LỚN */}
          <div className="min-w-0 lg:col-span-1">
            <label className="mb-1 block text-xs font-medium text-neutral-900 sm:text-sm">
              {isVi
                ? "Người lớn"
                : "Adults"}
            </label>

            <div className="flex h-10 w-full min-w-0 items-center justify-between rounded-xl border border-neutral-400 bg-white px-1 shadow-sm transition hover:border-neutral-500 sm:px-2">
              <button
                type="button"
                onClick={decreaseAdults}
                disabled={adults <= 1}
                aria-label={
                  isVi
                    ? "Giảm số người lớn"
                    : "Decrease adults"
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg font-medium text-neutral-900 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                −
              </button>

              <span className="min-w-[24px] text-center text-sm font-medium text-neutral-900">
                {adults}
              </span>

              <button
                type="button"
                onClick={increaseAdults}
                aria-label={
                  isVi
                    ? "Tăng số người lớn"
                    : "Increase adults"
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg font-medium text-neutral-900 transition hover:bg-neutral-100"
              >
                +
              </button>
            </div>
          </div>

          {/* TRẺ EM */}
          <div className="min-w-0 lg:col-span-1">
            <label className="mb-1 block text-xs font-medium text-neutral-900 sm:text-sm">
              {isVi
                ? "Trẻ em"
                : "Children"}
            </label>

            <div className="flex h-10 w-full min-w-0 items-center justify-between rounded-xl border border-neutral-400 bg-white px-1 shadow-sm transition hover:border-neutral-500 sm:px-2">
              <button
                type="button"
                onClick={decreaseChildren}
                disabled={children <= 0}
                aria-label={
                  isVi
                    ? "Giảm số trẻ em"
                    : "Decrease children"
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg font-medium text-neutral-900 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                −
              </button>

              <span className="min-w-[24px] text-center text-sm font-medium text-neutral-900">
                {children}
              </span>

              <button
                type="button"
                onClick={increaseChildren}
                aria-label={
                  isVi
                    ? "Tăng số trẻ em"
                    : "Increase children"
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg font-medium text-neutral-900 transition hover:bg-neutral-100"
              >
                +
              </button>
            </div>
          </div>

          {/* TÌM PHÒNG */}
          <div className="col-span-2 flex items-end lg:col-span-1">
            <button
              type="button"
              onClick={handleSearch}
              className="h-10 w-full rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.99]"
            >
              {isVi
                ? "Tìm phòng"
                : "Search Rooms"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}