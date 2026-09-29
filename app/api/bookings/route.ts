import { NextRequest, NextResponse } from "next/server";

import { supabase } from "../../lib/supabase";

type StayType = "day" | "month";

type AvailabilityRequest = {
  hotelSlug?: unknown;
  stayType?: unknown;
  checkIn?: unknown;
  checkOut?: unknown;
  months?: unknown;
};

type RoomRow = {
  id: number;
  hotel_id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
  base_price_daily: number | string | null;
  base_price_monthly: number | string | null;
  quantity: number | string | null;
  status: string;
};

type BookingRoomRow = {
  room_id: number | string | null;
  quantity: number | string | null;
};

type BookingRow = {
  id: number;
  check_in: string;
  check_out: string;
  status: string;
  booking_rooms: BookingRoomRow[] | null;
};

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}

function getTodayString(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addMonthsToDate(dateString: string, months: number): string {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  date.setMonth(date.getMonth() + months);

  const resultYear = date.getFullYear();
  const resultMonth = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const resultDay = String(
    date.getDate()
  ).padStart(2, "0");

  return `${resultYear}-${resultMonth}-${resultDay}`;
}

function normalizeStayType(
  value: unknown
): StayType {
  return value === "month"
    ? "month"
    : "day";
}

export async function POST(
  request: NextRequest
) {
  try {
    /*
      ==========================================
      1. ĐỌC REQUEST
      ==========================================
    */

    let body: AvailabilityRequest;

    try {
      body =
        (await request.json()) as AvailabilityRequest;
    } catch {
      return NextResponse.json(
        {
          error:
            "Dữ liệu gửi lên không hợp lệ.",
        },
        { status: 400 }
      );
    }

    const hotelSlug =
      typeof body.hotelSlug === "string"
        ? body.hotelSlug.trim()
        : "";

    const stayType =
      normalizeStayType(body.stayType);

    const rawCheckIn =
      typeof body.checkIn === "string"
        ? body.checkIn.trim()
        : "";

    const rawCheckOut =
      typeof body.checkOut === "string"
        ? body.checkOut.trim()
        : "";

    const rawMonths =
      typeof body.months === "number"
        ? body.months
        : typeof body.months === "string"
          ? Number(body.months)
          : NaN;

    /*
      ==========================================
      2. XÁC ĐỊNH KHOẢNG THỜI GIAN
      ==========================================
    */

    let checkIn = "";
    let checkOut = "";
    let months: number | null = null;

    if (!hotelSlug) {
      return NextResponse.json(
        {
          error:
            "Thiếu thông tin khách sạn.",
        },
        { status: 400 }
      );
    }

    if (hotelSlug.length > 150) {
      return NextResponse.json(
        {
          error:
            "Thông tin khách sạn không hợp lệ.",
        },
        { status: 400 }
      );
    }

    /*
      ------------------------------------------
      THUÊ THEO NGÀY
      ------------------------------------------
    */

    if (stayType === "day") {
      checkIn = rawCheckIn;
      checkOut = rawCheckOut;

      if (!checkIn || !checkOut) {
        return NextResponse.json(
          {
            error:
              "Thiếu ngày nhận phòng hoặc ngày trả phòng.",
          },
          { status: 400 }
        );
      }

      if (
        !isValidDateString(checkIn) ||
        !isValidDateString(checkOut)
      ) {
        return NextResponse.json(
          {
            error:
              "Ngày nhận phòng hoặc ngày trả phòng không hợp lệ.",
          },
          { status: 400 }
        );
      }

      if (checkOut <= checkIn) {
        return NextResponse.json(
          {
            error:
              "Ngày trả phòng phải sau ngày nhận phòng.",
          },
          { status: 400 }
        );
      }
    }

    /*
      ------------------------------------------
      THUÊ THEO THÁNG
      ------------------------------------------

      Không yêu cầu checkIn/checkOut từ giao diện.

      Khoảng kiểm tra:
      hôm nay → hôm nay + số tháng
    */

    if (stayType === "month") {
      if (
        !Number.isInteger(rawMonths) ||
        rawMonths < 1 ||
        rawMonths > 120
      ) {
        return NextResponse.json(
          {
            error:
              "Số tháng thuê không hợp lệ.",
          },
          { status: 400 }
        );
      }

      months = rawMonths;

      checkIn = getTodayString();

      checkOut =
        addMonthsToDate(
          checkIn,
          months
        );
    }

    /*
      ==========================================
      3. TÌM ĐÚNG KHÁCH SẠN
      ==========================================
    */

    const {
      data: hotel,
      error: hotelError,
    } = await supabase
      .from("hotels")
      .select(
        "id, slug, status"
      )
      .eq("slug", hotelSlug)
      .eq("status", "active")
      .maybeSingle();

    if (hotelError) {
      console.error(
        "Availability hotel error:",
        hotelError
      );

      return NextResponse.json(
        {
          error:
            "Không thể kiểm tra thông tin khách sạn.",
        },
        { status: 500 }
      );
    }

    if (!hotel) {
      return NextResponse.json(
        {
          error:
            "Không tìm thấy khách sạn hoặc khách sạn không hoạt động.",
        },
        { status: 404 }
      );
    }

    /*
      ==========================================
      4. LẤY PHÒNG CỦA KHÁCH SẠN
      ==========================================

      Giá mới:

      base_price_daily
      base_price_monthly
    */

    const {
      data: roomRows,
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
        `
      )
      .eq("hotel_id", hotel.id)
      .eq("status", "active")
      .order("id", {
        ascending: true,
      });

    if (roomError) {
      console.error(
        "Availability rooms error:",
        roomError
      );

      return NextResponse.json(
        {
          error:
            "Không thể tải danh sách phòng.",
        },
        { status: 500 }
      );
    }

    const rooms =
      (roomRows ?? []) as RoomRow[];

    if (rooms.length === 0) {
      return NextResponse.json({
        hotel: {
          id: Number(hotel.id),
          slug: hotel.slug,
        },

        stayType,

        checkIn,
        checkOut,

        months,

        rooms: [],
      });
    }

    /*
      ==========================================
      5. LẤY BOOKING ĐANG GIỮ PHÒNG
      ==========================================

      Chỉ confirmed giữ phòng.

      Điều kiện giao nhau:

      booking.check_in < requested.check_out
      booking.check_out > requested.check_in
    */

    const {
      data: bookingRows,
      error: bookingError,
    } = await supabase
      .from("bookings")
      .select(
        `
          id,
          check_in,
          check_out,
          status,
          booking_rooms (
            room_id,
            quantity
          )
        `
      )
      .eq("hotel_id", hotel.id)
      .eq("status", "confirmed")
      .lt(
        "check_in",
        checkOut
      )
      .gt(
        "check_out",
        checkIn
      );

    if (bookingError) {
      console.error(
        "Availability booking error:",
        bookingError
      );

      return NextResponse.json(
        {
          error:
            "Không thể kiểm tra các đơn đặt phòng.",
        },
        { status: 500 }
      );
    }

    const bookings =
      (bookingRows ?? []) as BookingRow[];

    /*
      ==========================================
      6. TÍNH SỐ PHÒNG ĐÃ ĐẶT
      ==========================================
    */

    const bookedByRoom: Record<
      number,
      number
    > = {};

    for (const booking of bookings) {
      if (
        booking.status !==
        "confirmed"
      ) {
        continue;
      }

      const bookingRooms =
        booking.booking_rooms ?? [];

      for (const bookingRoom of bookingRooms) {
        const roomId = Number(
          bookingRoom.room_id
        );

        const quantity = Number(
          bookingRoom.quantity
        );

        if (
          !Number.isInteger(roomId) ||
          roomId <= 0
        ) {
          continue;
        }

        if (
          !Number.isFinite(quantity) ||
          quantity <= 0
        ) {
          continue;
        }

        const safeQuantity =
          Math.floor(quantity);

        if (safeQuantity <= 0) {
          continue;
        }

        bookedByRoom[roomId] =
          (bookedByRoom[roomId] ?? 0) +
          safeQuantity;
      }
    }

    /*
      ==========================================
      7. TÍNH AVAILABLE
      ==========================================
    */

    const result = rooms.map(
      (room) => {
        const rawTotalQuantity =
          Number(room.quantity);

        const totalQuantity =
          Number.isFinite(
            rawTotalQuantity
          ) &&
          rawTotalQuantity > 0
            ? Math.floor(
                rawTotalQuantity
              )
            : 0;

        const bookedQuantity =
          Math.max(
            0,
            bookedByRoom[
              Number(room.id)
            ] ?? 0
          );

        const availableQuantity =
          Math.max(
            totalQuantity -
              bookedQuantity,
            0
          );

        /*
          Giá ngày.
        */

        const rawDailyPrice =
          Number(
            room.base_price_daily
          );

        const basePriceDaily =
          Number.isFinite(
            rawDailyPrice
          ) &&
          rawDailyPrice >= 0
            ? rawDailyPrice
            : 0;

        /*
          Giá tháng.
        */

        const rawMonthlyPrice =
          Number(
            room.base_price_monthly
          );

        const basePriceMonthly =
          Number.isFinite(
            rawMonthlyPrice
          ) &&
          rawMonthlyPrice >= 0
            ? rawMonthlyPrice
            : 0;

        /*
          Giá đang áp dụng theo hình thức ở.
        */

        const basePrice =
          stayType === "month"
            ? basePriceMonthly
            : basePriceDaily;

        return {
          roomId:
            Number(room.id),

          roomSlug:
            room.slug,

          hotelId:
            Number(hotel.id),

          hotelSlug:
            hotel.slug,

          nameVi:
            room.name_vi,

          nameEn:
            room.name_en,

          basePrice,

          basePriceDaily,

          basePriceMonthly,

          totalQuantity,

          bookedQuantity,

          availableQuantity,
        };
      }
    );

    /*
      ==========================================
      8. TRẢ KẾT QUẢ
      ==========================================
    */

    return NextResponse.json(
      {
        hotel: {
          id: Number(hotel.id),
          slug: hotel.slug,
        },

        stayType,

        checkIn,
        checkOut,

        months,

        rooms: result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Availability API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Không thể kiểm tra tình trạng phòng.",
      },
      { status: 500 }
    );
  }
}