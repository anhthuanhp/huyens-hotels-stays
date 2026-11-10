
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  Search,
  UserRound,
  Minus,
  Plus,
} from "lucide-react";
import { localizedHref } from "@/app/lib/localized-path";
import { useLanguage } from "@/app/lib/use-language";

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
  stayMode?: "short" | "long";
  floating?: boolean;
};

function localToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookingSearch({
  hotels,
  initialHotelSlug = "",
  stayMode = "short",
  floating = false,
}: BookingSearchProps) {
  const router = useRouter();
  const language = useLanguage();
  const isVi = language === "vi";

  const [selection, setSelection] = useState({
    source: initialHotelSlug,
    value: initialHotelSlug,
  });

  if (selection.source !== initialHotelSlug) {
    setSelection({
      source: initialHotelSlug,
      value: initialHotelSlug,
    });
  }

  const hotel =
    selection.source === initialHotelSlug
      ? selection.value
      : initialHotelSlug;

  const setHotel = (value: string) =>
    setSelection({ source: initialHotelSlug, value });

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);

  const openDatePicker = (
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    const input = inputRef.current;
    if (!input) return;

    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      } else {
        input.focus();
        input.click();
      }
    } catch {
      input.focus();
    }
  };

  const today = localToday();

  useEffect(() => {
    if (!guestsOpen) return;

    const closeOutside = (event: MouseEvent) => {
      if (
        !guestsRef.current?.contains(event.target as Node)
      ) {
        setGuestsOpen(false);
      }
    };

    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setGuestsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);

    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [guestsOpen]);

  const handleSearch = () => {
    if (stayMode === "long") {
      window.alert(
        isVi
          ? "Chức năng tìm thuê dài hạn đang được hoàn thiện."
          : "Long-stay search is coming soon."
      );
      return;
    }

    if (!hotel) {
      window.alert(
        isVi
          ? "Vui lòng chọn cơ sở lưu trú."
          : "Please select a property."
      );
      return;
    }

    if (!checkIn || !checkOut) {
      window.alert(
        isVi
          ? "Vui lòng chọn ngày nhận và trả phòng."
          : "Please select check-in and check-out dates."
      );
      return;
    }

    if (checkIn < localToday()) {
      window.alert(
        isVi
          ? "Ngày nhận phòng không được ở trong quá khứ."
          : "Check-in cannot be in the past."
      );
      return;
    }

    if (checkOut <= checkIn) {
      window.alert(
        isVi
          ? "Ngày trả phòng phải sau ngày nhận phòng."
          : "Check-out must be after check-in."
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
      localizedHref(
        `/tim-phong?${params.toString()}`,
        language
      )
    );
  };

  const guestText = isVi
    ? `${adults + children} khách`
    : `${adults + children} guests`;

  const fieldBase =
    "flex min-h-[48px] min-w-0 items-center gap-[10px] rounded-lg border border-[#e2e5e2] px-3 lg:rounded-none lg:border-0 lg:border-r lg:border-[#e0e4e1] lg:px-0 lg:pr-3";

  const smallLabel =
    "block text-[10px] font-medium leading-4 text-[#777]";

  const inputBase =
    "block w-full min-w-0 border-0 bg-transparent p-0 text-[12px] font-bold text-[#151b18] outline-none";

  return (
    <div
      className={`relative z-40 mx-auto w-[calc(100%-24px)] max-w-[972px] ${
        floating ? "-mt-[35px]" : "mt-4"
      }`}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch();
        }}
        aria-label={
          isVi ? "Tìm phòng" : "Room search"
        }
        className="grid grid-cols-2 items-center gap-2 rounded-[18px] bg-white p-[10px] text-[#151b18] shadow-[0_5px_18px_rgba(0,0,0,.18)] lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:gap-0 lg:px-5"
      >
        {/* Cơ sở lưu trú */}
        <label
          className={`${fieldBase} col-span-2 lg:col-span-1`}
        >
          <Building2
            size={20}
            className="shrink-0 text-[#151b18]"
            aria-hidden="true"
          />

          <span className="min-w-0 flex-1">
            <span className={smallLabel}>
              {isVi
                ? "Chọn cơ sở lưu trú"
                : "Choose a property"}
            </span>
            <select
              value={hotel}
              onChange={(event) => setHotel(event.target.value)}
              className={`${inputBase} appearance-none cursor-pointer`}
              aria-label={
                isVi
                  ? "Cơ sở lưu trú"
                  : "Property"
              }
            >
              <option value="">
                {isVi
                  ? "Chọn cơ sở"
                  : "Select property"}
              </option>

              {hotels.map((item) => (
                <option key={item.id} value={item.slug}>
                  {(isVi
                    ? item.name_vi
                    : item.name_en) || item.name}
                </option>
              ))}
            </select>
          </span>
          <ChevronDown
            size={16}
            className="pointer-events-none shrink-0"
            aria-hidden="true"
          />
        </label>

        {/* Ngày nhận phòng */}
        <div className={`${fieldBase} relative cursor-pointer`}>
          <CalendarDays
            size={20}
            className="shrink-0"
            aria-hidden="true"
          />

          <span className="min-w-0 flex-1">
            <span className={smallLabel}>
              {isVi ? "Ngày nhận phòng" : "Check-in"}
            </span>

            <span className="block text-[12px] font-bold text-[#151b18]">
              {checkIn
                ? checkIn.split("-").reverse().join("/")
                : "dd/mm/yyyy"}
            </span>
          </span>

          <input
            ref={checkInRef}
            type="date"
            min={today}
            value={checkIn}
            onClick={() => openDatePicker(checkInRef)}
            onChange={(event) => {
              const next = event.target.value;
              setCheckIn(next);

              if (checkOut && checkOut <= next) {
                setCheckOut("");
              }
            }}
            aria-label={isVi ? "Ngày nhận phòng" : "Check-in"}
            className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
          />
        </div>
{/* Ngày trả phòng */}
        <div className={`${fieldBase} relative cursor-pointer`}>
          <CalendarDays
            size={20}
            className="shrink-0"
            aria-hidden="true"
          />

          <span className="min-w-0 flex-1">
            <span className={smallLabel}>
              {isVi ? "Ngày trả phòng" : "Check-out"}
            </span>

            <span className="block text-[12px] font-bold text-[#151b18]">
              {checkOut
                ? checkOut.split("-").reverse().join("/")
                : "dd/mm/yyyy"}
            </span>
          </span>

          <input
            ref={checkOutRef}
            type="date"
            min={checkIn || today}
            value={checkOut}
            onClick={() => openDatePicker(checkOutRef)}
            onChange={(event) => {
              const next = event.target.value;

              if (checkIn && next <= checkIn) {
                setCheckOut("");
              } else {
                setCheckOut(next);
              }
            }}
            aria-label={isVi ? "Ngày trả phòng" : "Check-out"}
            className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
          />
        </div>
{/* Số khách: người lớn và trẻ em */}
        <div
          ref={guestsRef}
          className="relative min-w-0 lg:mr-3"
        >
          <button
            type="button"
            onClick={() => setGuestsOpen((open) => !open)}
            aria-expanded={guestsOpen}
            aria-controls="huyen-guest-picker"
            className={`${fieldBase} w-full text-left`}
          >
            <UserRound
              size={20}
              className="shrink-0"
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
              <span className={smallLabel}>
                {isVi ? "Số khách" : "Guests"}
              </span>
              <span className="block truncate text-[12px] font-bold">
                {guestText}
              </span>
            </span>
            <ChevronDown
              size={16}
              className="shrink-0"
              aria-hidden="true"
            />
          </button>

          {guestsOpen && (
            <div
              id="huyen-guest-picker"
              className="absolute right-0 top-[calc(100%+10px)] z-[60] w-[260px] max-w-[calc(100vw-32px)] rounded-xl border border-neutral-200 bg-white p-4 shadow-xl"
            >
              {[
                {
                  key: "adults",
                  title: isVi ? "Người lớn" : "Adults",
                  value: adults,
                  min: 1,
                  onChange: setAdults,
                },
                {
                  key: "children",
                  title: isVi ? "Trẻ em" : "Children",
                  value: children,
                  min: 0,
                  onChange: setChildren,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <span className="text-sm font-medium">
                    {item.title}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={item.value <= item.min}
                      onClick={() =>
                        item.onChange((value) =>
                          Math.max(item.min, value - 1)
                        )
                      }
                      aria-label={
                        isVi
                          ? `Giảm ${item.title}`
                          : `Decrease ${item.title}`
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 disabled:opacity-30"
                    >
                      <Minus size={15} />
                    </button>

                    <span className="w-5 text-center text-sm font-semibold">
                      {item.value}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        item.onChange((value) => value + 1)
                      }
                      aria-label={
                        isVi
                          ? `Tăng ${item.title}`
                          : `Increase ${item.title}`
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setGuestsOpen(false)}
                className="mt-3 w-full rounded-lg bg-[#0a6b36] px-3 py-2 text-sm font-semibold text-white"
              >
                {isVi ? "Xong" : "Done"}
              </button>
            </div>
          )}
        </div>

        {/* Tìm phòng */}
        <button
          type="submit"
          className="col-span-2 flex min-h-[44px] items-center justify-center gap-2 rounded-[21px] bg-[#0a6b36] px-5 text-[12px] font-bold text-white transition-colors hover:bg-[#08562b] lg:col-span-1"
        >
          <Search size={18} aria-hidden="true" />
          {isVi ? "Tìm phòng" : "Find a room"}
        </button>
      </form>
    </div>
  );
}
