
import { NextRequest, NextResponse } from "next/server";

import { supabase } from "../../lib/supabase";

type AvailabilityRequest = {
  hotelSlug?: unknown;
  checkIn?: unknown;
  checkOut?: unknown;
};

type RoomRow = {
  id: number;
  hotel_id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
  base_price: number | string | null;
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

export async function POST(request: NextRequest) {
  try {
    /*
      ==========================================
      1. ĐỌC REQUEST
      ==========================================
    */

    let body: AvailabilityRequest;

    try {
      body = (await request.json()) as AvailabilityRequest;
    } catch {
      return NextResponse.json(
        {
          error: "Dữ liệu gửi lên không hợp lệ.",
        },
        { status: 400 }
      );
    }

    const hotelSlug =
      typeof body.hotelSlug === "string"
        ? body.hotelSlug.trim()
        : "";

    const checkIn =
      typeof body.checkIn === "string"
        ? body.checkIn.trim()
        : "";

    const checkOut =
      typeof body.checkOut === "string"
        ? body.checkOut.trim()
        : "";

    /*
      ==========================================
      2. KIỂM TRA INPUT
      ==========================================
    */

    if (!hotelSlug || !checkIn || !checkOut) {
      return NextResponse.json(
        {
          error:
            "Thiếu khách sạn, ngày nhận phòng hoặc ngày trả phòng.",
        },
        { status: 400 }
      );
    }

    /*
      Giới hạn độ dài slug để tránh request bất thường.
    */
    if (hotelSlug.length > 150) {
      return NextResponse.json(
        {
          error: "Thông tin khách sạn không hợp lệ.",
        },
        { status: 400 }
      );
    }

    /*
      Ngày phải có dạng YYYY-MM-DD.
    */
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

    /*
      Không cho trả phòng trước hoặc bằng ngày nhận phòng.
    */
    if (checkOut <= checkIn) {
      return NextResponse.json(
        {
          error:
            "Ngày trả phòng phải sau ngày nhận phòng.",
        },
        { status: 400 }
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
      .select("id, slug, status")
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

      Chỉ lấy phòng:

      - thuộc đúng hotel
      - đang active
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
          base_price,
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

    const rooms = (roomRows ?? []) as RoomRow[];

    /*
      Nếu khách sạn không có phòng active.
    */

    if (rooms.length === 0) {
      return NextResponse.json({
        hotel: {
          id: Number(hotel.id),
          slug: hotel.slug,
        },

        checkIn,
        checkOut,

        rooms: [],
      });
    }

    /*
      ==========================================
      5. LẤY BOOKING ĐANG GIỮ PHÒNG
      ==========================================

      QUY ƯỚC HIỆN TẠI:

      confirmed = giữ phòng

      cancelled = không giữ phòng

      Các trạng thái khác KHÔNG được tự động
      tính là giữ phòng.

      Điều này an toàn hơn việc dùng:

      .neq("status", "cancelled")

      vì sau này có thể xuất hiện:

      pending
      draft
      expired
      no_show
      ...
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
      .lt("check_in", checkOut)
      .gt("check_out", checkIn);

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

    const bookedByRoom: Record<number, number> = {};

    for (const booking of bookings) {
      /*
        Chỉ xử lý confirmed.

        Kiểm tra thêm status ở đây để bảo vệ
        trường hợp dữ liệu trả về không đúng kỳ vọng.
      */

      if (booking.status !== "confirmed") {
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

        /*
          Dữ liệu booking room không hợp lệ
          thì bỏ qua, không làm hỏng toàn bộ API.
        */

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

        /*
          Chỉ chấp nhận số lượng nguyên.
        */

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
      7. TÍNH AVAILABLE QUANTITY
      ==========================================
    */

    const result = rooms.map((room) => {
      /*
        quantity trong rooms =
        tổng số phòng của loại phòng.
      */

      const rawTotalQuantity =
        Number(room.quantity);

      const totalQuantity =
        Number.isFinite(rawTotalQuantity) &&
        rawTotalQuantity > 0
          ? Math.floor(rawTotalQuantity)
          : 0;

      /*
        Số phòng đã được booking.
      */

      const bookedQuantity = Math.max(
        0,
        bookedByRoom[
          Number(room.id)
        ] ?? 0
      );

      /*
        Không bao giờ cho available âm.
      */

      const availableQuantity =
        Math.max(
          totalQuantity -
            bookedQuantity,
          0
        );

      /*
        Giá phòng.
      */

      const rawBasePrice =
        Number(room.base_price);

      const basePrice =
        Number.isFinite(rawBasePrice) &&
        rawBasePrice >= 0
          ? rawBasePrice
          : 0;

      return {
        roomId: Number(room.id),

        roomSlug: room.slug,

        hotelId: Number(hotel.id),

        hotelSlug: hotel.slug,

        nameVi: room.name_vi,

        nameEn: room.name_en,

        basePrice,

        totalQuantity,

        bookedQuantity,

        availableQuantity,
      };
    });

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

        checkIn,
        checkOut,

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
