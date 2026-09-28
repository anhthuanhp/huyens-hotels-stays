"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Language = "vi" | "en";

type Hotel = {
  id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
};

type HotelBookingSidebarProps = {
  hotel: Hotel;
  hotels: Hotel[];
};

export default function HotelBookingSidebar({
  hotel,
  hotels,
}: HotelBookingSidebarProps) {
  const router = useRouter();

  const [language, setLanguage] =
    useState<Language>("vi");

  const [selectedHotel, setSelectedHotel] =
    useState(hotel.slug);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");

  const [error, setError] = useState("");

  useEffect(() => {
    const savedLanguage =
      window.localStorage.getItem("language");

    setLanguage(
      savedLanguage === "en" ? "en" : "vi"
    );

    const handleLanguageChange = () => {
      const currentLanguage =
        window.localStorage.getItem("language");

      setLanguage(
        currentLanguage === "en"
          ? "en"
          : "vi"
      );
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
    setSelectedHotel(hotel.slug);
  }, [hotel.slug]);

  const getHotelName = (item: Hotel) => {
    if (language === "vi") {
      return (
        item.name_vi ||
        item.name_en ||
        item.slug
      );
    }

    return (
      item.name_en ||
      item.name_vi ||
      item.slug
    );
  };

  const handleSearch = () => {
    setError("");

    if (!selectedHotel) {
      setError(
        language === "vi"
          ? "Vui lòng chọn khách sạn."
          : "Please select a hotel."
      );

      return;
    }

    if (!checkIn || !checkOut) {
      setError(
        language === "vi"
          ? "Vui lòng chọn ngày nhận và ngày trả."
          : "Please select check-in and check-out dates."
      );

      return;
    }

    if (checkOut <= checkIn) {
      setError(
        language === "vi"
          ? "Ngày trả phải sau ngày nhận."
          : "Check-out date must be after check-in date."
      );

      return;
    }

    const params = new URLSearchParams();

    params.set(
      "hotel",
      selectedHotel
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
      adults
    );

    params.set(
      "children",
      children
    );

    router.push(
      `/tim-phong?${params.toString()}`
    );
  };

  return (
    <aside className="w-full">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-xl font-semibold text-slate-900">
          {language === "vi"
            ? "Tìm phòng"
            : "Find a room"}
        </h2>

        <div className="space-y-4">
          {/* KHÁCH SẠN */}
          <div>
            <label
              htmlFor="hotel-booking-hotel"
              className="mb-1.5 block text-sm font-medium text-slate-800"
            >
              {language === "vi"
                ? "Khách sạn"
                : "Hotel"}
            </label>

            <select
              id="hotel-booking-hotel"
              value={selectedHotel}
              onChange={(event) =>
                setSelectedHotel(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500"
            >
              {hotels.map((item) => (
                <option
                  key={item.id}
                  value={item.slug}
                >
                  {getHotelName(item)}
                </option>
              ))}
            </select>
          </div>

          {/* NGÀY */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="hotel-booking-checkin"
                className="mb-1.5 block text-sm font-medium text-slate-800"
              >
                {language === "vi"
                  ? "Ngày nhận"
                  : "Check-in"}
              </label>

              <input
                id="hotel-booking-checkin"
                type="date"
                value={checkIn}
                onChange={(event) =>
                  setCheckIn(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="hotel-booking-checkout"
                className="mb-1.5 block text-sm font-medium text-slate-800"
              >
                {language === "vi"
                  ? "Ngày trả"
                  : "Check-out"}
              </label>

              <input
                id="hotel-booking-checkout"
                type="date"
                value={checkOut}
                min={
                  checkIn || undefined
                }
                onChange={(event) =>
                  setCheckOut(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500"
              />
            </div>
          </div>

          {/* KHÁCH */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="hotel-booking-adults"
                className="mb-1.5 block text-sm font-medium text-slate-800"
              >
                {language === "vi"
                  ? "Người lớn"
                  : "Adults"}
              </label>

              <select
                id="hotel-booking-adults"
                value={adults}
                onChange={(event) =>
                  setAdults(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500"
              >
                {Array.from(
                  { length: 10 },
                  (_, index) => index + 1
                ).map((value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="hotel-booking-children"
                className="mb-1.5 block text-sm font-medium text-slate-800"
              >
                {language === "vi"
                  ? "Trẻ em"
                  : "Children"}
              </label>

              <select
                id="hotel-booking-children"
                value={children}
                onChange={(event) =>
                  setChildren(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500"
              >
                {Array.from(
                  { length: 6 },
                  (_, index) => index
                ).map((value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* SEARCH */}
          <button
            type="button"
            onClick={handleSearch}
            className="h-11 w-full rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            {language === "vi"
              ? "Tìm phòng"
              : "Search rooms"}
          </button>
        </div>
      </div>
    </aside>
  );
}