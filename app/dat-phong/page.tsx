
"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

type Language = "vi" | "en";

type BookingRoom = {
  roomSlug: string;
  quantity: number;
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
  base_price: number | null;
  quantity: number | null;
  status: "active" | "inactive";
};

type SelectedRoomDetail = Room & {
  selectedQuantity: number;
};

type BookingApiResponse = {
  success?: boolean;
  error?: string;
  roomSlug?: string;
  availableQuantity?: number;
  booking?: {
    id: number;
    bookingCode: string;
    hotelSlug: string;
    hotelNameVi: string;
    hotelNameEn: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    adults: number;
    children: number;
    fullName: string;
    email: string;
    phone: string;
    note: string;
    rooms: {
      booking_id: number;
      room_id: number;
      quantity: number;
      price_per_night: number;
    }[];
    totalAmount: number;
  };
};

function DatPhongContent() {
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "vi";
    }

    const savedLanguage = localStorage.getItem("huyen-language");

    return savedLanguage === "vi" || savedLanguage === "en"
      ? savedLanguage
      : "vi";
  });

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] =
    useState<BookingApiResponse["booking"]>(undefined);

  const hotelSlug = searchParams.get("hotel") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const adults = Math.max(
    1,
    Number(searchParams.get("adults") || 1)
  );
  const children = Math.max(
    0,
    Number(searchParams.get("children") || 0)
  );
  const roomsParam = searchParams.get("rooms");
  const oldRoomParam = searchParams.get("room");

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

  const selectedRooms = useMemo<BookingRoom[]>(() => {
    if (roomsParam) {
      try {
        const parsed = JSON.parse(roomsParam);

        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => ({
              roomSlug: String(item?.roomSlug || "").trim(),
              quantity: Number(item?.quantity || 0),
            }))
            .filter(
              (item) =>
                item.roomSlug &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0
            );
        }
      } catch {
        return [];
      }
    }

    if (oldRoomParam) {
      return [
        {
          roomSlug: oldRoomParam.trim(),
          quantity: 1,
        },
      ];
    }

    return [];
  }, [roomsParam, oldRoomParam]);

  useEffect(() => {
    let cancelled = false;

    async function loadBookingData() {
      if (!hotelSlug) {
        setHotel(null);
        setRooms([]);
        setLoadingData(false);
        return;
      }

      setLoadingData(true);
      setDataError("");

      try {
        const { data: hotelData, error: hotelError } =
          await supabase
            .from("hotels")
            .select(
              "id, slug, name_vi, name_en, status"
            )
            .eq("slug", hotelSlug)
            .eq("status", "active")
            .maybeSingle();

        if (hotelError) {
          throw new Error(hotelError.message);
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

        const currentHotel = hotelData as Hotel;

        setHotel(currentHotel);

        const { data: roomData, error: roomError } =
          await supabase
            .from("rooms")
            .select(
              "id, hotel_id, slug, name_vi, name_en, base_price, quantity, status"
            )
            .eq("hotel_id", currentHotel.id)
            .eq("status", "active")
            .order("id", { ascending: true });

        if (roomError) {
          throw new Error(roomError.message);
        }

        if (cancelled) {
          return;
        }

        setRooms((roomData || []) as Room[]);
      } catch (loadError) {
        console.error(
          "Load booking page data error:",
          loadError
        );

        if (!cancelled) {
          setHotel(null);
          setRooms([]);
          setDataError(
            language === "vi"
              ? "Không thể tải thông tin đặt phòng."
              : "Unable to load booking information."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    }

    loadBookingData();

    return () => {
      cancelled = true;
    };
  }, [hotelSlug, language]);

  const selectedRoomDetails = useMemo<
    SelectedRoomDetail[]
  >(() => {
    return selectedRooms
      .map((selectedRoom) => {
        const room = rooms.find(
          (item) =>
            item.slug === selectedRoom.roomSlug &&
            item.hotel_id === hotel?.id
        );

        if (!room) {
          return null;
        }

        return {
          ...room,
          selectedQuantity: selectedRoom.quantity,
        };
      })
      .filter(
        (room): room is SelectedRoomDetail =>
          room !== null
      );
  }, [selectedRooms, rooms, hotel]);

  const totalRoomCount = useMemo(
    () =>
      selectedRooms.reduce(
        (sum, room) => sum + room.quantity,
        0
      ),
    [selectedRooms]
  );

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return 0;
    }

    const msPerDay = 86400000;

    return Math.max(
      0,
      Math.floor(
        (end.getTime() - start.getTime()) / msPerDay
      )
    );
  }, [checkIn, checkOut]);

  const totalPrice = useMemo(() => {
    return selectedRoomDetails.reduce((sum, room) => {
      if (
        room.base_price === null ||
        room.base_price === undefined
      ) {
        return sum;
      }

      return (
        sum +
        Number(room.base_price) *
          room.selectedQuantity *
          nights
      );
    }, 0);
  }, [selectedRoomDetails, nights]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(
      language === "vi" ? "vi-VN" : "en-US"
    ).format(price);

  const formatDate = (value: string) => {
    if (!value) {
      return "-";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat(
      language === "vi" ? "vi-VN" : "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    ).format(date);
  };

  const handlePhoneChange = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, "");

    if (cleaned.includes("+")) {
      cleaned = "+" + cleaned.replace(/\+/g, "");
    }

    cleaned = cleaned.slice(0, 12);

    setPhone(cleaned);

    if (phoneError) {
      setPhoneError("");
    }

    setError("");
  };

  const validatePhone = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return language === "vi"
        ? "Vui lòng nhập số điện thoại."
        : "Please enter your phone number.";
    }

    const phoneRegex = /^(0\d{9}|\+84\d{9})$/;

    if (!phoneRegex.test(trimmed)) {
      return language === "vi"
        ? "Số điện thoại không hợp lệ. Vui lòng nhập 10 số bắt đầu bằng 0 hoặc dạng +84xxxxxxxxx."
        : "Invalid phone number. Please enter 10 digits starting with 0 or use the +84xxxxxxxxx format.";
    }

    return "";
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (emailError) {
      setEmailError("");
    }

    setError("");
  };

  const validateEmail = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(trimmed)) {
      return language === "vi"
        ? "Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại."
        : "Invalid email address. Please check it again.";
    }

    return "";
  };

  const validateForm = () => {
    if (!hotelSlug) {
      return language === "vi"
        ? "Thiếu thông tin khách sạn."
        : "Missing hotel information.";
    }

    if (!hotel) {
      return language === "vi"
        ? "Không tìm thấy khách sạn."
        : "Hotel not found.";
    }

    if (!checkIn || !checkOut) {
      return language === "vi"
        ? "Thiếu ngày nhận hoặc trả phòng."
        : "Missing check-in or check-out date.";
    }

    if (checkOut <= checkIn) {
      return language === "vi"
        ? "Ngày trả phòng phải sau ngày nhận phòng."
        : "Check-out must be after check-in.";
    }

    if (nights <= 0) {
      return language === "vi"
        ? "Số đêm lưu trú không hợp lệ."
        : "Invalid number of nights.";
    }

    if (selectedRooms.length === 0) {
      return language === "vi"
        ? "Chưa có phòng được chọn."
        : "No rooms selected.";
    }

    if (
      selectedRoomDetails.length !==
      selectedRooms.length
    ) {
      return language === "vi"
        ? "Có phòng không thuộc khách sạn này hoặc không còn hoạt động."
        : "One or more selected rooms do not belong to this hotel or are inactive.";
    }

    for (const room of selectedRoomDetails) {
      if (
        room.base_price === null ||
        room.base_price === undefined
      ) {
        return language === "vi"
          ? `Chưa có giá cho phòng ${room.name_vi}.`
          : `Price not set for ${room.name_en}.`;
      }

      const selectedQuantity = Number(
        room.selectedQuantity
      );

      const availableQuantity = Math.max(
        Number(room.quantity || 0),
        0
      );

      if (
        !Number.isInteger(selectedQuantity) ||
        selectedQuantity < 1
      ) {
        return language === "vi"
          ? `Số lượng phòng ${room.name_vi} không hợp lệ.`
          : `Invalid quantity for ${room.name_en}.`;
      }

      if (availableQuantity <= 0) {
        return language === "vi"
          ? `Loại phòng ${room.name_vi} hiện đã hết phòng.`
          : `${room.name_en} is currently sold out.`;
      }

      if (selectedQuantity > availableQuantity) {
        return language === "vi"
          ? `Loại phòng ${room.name_vi} chỉ còn ${availableQuantity} phòng.`
          : `${room.name_en} only has ${availableQuantity} room(s) available.`;
      }
    }

    if (!fullName.trim()) {
      return language === "vi"
        ? "Vui lòng nhập họ tên."
        : "Please enter your full name.";
    }

    const phoneValidation = validatePhone(phone);

    if (phoneValidation) {
      setPhoneError(phoneValidation);
      return phoneValidation;
    }

    const emailValidation = validateEmail(email);

    if (emailValidation) {
      setEmailError(emailValidation);
      return emailValidation;
    }

    return "";
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setPhoneError("");
    setEmailError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          hotelSlug,
          checkIn,
          checkOut,
          adults,
          children,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          note: note.trim(),
          rooms: selectedRooms,
        }),
      });

      const result =
        (await response.json()) as BookingApiResponse;

      if (
        !response.ok ||
        !result.success ||
        !result.booking
      ) {
        setError(
          result.error ||
            (response.status === 409
              ? language === "vi"
                ? "Phòng vừa được đặt bởi khách khác. Vui lòng quay lại và chọn lại."
                : "The room was just booked by another guest. Please go back and select again."
              : language === "vi"
                ? "Không thể hoàn tất đặt phòng."
                : "Unable to complete the booking.")
        );

        return;
      }

      setConfirmed(result.booking);
    } catch (requestError) {
      console.error(
        "Booking request error:",
        requestError
      );

      setError(
        language === "vi"
          ? "Không thể kết nối đến máy chủ. Vui lòng thử lại."
          : "Unable to connect to the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-700">
              ✓
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
              {language === "vi"
                ? "Đặt phòng thành công"
                : "Booking confirmed"}
            </p>

            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              {language === "vi"
                ? "Cảm ơn bạn đã đặt phòng"
                : "Thank you for your booking"}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              {language === "vi"
                ? "Chúng tôi sẽ liên hệ với Quý khách sớm nhất có thể."
                : "We will contact you as soon as possible."}
            </p>

            <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-slate-50 p-6 text-left">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">
                    {language === "vi"
                      ? "Mã đặt phòng"
                      : "Booking code"}
                  </p>
                  <p className="mt-1 text-xl font-bold text-sky-700">
                    {confirmed.bookingCode}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    {language === "vi"
                      ? "Khách sạn"
                      : "Hotel"}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {language === "vi"
                      ? confirmed.hotelNameVi
                      : confirmed.hotelNameEn}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    {language === "vi"
                      ? "Khách"
                      : "Guest"}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {confirmed.fullName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    {language === "vi"
                      ? "Điện thoại"
                      : "Phone"}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {confirmed.phone}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    {language === "vi"
                      ? "Nhận phòng"
                      : "Check-in"}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDate(confirmed.checkIn)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    {language === "vi"
                      ? "Trả phòng"
                      : "Check-out"}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDate(confirmed.checkOut)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    {language === "vi"
                      ? "Số đêm"
                      : "Nights"}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {confirmed.nights}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    {language === "vi"
                      ? "Số phòng"
                      : "Rooms"}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {confirmed.rooms.reduce(
                      (sum, room) =>
                        sum + Number(room.quantity),
                      0
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <p className="text-sm font-semibold text-slate-700">
                  {language === "vi"
                    ? "Thông tin liên hệ"
                    : "Contact information"}
                </p>

                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-800">
                      {language === "vi"
                        ? "Điện thoại:"
                        : "Phone:"}
                    </span>{" "}
                    {confirmed.phone}
                  </p>

                  {confirmed.email && (
                    <p>
                      <span className="font-medium text-slate-800">
                        Email:
                      </span>{" "}
                      {confirmed.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <p className="text-sm text-slate-500">
                  {language === "vi"
                    ? "Tổng tiền"
                    : "Total"}
                </p>

                <p className="mt-1 text-2xl font-bold text-sky-700">
                  {formatPrice(
                    Number(confirmed.totalAmount)
                  )}{" "}
                  {language === "vi" ? "đ" : "VND"}
                </p>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-xl">
              <p className="mb-4 text-sm text-slate-500">
                {language === "vi"
                  ? "Thông tin đặt phòng đã được ghi nhận."
                  : "Your booking information has been recorded."}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/#booking-search"
                  className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  {language === "vi"
                    ? "Tìm phòng mới"
                    : "Find another room"}
                </Link>

                <Link
                  href="/"
                  className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {language === "vi"
                    ? "Về trang chủ"
                    : "Back to home"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!hotelSlug || !checkIn || !checkOut) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-slate-900">
            {language === "vi"
              ? "Thiếu thông tin đặt phòng"
              : "Missing booking information"}
          </h1>

          <p className="mt-3 text-slate-500">
            {language === "vi"
              ? "Vui lòng quay lại và chọn khách sạn, ngày lưu trú và phòng."
              : "Please go back and select a hotel, stay dates and room."}
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
          >
            {language === "vi"
              ? "Về trang chủ"
              : "Back to home"}
          </Link>
        </div>
      </main>
    );
  }

  if (loadingData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />

          <p className="mt-4 text-sm text-slate-500">
            {language === "vi"
              ? "Đang tải thông tin đặt phòng..."
              : "Loading booking information..."}
          </p>
        </div>
      </main>
    );
  }

  if (dataError || !hotel) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
            !
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-slate-900">
            {language === "vi"
              ? "Không thể tải thông tin"
              : "Unable to load information"}
          </h1>

          <p className="mt-3 text-slate-500">
            {dataError}
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
          >
            {language === "vi"
              ? "Về trang chủ"
              : "Back to home"}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/tim-phong?hotel=${encodeURIComponent(
              hotel.slug
            )}&checkIn=${encodeURIComponent(
              checkIn
            )}&checkOut=${encodeURIComponent(
              checkOut
            )}&adults=${encodeURIComponent(
              String(adults)
            )}&children=${encodeURIComponent(
              String(children)
            )}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 transition hover:text-sky-800"
          >
            ←{" "}
            <span>
              {language === "vi"
                ? "Quay lại tìm phòng"
                : "Back to room search"}
            </span>
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            {language === "vi"
              ? "Đặt phòng"
              : "Booking"}
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
            {language === "vi"
              ? "Thông tin đặt phòng"
              : "Booking information"}
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            {language === "vi"
              ? "Kiểm tra thông tin lưu trú, phòng đã chọn và điền thông tin liên hệ để hoàn tất đặt phòng."
              : "Review your stay and selected rooms, then enter your contact information to complete your booking."}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-sky-600">
                    {language === "vi"
                      ? "Thông tin lưu trú"
                      : "Stay details"}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-slate-900">
                    {language === "vi"
                      ? hotel.name_vi
                      : hotel.name_en}
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {language === "vi"
                      ? "Ngày nhận phòng"
                      : "Check-in"}
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {formatDate(checkIn)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {language === "vi"
                      ? "Ngày trả phòng"
                      : "Check-out"}
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {formatDate(checkOut)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {language === "vi"
                      ? "Số đêm"
                      : "Nights"}
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {nights}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {language === "vi"
                      ? "Số khách"
                      : "Guests"}
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {adults}{" "}
                    {language === "vi"
                      ? "người lớn"
                      : "adult(s)"}{" "}
                    · {children}{" "}
                    {language === "vi"
                      ? "trẻ em"
                      : "child(ren)"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-sky-600">
                    {language === "vi"
                      ? "Phòng"
                      : "Rooms"}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-slate-900">
                    {language === "vi"
                      ? "Phòng đã chọn"
                      : "Selected rooms"}
                  </h2>
                </div>

                <div className="rounded-full bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700">
                  {totalRoomCount}{" "}
                  {language === "vi"
                    ? "phòng"
                    : "room(s)"}
                </div>
              </div>

              {selectedRoomDetails.length === 0 && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  {language === "vi"
                    ? "Không tìm thấy phòng đã chọn."
                    : "The selected rooms could not be found."}
                </div>
              )}

              <div className="mt-6 space-y-4">
                {selectedRoomDetails.map((room) => {
                  const lineTotal =
                    Number(room.base_price || 0) *
                    room.selectedQuantity *
                    nights;

                  const availableQuantity = Math.max(
                    Number(room.quantity || 0),
                    0
                  );

                  const quantityValid =
                    room.selectedQuantity <=
                    availableQuantity;

                  return (
                    <div
                      key={room.id}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {language === "vi"
                              ? room.name_vi
                              : room.name_en}
                          </h3>

                          <p className="mt-2 text-sm text-slate-500">
                            {formatPrice(
                              Number(room.base_price || 0)
                            )}{" "}
                            {language === "vi"
                              ? "đ / đêm / phòng"
                              : "VND / night / room"}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-xl font-bold text-sky-700">
                            {formatPrice(lineTotal)}{" "}
                            {language === "vi"
                              ? "đ"
                              : "VND"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {room.selectedQuantity}{" "}
                            {language === "vi"
                              ? "phòng"
                              : "room(s)"}{" "}
                            × {nights}{" "}
                            {language === "vi"
                              ? "đêm"
                              : "night(s)"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            quantityValid
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              quantityValid
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          />

                          {availableQuantity > 0
                            ? language === "vi"
                              ? `Còn ${availableQuantity} phòng`
                              : `${availableQuantity} room(s) available`
                            : language === "vi"
                              ? "Hết phòng"
                              : "Sold out"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-white p-6 shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-sky-600">
                  {language === "vi"
                    ? "Thông tin liên hệ"
                    : "Contact information"}
                </p>

                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {language === "vi"
                    ? "Thông tin khách"
                    : "Guest information"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {language === "vi"
                    ? "Thông tin này được dùng để liên hệ với bạn về đặt phòng."
                    : "We will use this information to contact you about your booking."}
                </p>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {language === "vi"
                      ? "Họ và tên"
                      : "Full name"}{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    autoComplete="name"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    placeholder={
                      language === "vi"
                        ? "Nguyễn Văn A"
                        : "John Smith"
                    }
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {language === "vi"
                        ? "Số điện thoại"
                        : "Phone number"}{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        handlePhoneChange(
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        setPhoneError(
                          validatePhone(phone)
                        )
                      }
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={12}
                      required
                      aria-invalid={Boolean(phoneError)}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                        phoneError
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-300 focus:border-sky-500 focus:ring-sky-100"
                      }`}
                      placeholder={
                        language === "vi"
                          ? "0901234567"
                          : "+84901234567"
                      }
                    />

                    {phoneError && (
                      <p className="mt-2 text-sm text-red-600">
                        {phoneError}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-400">
                      {language === "vi"
                        ? "Ví dụ: 0901234567 hoặc +84901234567"
                        : "Example: 0901234567 or +84901234567"}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        handleEmailChange(
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        setEmailError(
                          validateEmail(email)
                        )
                      }
                      autoComplete="email"
                      inputMode="email"
                      spellCheck={false}
                      autoCapitalize="none"
                      aria-invalid={Boolean(emailError)}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                        emailError
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-300 focus:border-sky-500 focus:ring-sky-100"
                      }`}
                      placeholder="email@example.com"
                    />

                    {emailError && (
                      <p className="mt-2 text-sm text-red-600">
                        {emailError}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-400">
                      {language === "vi"
                        ? "Không bắt buộc. Nếu nhập, email phải đúng định dạng."
                        : "Optional. If entered, the email must be valid."}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {language === "vi"
                      ? "Yêu cầu đặc biệt"
                      : "Special requests"}
                  </label>

                  <textarea
                    value={note}
                    onChange={(event) =>
                      setNote(event.target.value)
                    }
                    rows={5}
                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    placeholder={
                      language === "vi"
                        ? "Ví dụ: nhận phòng muộn, cần giường phụ, phòng tầng cao..."
                        : "Example: late check-in, extra bed, high floor..."
                    }
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    selectedRoomDetails.length === 0
                  }
                  className="w-full rounded-xl bg-sky-600 px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? language === "vi"
                      ? "ĐANG XỬ LÝ..."
                      : "PROCESSING..."
                    : language === "vi"
                      ? "XÁC NHẬN ĐẶT PHÒNG"
                      : "CONFIRM BOOKING"}
                </button>

                <p className="text-center text-xs leading-5 text-slate-400">
                  {language === "vi"
                    ? "Khi xác nhận, hệ thống sẽ kiểm tra lại giá và tình trạng phòng trước khi ghi nhận đặt phòng."
                    : "When you confirm, the system will verify the price and room availability before recording the booking."}
                </p>
              </div>
            </form>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-sky-100 bg-sky-50/70 text-slate-900 shadow-sm">
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                  {language === "vi"
                    ? "Tóm tắt đặt phòng"
                    : "Booking summary"}
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {language === "vi"
                    ? hotel.name_vi
                    : hotel.name_en}
                </h2>
              </div>

              <div className="border-y border-sky-100 bg-white/60 px-6 py-5">
                <div className="space-y-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-500">
                      {language === "vi"
                        ? "Nhận phòng"
                        : "Check-in"}
                    </span>

                    <span className="text-right font-medium text-slate-800">
                      {formatDate(checkIn)}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-500">
                      {language === "vi"
                        ? "Trả phòng"
                        : "Check-out"}
                    </span>

                    <span className="text-right font-medium text-slate-800">
                      {formatDate(checkOut)}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-500">
                      {language === "vi"
                        ? "Số đêm"
                        : "Nights"}
                    </span>

                    <span className="font-medium text-slate-800">
                      {nights}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-500">
                      {language === "vi"
                        ? "Người lớn"
                        : "Adults"}
                    </span>

                    <span className="font-medium text-slate-800">
                      {adults}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-500">
                      {language === "vi"
                        ? "Trẻ em"
                        : "Children"}
                    </span>

                    <span className="font-medium text-slate-800">
                      {children}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-500">
                      {language === "vi"
                        ? "Tổng số phòng"
                        : "Total rooms"}
                    </span>

                    <span className="font-medium text-slate-800">
                      {totalRoomCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <p className="text-sm font-semibold text-slate-700">
                  {language === "vi"
                    ? "Chi tiết phòng"
                    : "Room details"}
                </p>

                <div className="mt-4 space-y-4">
                  {selectedRoomDetails.map((room) => {
                    const roomTotal =
                      Number(room.base_price || 0) *
                      room.selectedQuantity *
                      nights;

                    return (
                      <div
                        key={room.id}
                        className="border-b border-sky-100 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {language === "vi"
                                ? room.name_vi
                                : room.name_en}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {room.selectedQuantity}{" "}
                              {language === "vi"
                                ? "phòng"
                                : "room(s)"}{" "}
                              × {nights}{" "}
                              {language === "vi"
                                ? "đêm"
                                : "night(s)"}
                            </p>
                          </div>

                          <p className="whitespace-nowrap text-sm font-semibold text-slate-800">
                            {formatPrice(roomTotal)}{" "}
                            {language === "vi"
                              ? "đ"
                              : "VND"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-sky-100 bg-sky-100/60 px-6 py-6">
                <div className="flex items-end justify-between gap-4">
                  <span className="text-sm font-medium text-slate-600">
                    {language === "vi"
                      ? "Tổng cộng"
                      : "Total"}
                  </span>

                  <div className="text-right">
                    <p className="text-3xl font-bold text-sky-700">
                      {formatPrice(totalPrice)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {language === "vi"
                        ? "đ"
                        : "VND"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-1">
                <div className="rounded-2xl border border-sky-100 bg-white/70 p-4">
                  <p className="text-xs leading-5 text-slate-500">
                    {language === "vi"
                      ? "Giá và tình trạng phòng sẽ được kiểm tra lại khi bạn xác nhận đặt phòng."
                      : "Price and room availability will be verified again when you confirm the booking."}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function DatPhongPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
            <p className="mt-4 text-sm text-slate-500">
              Đang tải...
            </p>
          </div>
        </main>
      }
    >
      <DatPhongContent />
    </Suspense>
  );
}

