"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

type Language = "vi" | "en";
export type HotelOption = {
  id: number;
  name: string;
  slug: string;
};
type BookingSearchProps = {
  hotels: HotelOption[];
};

declare global {
  interface WindowEventMap {
    "language-change": CustomEvent<Language>;
  }
}

export default function BookingSearch({ hotels }: BookingSearchProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("vi");
  const [hotel, setHotel] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split("T")[0];

  // Đồng bộ ngôn ngữ
  useEffect(() => {
    const saved = localStorage.getItem("huyen-language");
    if (saved === "vi" || saved === "en") setLanguage(saved);
    const handler = (e: CustomEvent<Language>) => setLanguage(e.detail);
    window.addEventListener("language-change", handler);
    return () => window.removeEventListener("language-change", handler);
  }, []);

  const isVi = language === "vi";

  const openDatePicker = useCallback((inputRef: React.RefObject<HTMLInputElement | null>) => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    if ("showPicker" in input) {
      try { input.showPicker(); } catch {}
    }
  }, []);

  const handleSearch = useCallback(() => {
    // ✅ Kiểm tra đầy đủ thông tin
    if (!hotel) {
      alert(isVi ? "Vui lòng chọn khách sạn" : "Please select a hotel");
      return;
    }
    if (!checkIn || !checkOut) {
      alert(isVi ? "Vui lòng chọn ngày nhận và trả phòng" : "Please select check-in and check-out dates");
      return;
    }
    if (checkOut <= checkIn) {
      alert(isVi ? "Ngày trả phòng phải sau ngày nhận phòng" : "Check-out must be after check-in date");
      return;
    }

    const params = new URLSearchParams();
    params.set("hotel", hotel);
    params.set("checkIn", checkIn);
    params.set("checkOut", checkOut);
    params.set("adults", String(adults));
    params.set("children", String(children));
    router.push(`/tim-phong?${params.toString()}`);
  }, [hotel, checkIn, checkOut, adults, children, router, isVi]);

  const increaseAdults = () => setAdults(v => v + 1);
  const decreaseAdults = () => setAdults(v => Math.max(1, v - 1));
  const increaseChildren = () => setChildren(v => v + 1);
  const decreaseChildren = () => setChildren(v => Math.max(0, v - 1));

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-neutral-300 bg-white/70 p-2.5 shadow-lg backdrop-blur-md">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-7">
          
          {/* KHÁCH SẠN */}
          <div className="lg:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              {isVi ? "Khách sạn" : "Hotel"}
            </label>
            <select
              value={hotel}
              onChange={(e) => setHotel(e.target.value)}
              className="h-9 w-full rounded-xl border border-neutral-400 bg-white px-4 text-sm text-neutral-900 shadow-sm outline-none transition hover:border-neutral-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">{isVi ? "Chọn khách sạn" : "Select hotel"}</option>
              {hotels.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* NHẬN PHÒNG */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              {isVi ? "Nhận phòng" : "Check-in"}
            </label>
            <div
              onClick={() => openDatePicker(checkInRef)}
              className="relative flex h-9 w-full cursor-pointer items-center rounded-xl border border-neutral-400 bg-white px-4 shadow-sm transition hover:border-neutral-500 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20"
            >
              <input
                ref={checkInRef}
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => {
                  const val = e.target.value;
                  setCheckIn(val);
                  if (checkOut && val >= checkOut) setCheckOut("");
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {checkIn || <span className="text-neutral-400 text-sm">{isVi ? "Chọn ngày" : "Select date"}</span>}
              {checkIn && <span className="text-neutral-900 text-sm">{checkIn}</span>}
            </div>
          </div>

          {/* TRẢ PHÒNG */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              {isVi ? "Trả phòng" : "Check-out"}
            </label>
            <div
              onClick={() => openDatePicker(checkOutRef)}
              className="relative flex h-9 w-full cursor-pointer items-center rounded-xl border border-neutral-400 bg-white px-4 shadow-sm transition hover:border-neutral-500 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20"
            >
              <input
                ref={checkOutRef}
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => {
                  const val = e.target.value;
                  if (checkIn && val <= checkIn) {
                    setCheckOut("");
                  } else {
                    setCheckOut(val);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {checkOut || <span className="text-neutral-400 text-sm">{isVi ? "Chọn ngày" : "Select date"}</span>}
              {checkOut && <span className="text-neutral-900 text-sm">{checkOut}</span>}
            </div>
          </div>

          {/* NGƯỜI LỚN */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              {isVi ? "Người lớn" : "Adults"}
            </label>
            <div className="flex h-9 w-full items-center justify-between rounded-xl border border-neutral-400 bg-white px-2 shadow-sm transition hover:border-neutral-500">
              <button
                type="button"
                onClick={decreaseAdults}
                disabled={adults <= 1}
                aria-label={isVi ? "Giảm số người lớn" : "Decrease adults"}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-lg font-medium text-neutral-900 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                −
              </button>
              <span className="min-w-[32px] text-center text-sm font-medium text-neutral-900">
                {adults}
              </span>
              <button
                type="button"
                onClick={increaseAdults}
                aria-label={isVi ? "Tăng số người lớn" : "Increase adults"}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-lg font-medium text-neutral-900 transition hover:bg-neutral-100"
              >
                +
              </button>
            </div>
          </div>

          {/* TRẺ EM */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-900">
              {isVi ? "Trẻ em" : "Children"}
            </label>
            <div className="flex h-9 w-full items-center justify-between rounded-xl border border-neutral-400 bg-white px-2 shadow-sm transition hover:border-neutral-500">
              <button
                type="button"
                onClick={decreaseChildren}
                disabled={children <= 0}
                aria-label={isVi ? "Giảm số trẻ em" : "Decrease children"}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-lg font-medium text-neutral-900 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                −
              </button>
              <span className="min-w-[32px] text-center text-sm font-medium text-neutral-900">
                {children}
              </span>
              <button
                type="button"
                onClick={increaseChildren}
                aria-label={isVi ? "Tăng số trẻ em" : "Increase children"}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-lg font-medium text-neutral-900 transition hover:bg-neutral-100"
              >
                +
              </button>
            </div>
          </div>

          {/* NÚT TÌM */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSearch}
              className="h-9 w-full rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.99]"
            >
              {isVi ? "Tìm phòng" : "Search Rooms"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}