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

type Language = "vi" | "en";
type StayType = "day" | "month";

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
  base_price_daily: number | null;
  base_price_monthly: number | null;
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
    stayType?: StayType;
    months?: number;
    checkIn?: string;
    checkOut?: string;
    nights?: number;
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
      price_per_night?: number;
      price_per_month?: number;
    }[];
    totalAmount: number;
  };
};

function formatMoney(value: number, language: Language) {
  return new Intl.NumberFormat(
    language === "vi" ? "vi-VN" : "en-US",
  ).format(Math.max(0, Number(value) || 0));
}

function formatDate(value: string, language: Language) {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    language === "vi" ? "vi-VN" : "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(date);
}

function normalizeRoomData(roomData: unknown): Room[] {
  if (!Array.isArray(roomData)) {
    return [];
  }

  return roomData
    .map((room): Room | null => {
      if (!room || typeof room !== "object") {
        return null;
      }

      const item = room as Record<string, unknown>;

      const status =
        item.status === "inactive" ? "inactive" : "active";

      return {
        id: Number(item.id ?? 0),
        hotel_id: Number(item.hotel_id ?? 0),
        slug: String(item.slug ?? ""),
        name_vi: String(item.name_vi ?? ""),
        name_en: String(item.name_en ?? ""),
        base_price_daily:
          item.base_price_daily === null ||
          item.base_price_daily === undefined
            ? null
            : Number(item.base_price_daily),
        base_price_monthly:
          item.base_price_monthly === null ||
          item.base_price_monthly === undefined
            ? null
            : Number(item.base_price_monthly),
        quantity:
          item.quantity === null ||
          item.quantity === undefined
            ? null
            : Number(item.quantity),
        status,
      };
    })
    .filter((room): room is Room => room !== null);
}

function BookingPageContent() {
  const searchParams = useSearchParams();

  const hotelSlug = searchParams.get("hotel") || "";

  const stayTypeParam = searchParams.get("stayType");

  const stayType: StayType =
    stayTypeParam === "month" ? "month" : "day";

  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";

  const parsedMonths = Number(
    searchParams.get("months") || 1,
  );

  const months =
    Number.isFinite(parsedMonths) && parsedMonths > 0
      ? Math.floor(parsedMonths)
      : 1;

  const parsedAdults = Number(
    searchParams.get("adults") || 1,
  );

  const adults =
    Number.isFinite(parsedAdults) && parsedAdults > 0
      ? Math.floor(parsedAdults)
      : 1;

  const parsedChildren = Number(
    searchParams.get("children") || 0,
  );

  const children =
    Number.isFinite(parsedChildren) && parsedChildren >= 0
      ? Math.floor(parsedChildren)
      : 0;

  const roomsParam = searchParams.get("rooms");
  const oldRoomParam = searchParams.get("room");

  const [language, setLanguage] = useState<Language>("vi");
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedLanguage =
      window.localStorage.getItem("huyen-language");

    if (storedLanguage === "en" || storedLanguage === "vi") {
      setLanguage(storedLanguage);
    }

    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<Language>;

      if (
        customEvent.detail === "vi" ||
        customEvent.detail === "en"
      ) {
        setLanguage(customEvent.detail);
        return;
      }

      const nextLanguage =
        window.localStorage.getItem("huyen-language");

      if (nextLanguage === "en" || nextLanguage === "vi") {
        setLanguage(nextLanguage);
      }
    };

    window.addEventListener(
      "language-change",
      handleLanguageChange,
    );

    return () => {
      window.removeEventListener(
        "language-change",
        handleLanguageChange,
      );
    };
  }, []);

  const selectedRooms = useMemo<BookingRoom[]>(() => {
    if (roomsParam) {
      try {
        const parsed = JSON.parse(roomsParam);

        if (Array.isArray(parsed)) {
          const result: BookingRoom[] = [];

          for (const item of parsed) {
            if (!item || typeof item !== "object") {
              continue;
            }

            const raw = item as Record<string, unknown>;

            const roomSlug = String(
              raw.roomSlug ?? raw.slug ?? "",
            ).trim();

            const rawQuantity = Number(
              raw.quantity ?? 0,
            );

            const quantity =
              Number.isFinite(rawQuantity) &&
              rawQuantity > 0
                ? Math.floor(rawQuantity)
                : 0;

            if (roomSlug && quantity > 0) {
              result.push({
                roomSlug,
                quantity,
              });
            }
          }

          if (result.length > 0) {
            return result;
          }
        }
      } catch {
        // Ignore invalid JSON and try the old room parameter.
      }
    }

    if (oldRoomParam) {
      return [
        {
          roomSlug: oldRoomParam,
          quantity: 1,
        },
      ];
    }

    return [];
  }, [roomsParam, oldRoomParam]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoadingData(true);
      setDataError("");

      if (!hotelSlug) {
        setHotel(null);
        setRooms([]);
        setLoadingData(false);

        setDataError(
          language === "vi"
            ? "Không tìm thấy thông tin khách sạn."
            : "Hotel information was not found.",
        );

        return;
      }

      try {
        const {
          data: hotelData,
          error: hotelError,
        } = await supabase
          .from("hotels")
          .select(
            "id, slug, name_vi, name_en, status",
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
              : "Hotel not found.",
          );
        }

        const {
          data: roomData,
          error: roomError,
        } = await supabase
          .from("rooms")
          .select(
            `
              id,
              hotel_id,
              slug,
              name_vi,
              name_en,
              base_price_daily,
              base_price_monthly,
              quantity,
              status
            `,
          )
          .eq("hotel_id", hotelData.id)
          .eq("status", "active")
          .order("id", {
            ascending: true,
          });

        if (roomError) {
          throw new Error(roomError.message);
        }

        const activeRooms =
          normalizeRoomData(roomData);

        if (cancelled) {
          return;
        }

        setHotel({
          id: Number(hotelData.id),
          slug: String(hotelData.slug ?? ""),
          name_vi: String(hotelData.name_vi ?? ""),
          name_en: String(hotelData.name_en ?? ""),
          status:
            hotelData.status === "inactive"
              ? "inactive"
              : "active",
        });

        setRooms(activeRooms);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : String(loadError);

        setHotel(null);
        setRooms([]);

        setDataError(
          language === "vi"
            ? `Không thể tải thông tin đặt phòng: ${message}`
            : `Unable to load booking information: ${message}`,
        );
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [hotelSlug, language]);

  const selectedRoomDetails =
    useMemo<SelectedRoomDetail[]>(() => {
      return selectedRooms
        .map((selected) => {
          const room = rooms.find(
            (item) =>
              item.slug === selected.roomSlug &&
              item.hotel_id === hotel?.id,
          );

          if (!room) {
            return null;
          }

          return {
            ...room,
            selectedQuantity: selected.quantity,
          };
        })
        .filter(
          (room): room is SelectedRoomDetail =>
            room !== null,
        );
    }, [selectedRooms, rooms, hotel?.id]);

  const missingSelectedRooms = useMemo(() => {
    return selectedRooms.filter(
      (selected) =>
        !rooms.some(
          (room) =>
            room.slug === selected.roomSlug &&
            room.hotel_id === hotel?.id,
        ),
    );
  }, [selectedRooms, rooms, hotel?.id]);

  const nights = useMemo(() => {
    if (
      stayType !== "day" ||
      !checkIn ||
      !checkOut
    ) {
      return 0;
    }

    const start = new Date(
      `${checkIn}T00:00:00`,
    );

    const end = new Date(
      `${checkOut}T00:00:00`,
    );

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return 0;
    }

    const diff =
      (end.getTime() - start.getTime()) /
      (1000 * 60 * 60 * 24);

    return Math.max(0, Math.round(diff));
  }, [stayType, checkIn, checkOut]);

  const getRoomUnitPrice = (room: Room) => {
    if (stayType === "month") {
      return Number(
        room.base_price_monthly || 0,
      );
    }

    return Number(
      room.base_price_daily || 0,
    );
  };

  const priceUnitLabel =
    stayType === "month"
      ? language === "vi"
        ? "đ / tháng / phòng"
        : "VND / month / room"
      : language === "vi"
        ? "đ / đêm / phòng"
        : "VND / night / room";

  const stayTypeLabel =
    stayType === "month"
      ? language === "vi"
        ? "Thuê theo tháng"
        : "Monthly stay"
      : language === "vi"
        ? "Đặt theo đêm"
        : "Nightly stay";

  const stayDurationLabel =
    stayType === "month"
      ? `${months} ${
          language === "vi"
            ? "tháng"
            : months === 1
              ? "month"
              : "months"
        }`
      : `${nights} ${
          language === "vi"
            ? "đêm"
            : nights === 1
              ? "night"
              : "nights"
        }`;

  const totalPrice = useMemo(() => {
    return selectedRoomDetails.reduce(
      (sum, room) => {
        const unitPrice =
          getRoomUnitPrice(room);

        const multiplier =
          stayType === "month"
            ? months
            : nights;

        return (
          sum +
          unitPrice *
            room.selectedQuantity *
            multiplier
        );
      },
      0,
    );
  }, [
    selectedRoomDetails,
    stayType,
    months,
    nights,
  ]);

  const totalRoomCount = useMemo(() => {
    return selectedRoomDetails.reduce(
      (sum, room) =>
        sum + room.selectedQuantity,
      0,
    );
  }, [selectedRoomDetails]);

  const invalidDayBooking =
    stayType === "day" &&
    (!checkIn ||
      !checkOut ||
      nights < 1);

  const invalidMonthBooking =
    stayType === "month" &&
    months < 1;

  const hasInvalidQuantity =
    selectedRoomDetails.some((room) => {
      if (room.quantity === null) {
        return false;
      }

      return (
        room.selectedQuantity >
        room.quantity
      );
    });

  const hasInvalidPrice =
    selectedRoomDetails.some(
      (room) =>
        getRoomUnitPrice(room) <= 0,
    );

  const validatePhone = (value: string) => {
    const normalized = value
      .replace(/\s+/g, "")
      .trim();

    if (!normalized) {
      return language === "vi"
        ? "Vui lòng nhập số điện thoại."
        : "Please enter your phone number.";
    }

    if (!/^[0-9+()-]{8,20}$/.test(normalized)) {
      return language === "vi"
        ? "Số điện thoại không hợp lệ."
        : "Invalid phone number.";
    }

    return "";
  };

  const validateEmail = (value: string) => {
    const normalized = value.trim();

    if (!normalized) {
      return "";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalized,
      )
    ) {
      return language === "vi"
        ? "Email không hợp lệ."
        : "Invalid email address.";
    }

    return "";
  };

  const handlePhoneChange = (
    value: string,
  ) => {
    setPhone(value);

    if (phoneError) {
      setPhoneError("");
    }
  };

  const handleEmailChange = (
    value: string,
  ) => {
    setEmail(value);

    if (emailError) {
      setEmailError("");
    }
  };

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setPhoneError("");
    setEmailError("");

    if (!hotelSlug) {
      setError(
        language === "vi"
          ? "Thiếu thông tin khách sạn."
          : "Hotel information is missing.",
      );
      return;
    }

    if (invalidDayBooking) {
      setError(
        language === "vi"
          ? "Vui lòng kiểm tra lại ngày nhận và ngày trả phòng."
          : "Please check your check-in and check-out dates.",
      );
      return;
    }

    if (invalidMonthBooking) {
      setError(
        language === "vi"
          ? "Số tháng thuê không hợp lệ."
          : "Invalid number of months.",
      );
      return;
    }

    if (selectedRooms.length === 0) {
      setError(
        language === "vi"
          ? "Vui lòng chọn ít nhất một phòng."
          : "Please select at least one room.",
      );
      return;
    }

    if (missingSelectedRooms.length > 0) {
      setError(
        language === "vi"
          ? "Một hoặc nhiều loại phòng không còn tồn tại hoặc đã ngừng hoạt động."
          : "One or more selected room types are unavailable.",
      );
      return;
    }

    if (hasInvalidQuantity) {
      setError(
        language === "vi"
          ? "Số lượng phòng bạn chọn vượt quá số lượng phòng hiện có. Hệ thống sẽ kiểm tra lại khi gửi đặt phòng."
          : "The selected room quantity exceeds the current room quantity. Availability will be checked again when submitting.",
      );
      return;
    }

    if (hasInvalidPrice) {
      setError(
        language === "vi"
          ? "Một hoặc nhiều phòng chưa có giá phù hợp với hình thức lưu trú này."
          : "One or more rooms do not have a valid price for this stay type.",
      );
      return;
    }

    const trimmedName =
      fullName.trim();

    if (!trimmedName) {
      setError(
        language === "vi"
          ? "Vui lòng nhập họ tên."
          : "Please enter your full name.",
      );
      return;
    }

    const nextPhoneError =
      validatePhone(phone);

    if (nextPhoneError) {
      setPhoneError(nextPhoneError);
      return;
    }

    const nextEmailError =
      validateEmail(email);

    if (nextEmailError) {
      setEmailError(nextEmailError);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            hotelSlug,
            stayType,
            checkIn:
              stayType === "day"
                ? checkIn
                : "",
            checkOut:
              stayType === "day"
                ? checkOut
                : "",
            months:
              stayType === "month"
                ? months
                : 0,
            adults,
            children,
            fullName: trimmedName,
            phone: phone.trim(),
            email: email.trim(),
            note: note.trim(),
            rooms: selectedRooms,
          }),
        },
      );

      const result =
        (await response.json()) as BookingApiResponse;

      if (!response.ok) {
        if (
          response.status === 409 &&
          result.roomSlug
        ) {
          const affectedRoom =
            rooms.find(
              (room) =>
                room.slug ===
                result.roomSlug,
            );

          const roomName =
            affectedRoom
              ? language === "vi"
                ? affectedRoom.name_vi
                : affectedRoom.name_en
              : result.roomSlug;

          const available =
            Number(
              result.availableQuantity ??
                0,
            );

          setError(
            language === "vi"
              ? `Phòng "${roomName}" hiện không đủ số lượng. Còn ${available} phòng. Vui lòng quay lại chọn số lượng khác.`
              : `Room "${roomName}" is not available in the requested quantity. ${available} room(s) remain available.`,
          );

          return;
        }

        throw new Error(
          result.error ||
            (language === "vi"
              ? "Không thể tạo đặt phòng."
              : "Unable to create booking."),
        );
      }

      if (
        !result.success ||
        !result.booking
      ) {
        throw new Error(
          result.error ||
            (language === "vi"
              ? "Đặt phòng chưa được xác nhận."
              : "Booking was not confirmed."),
        );
      }

      /*
       * Booking đã được tạo thành công.
       *
       * Gửi thông báo Telegram.
       *
       * Nếu Telegram lỗi thì KHÔNG làm hỏng booking.
       */
      try {
        const telegramResponse =
          await fetch(
            "/api/telegram-booking",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                bookingCode:
                  result.booking.bookingCode,

                hotelName:
                  language === "vi"
                    ? result.booking
                        .hotelNameVi
                    : result.booking
                        .hotelNameEn,

                fullName:
                  result.booking.fullName,

                phone:
                  result.booking.phone,

                email:
                  result.booking.email,

                stayType:
                  result.booking.stayType,

                checkIn:
                  result.booking.checkIn,

                checkOut:
                  result.booking.checkOut,

                months:
                  result.booking.months,

                nights:
                  result.booking.nights,

                adults:
                  result.booking.adults,

                children:
                  result.booking.children,

                rooms:
                  selectedRoomDetails.map(
                    (room) => ({
                      name:
                        language === "vi"
                          ? room.name_vi
                          : room.name_en,
                      quantity:
                        room.selectedQuantity,
                    }),
                  ),

                totalAmount:
                  result.booking
                    .totalAmount,

                note:
                  result.booking.note,
              }),
            },
          );

        if (!telegramResponse.ok) {
          const telegramResult =
            await telegramResponse
              .json()
              .catch(() => null);

          console.error(
            "Telegram notification failed:",
            telegramResult,
          );
        }
      } catch (telegramError) {
        console.error(
          "Telegram notification error:",
          telegramError,
        );
      }

      setConfirmed(result.booking);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : String(submitError);

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    const confirmedHotelName =
      language === "vi"
        ? confirmed.hotelNameVi
        : confirmed.hotelNameEn;

    const confirmedStayType =
      confirmed.stayType === "month"
        ? language === "vi"
          ? "Thuê theo tháng"
          : "Monthly stay"
        : language === "vi"
          ? "Đặt theo đêm"
          : "Nightly stay";

    const confirmedRooms =
      confirmed.rooms?.reduce(
        (sum, room) =>
          sum + Number(room.quantity || 0),
        0,
      ) || 0;

    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                ✓
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                {language === "vi"
                  ? "Đặt phòng thành công"
                  : "Booking confirmed"}
              </h1>

              <p className="mt-3 text-slate-500">
                {language === "vi"
                  ? "Thông tin đặt phòng của bạn đã được ghi nhận."
                  : "Your booking request has been successfully received."}
              </p>

              <p className="mt-2 text-slate-500">
                {language === "vi"
                  ? "Chúng tôi sẽ liên hệ với bạn sớm nhất."
                  : "We will contact you as soon as possible."}
              </p>
            </div>

            <div className="mb-6 rounded-2xl bg-slate-50 p-5 text-center">
              <div className="text-sm text-slate-500">
                {language === "vi"
                  ? "Mã đặt phòng"
                  : "Booking code"}
              </div>

              <div className="mt-2 text-2xl font-bold tracking-wider">
                {confirmed.bookingCode}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  {language === "vi"
                    ? "Khách sạn"
                    : "Hotel"}
                </div>

                <div className="mt-1 font-semibold">
                  {confirmedHotelName}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  {language === "vi"
                    ? "Hình thức"
                    : "Stay type"}
                </div>

                <div className="mt-1 font-semibold">
                  {confirmedStayType}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  {language === "vi"
                    ? "Khách hàng"
                    : "Guest"}
                </div>

                <div className="mt-1 font-semibold">
                  {confirmed.fullName}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  {language === "vi"
                    ? "Điện thoại"
                    : "Phone"}
                </div>

                <div className="mt-1 font-semibold">
                  {confirmed.phone}
                </div>
              </div>

              {confirmed.stayType ===
              "month" ? (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    {language === "vi"
                      ? "Thời gian thuê"
                      : "Rental period"}
                  </div>

                  <div className="mt-1 font-semibold">
                    {confirmed.months || 1}{" "}
                    {language === "vi"
                      ? "tháng"
                      : (confirmed.months ||
                            1) === 1
                        ? "month"
                        : "months"}
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      {language === "vi"
                        ? "Nhận phòng"
                        : "Check-in"}
                    </div>

                    <div className="mt-1 font-semibold">
                      {confirmed.checkIn
                        ? formatDate(
                            confirmed.checkIn,
                            language,
                          )
                        : "-"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      {language === "vi"
                        ? "Trả phòng"
                        : "Check-out"}
                    </div>

                    <div className="mt-1 font-semibold">
                      {confirmed.checkOut
                        ? formatDate(
                            confirmed.checkOut,
                            language,
                          )
                        : "-"}
                    </div>
                  </div>
                </>
              )}

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  {language === "vi"
                    ? "Số phòng"
                    : "Rooms"}
                </div>

                <div className="mt-1 font-semibold">
                  {confirmedRooms}
                </div>
              </div>

              {confirmed.stayType !==
                "month" && (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    {language === "vi"
                      ? "Số đêm"
                      : "Nights"}
                  </div>

                  <div className="mt-1 font-semibold">
                    {confirmed.nights || 0}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-300">
                  {language === "vi"
                    ? "Tổng tiền"
                    : "Total amount"}
                </span>

                <span className="text-xl font-bold">
                  {formatMoney(
                    Number(
                      confirmed.totalAmount ||
                        0,
                    ),
                    language,
                  )}{" "}
                  VND
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#booking-search"
                className="flex-1 rounded-xl bg-sky-600 px-5 py-3 text-center font-semibold text-white hover:bg-sky-700"
              >
                {language === "vi"
                  ? "Đặt phòng khác"
                  : "Make another booking"}
              </Link>

              <Link
                href="/"
                className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-center font-semibold hover:bg-slate-50"
              >
                {language === "vi"
                  ? "Về trang chủ"
                  : "Back to home"}
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (loadingData) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />

          <p className="mt-5 text-sm text-slate-500">
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
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <div className="text-4xl">!</div>

            <h1 className="mt-4 text-2xl font-bold">
              {language === "vi"
                ? "Không thể mở trang đặt phòng"
                : "Unable to open booking page"}
            </h1>

            <p className="mt-3 text-slate-500">
              {dataError ||
                (language === "vi"
                  ? "Không tìm thấy khách sạn."
                  : "Hotel not found.")}
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
            >
              {language === "vi"
                ? "Về trang chủ"
                : "Back to home"}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const hotelName =
    language === "vi"
      ? hotel.name_vi
      : hotel.name_en;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7">
          <div className="text-sm font-medium text-sky-600">
            {stayTypeLabel}
          </div>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            {language === "vi"
              ? "Xác nhận đặt phòng"
              : "Confirm your booking"}
          </h1>

          <p className="mt-2 text-slate-500">
            {hotelName}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1fr_380px]"
        >
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
              <h2 className="text-lg font-bold">
                {language === "vi"
                  ? "Thông tin lưu trú"
                  : "Stay details"}
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    {language === "vi"
                      ? "Hình thức"
                      : "Stay type"}
                  </div>

                  <div className="mt-1 font-semibold">
                    {stayTypeLabel}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    {language === "vi"
                      ? "Thời gian"
                      : "Duration"}
                  </div>

                  <div className="mt-1 font-semibold">
                    {stayDurationLabel}
                  </div>
                </div>

                {stayType === "day" ? (
                  <>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        {language === "vi"
                          ? "Nhận phòng"
                          : "Check-in"}
                      </div>

                      <div className="mt-1 font-semibold">
                        {formatDate(
                          checkIn,
                          language,
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        {language === "vi"
                          ? "Trả phòng"
                          : "Check-out"}
                      </div>

                      <div className="mt-1 font-semibold">
                        {formatDate(
                          checkOut,
                          language,
                        )}
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    {language === "vi"
                      ? "Người lớn"
                      : "Adults"}
                  </div>

                  <div className="mt-1 font-semibold">
                    {adults}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    {language === "vi"
                      ? "Trẻ em"
                      : "Children"}
                  </div>

                  <div className="mt-1 font-semibold">
                    {children}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
              <h2 className="text-lg font-bold">
                {language === "vi"
                  ? "Phòng đã chọn"
                  : "Selected rooms"}
              </h2>

              {selectedRoomDetails.length ===
              0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  {language === "vi"
                    ? "Chưa có phòng được chọn."
                    : "No rooms selected."}
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {selectedRoomDetails.map(
                    (room) => {
                      const unitPrice =
                        getRoomUnitPrice(
                          room,
                        );

                      const multiplier =
                        stayType === "month"
                          ? months
                          : nights;

                      const lineTotal =
                        unitPrice *
                        room.selectedQuantity *
                        multiplier;

                      const quantityValid =
                        room.quantity ===
                          null ||
                        room.selectedQuantity <=
                          room.quantity;

                      return (
                        <div
                          key={room.id}
                          className="rounded-2xl border border-slate-200 p-4"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h3 className="font-semibold">
                                {language ===
                                "vi"
                                  ? room.name_vi
                                  : room.name_en}
                              </h3>

                              <div className="mt-1 text-sm text-slate-500">
                                {language ===
                                "vi"
                                  ? `Số lượng: ${room.selectedQuantity} phòng`
                                  : `Quantity: ${room.selectedQuantity} room(s)`}
                              </div>

                              {room.quantity !==
                              null ? (
                                <div
                                  className={`mt-1 text-xs ${
                                    quantityValid
                                      ? "text-slate-400"
                                      : "font-semibold text-red-600"
                                  }`}
                                >
                                  {language ===
                                  "vi"
                                    ? `Có sẵn: ${room.quantity} phòng`
                                    : `Available: ${room.quantity} room(s)`}
                                </div>
                              ) : null}
                            </div>

                            <div className="text-left sm:text-right">
                              <div className="font-semibold">
                                {formatMoney(
                                  unitPrice,
                                  language,
                                )}{" "}
                                VND
                              </div>

                              <div className="text-xs text-slate-400">
                                {priceUnitLabel}
                              </div>

                              <div className="mt-1 text-sm font-bold text-sky-700">
                                {formatMoney(
                                  lineTotal,
                                  language,
                                )}{" "}
                                VND
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
              <h2 className="text-lg font-bold">
                {language === "vi"
                  ? "Thông tin khách hàng"
                  : "Guest information"}
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium"
                  >
                    {language === "vi"
                      ? "Họ và tên"
                      : "Full name"}{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="fullName"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(
                        event.target.value,
                      )
                    }
                    placeholder={
                      language === "vi"
                        ? "Nhập họ và tên"
                        : "Enter your full name"
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium"
                  >
                    {language === "vi"
                      ? "Số điện thoại"
                      : "Phone number"}{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      handlePhoneChange(
                        event.target.value,
                      )
                    }
                    placeholder={
                      language === "vi"
                        ? "Nhập số điện thoại"
                        : "Enter your phone number"
                    }
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                      phoneError
                        ? "border-red-500 focus:ring-red-100"
                        : "border-slate-300 focus:border-sky-500 focus:ring-sky-100"
                    }`}
                  />

                  {phoneError ? (
                    <p className="mt-1 text-sm text-red-600">
                      {phoneError}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Email{" "}
                    <span className="text-xs font-normal text-slate-400">
                      (
                      {language === "vi"
                        ? "không bắt buộc"
                        : "optional"}
                      )
                    </span>
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      handleEmailChange(
                        event.target.value,
                      )
                    }
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                      emailError
                        ? "border-red-500 focus:ring-red-100"
                        : "border-slate-300 focus:border-sky-500 focus:ring-sky-100"
                    }`}
                  />

                  {emailError ? (
                    <p className="mt-1 text-sm text-red-600">
                      {emailError}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="note"
                    className="mb-2 block text-sm font-medium"
                  >
                    {language === "vi"
                      ? "Ghi chú"
                      : "Note"}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      (
                      {language === "vi"
                        ? "không bắt buộc"
                        : "optional"}
                      )
                    </span>
                  </label>

                  <textarea
                    id="note"
                    value={note}
                    onChange={(event) =>
                      setNote(
                        event.target.value,
                      )
                    }
                    rows={4}
                    placeholder={
                      language === "vi"
                        ? "Yêu cầu đặc biệt hoặc ghi chú..."
                        : "Special requests or notes..."
                    }
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
              <h2 className="text-lg font-bold">
                {language === "vi"
                  ? "Tóm tắt đặt phòng"
                  : "Booking summary"}
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    {language === "vi"
                      ? "Khách sạn"
                      : "Hotel"}
                  </span>

                  <span className="text-right text-sm font-semibold">
                    {hotelName}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    {language === "vi"
                      ? "Hình thức"
                      : "Stay type"}
                  </span>

                  <span className="text-right text-sm font-semibold">
                    {stayTypeLabel}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    {language === "vi"
                      ? "Thời gian"
                      : "Duration"}
                  </span>

                  <span className="text-right text-sm font-semibold">
                    {stayDurationLabel}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    {language === "vi"
                      ? "Số phòng"
                      : "Rooms"}
                  </span>

                  <span className="text-right text-sm font-semibold">
                    {totalRoomCount}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-sm font-medium text-slate-500">
                      {language === "vi"
                        ? "Tổng tiền dự kiến"
                        : "Estimated total"}
                    </span>

                    <span className="text-right text-2xl font-bold text-sky-700">
                      {formatMoney(
                        totalPrice,
                        language,
                      )}{" "}
                      VND
                    </span>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={
                  submitting ||
                  selectedRoomDetails.length ===
                    0
                }
                className="mt-6 w-full rounded-xl bg-sky-600 px-5 py-3.5 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? language === "vi"
                    ? "Đang xử lý..."
                    : "Processing..."
                  : language === "vi"
                    ? "Xác nhận đặt phòng"
                    : "Confirm booking"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                {language === "vi"
                  ? "Số phòng và khả dụng thực tế sẽ được hệ thống kiểm tra lại khi gửi yêu cầu đặt phòng."
                  : "Room availability will be verified again when your booking request is submitted."}
              </p>
            </section>
          </aside>
        </form>
      </section>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />

            <p className="mt-5 text-sm text-slate-500">
              Đang tải...
            </p>
          </div>
        </main>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}