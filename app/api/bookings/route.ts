import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type BookingRoomInput = {
  roomSlug: string;
  quantity: number;
};

type BookingRequest = {
  hotelSlug?: unknown;
  stayType?: unknown;
  checkIn?: unknown;
  checkOut?: unknown;
  months?: unknown;
  adults?: unknown;
  children?: unknown;
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  note?: unknown;
  rooms?: unknown;
};

type RpcBookingResponse = {
  success?: boolean;
  booking?: Record<string, unknown>;
  totalAmount?: number | string;
};

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) &&
    date.getFullYear() === Number(value.slice(0, 4)) &&
    date.getMonth() + 1 === Number(value.slice(5, 7)) &&
    date.getDate() === Number(value.slice(8, 10));
}

function createBookingCode(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `HY${date}${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Thiếu cấu hình Supabase server.");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function formatBookingDate(value: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : "—";
}

async function sendBookingTelegramNotification(data: {
  bookingCode: string;
  hotelName: string;
  fullName: string;
  phone: string;
  stayType: "day" | "month";
  checkIn: string | null;
  checkOut: string | null;
  nights: number;
  months: number | null;
  adults: number;
  children: number;
  rooms: Array<{ name: string; quantity: number; unitPrice: number }>;
  totalAmount: number;
}): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.error("Booking Telegram notification skipped: missing bot configuration.");
    return;
  }

  const monthly = data.stayType === "month";
  const roomLines = data.rooms.flatMap((room) => [
    `🛏 ${room.name} × ${room.quantity}`,
    `   ${new Intl.NumberFormat("vi-VN").format(room.unitPrice)}đ/${monthly ? "tháng" : "đêm"}`,
  ]);
  const message = [
    "🔔 ĐẶT PHÒNG MỚI",
    `🏨 Khách sạn ${data.hotelName}`,
    `👤 Khách: ${data.fullName}`,
    `📞 SĐT: ${data.phone}`,
    ...(monthly
      ? ["📅 Hình thức: Thuê theo tháng", `📅 Thời gian thuê: ${data.months ?? 0} tháng`]
      : [
          `📅 Nhận phòng: ${formatBookingDate(data.checkIn)}`,
          `📅 Trả phòng: ${formatBookingDate(data.checkOut)}`,
          `🌙 Số đêm: ${data.nights}`,
        ]),
    `👥 Người lớn: ${data.adults}`,
    `👶 Trẻ em: ${data.children}`,
    "🛏 PHÒNG:",
    ...(roomLines.length ? roomLines : ["Chưa có thông tin phòng"]),
    `💰 Tổng: ${new Intl.NumberFormat("vi-VN").format(data.totalAmount)}đ`,
    `🔑 Mã đặt phòng: ${data.bookingCode}`,
  ].join("\n");

  let lastError = "Unknown error";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch("https://api.telegram.org/bot" + botToken + "/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message }),
        signal: AbortSignal.timeout(4000),
      });
      const result = await response.json() as { ok?: boolean; description?: string };
      if (response.ok && result.ok) return;

      lastError = result.description ?? `HTTP ${response.status}`;
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === 3) break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error";
      if (attempt === 3) break;
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 700));
  }

  console.error("Booking Telegram notification failed after 3 attempts:", lastError);
}

export async function POST(request: Request) {
  try {
    let body: BookingRequest;
    try {
      body = await request.json() as BookingRequest;
    } catch {
      return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
    }

    const hotelSlug = typeof body.hotelSlug === "string" ? body.hotelSlug.trim() : "";
    const stayType = body.stayType === "month" ? "month" : "day";
    let checkIn = typeof body.checkIn === "string" ? body.checkIn.trim() : "";
    let checkOut = typeof body.checkOut === "string" ? body.checkOut.trim() : "";
    const requestedMonths = Number(body.months);
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const note = typeof body.note === "string" ? body.note.trim() : "";

    if (!hotelSlug || hotelSlug.length > 150) {
      return NextResponse.json({ error: "Thông tin khách sạn không hợp lệ." }, { status: 400 });
    }
    let months: number | null = null;
    if (stayType === "month") {
      if (!Number.isInteger(requestedMonths) || requestedMonths < 1 || requestedMonths > 60) {
        return NextResponse.json({ error: "Số tháng thuê phải từ 1 đến 60." }, { status: 400 });
      }
      months = requestedMonths;
      // Thuê tháng được lưu theo loại thuê và số tháng; không cần ngày nhận/trả.
      checkIn = "";
      checkOut = "";
    } else if (!isValidDate(checkIn) || !isValidDate(checkOut) || checkOut <= checkIn) {
      return NextResponse.json({ error: "Ngày nhận/trả phòng không hợp lệ." }, { status: 400 });
    }
    if (!fullName || fullName.length > 150 || !phone || phone.length > 40) {
      return NextResponse.json({ error: "Vui lòng kiểm tra họ tên và số điện thoại." }, { status: 400 });
    }
    if (email.length > 254 || note.length > 2000) {
      return NextResponse.json({ error: "Email hoặc ghi chú quá dài." }, { status: 400 });
    }

    const adults = Number(body.adults);
    const children = Number(body.children);
    if (!Number.isInteger(adults) || adults < 1 || adults > 30 ||
        !Number.isInteger(children) || children < 0 || children > 30) {
      return NextResponse.json({ error: "Số lượng khách không hợp lệ." }, { status: 400 });
    }

    if (!Array.isArray(body.rooms) || body.rooms.length === 0 || body.rooms.length > 20) {
      return NextResponse.json({ error: "Vui lòng chọn loại phòng hợp lệ." }, { status: 400 });
    }
    const rooms: BookingRoomInput[] = body.rooms.map((value) => {
      const room = value && typeof value === "object" ? value as Record<string, unknown> : {};
      return {
        roomSlug: typeof room.roomSlug === "string" ? room.roomSlug.trim() : "",
        quantity: Number(room.quantity),
      };
    });
    if (rooms.some((room) => !room.roomSlug || room.roomSlug.length > 150 ||
        !Number.isInteger(room.quantity) || room.quantity < 1 || room.quantity > 30)) {
      return NextResponse.json({ error: "Số lượng hoặc loại phòng không hợp lệ." }, { status: 400 });
    }
    if (new Set(rooms.map((room) => room.roomSlug)).size !== rooms.length) {
      return NextResponse.json({ error: "Danh sách phòng bị trùng loại phòng." }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const { data: hotel, error: hotelError } = await supabase
      .from("hotels")
      .select("id, slug, name_vi, name_en")
      .eq("slug", hotelSlug)
      .eq("status", "active")
      .maybeSingle();

    if (hotelError) {
      console.error("Booking hotel lookup failed:", hotelError.message);
      return NextResponse.json({ error: "Không thể kiểm tra khách sạn." }, { status: 500 });
    }
    if (!hotel) return NextResponse.json({ error: "Không tìm thấy khách sạn." }, { status: 404 });

    const bookingCode = createBookingCode();
    // v2 handles both daily and monthly bookings. Monthly bookings are stored
    // by stay type, month count, and monthly room price; they have no dates.
    const rpcName = "create_booking_atomic_v2";
    const rpcArgs = {
      p_booking_code: bookingCode,
      p_hotel_id: Number(hotel.id),
      p_stay_type: stayType,
      p_check_in: stayType === "day" ? checkIn : null,
      p_check_out: stayType === "day" ? checkOut : null,
      p_months: months,
      p_adults: adults,
      p_children: children,
      p_full_name: fullName,
      p_email: email || null,
      p_phone: phone,
      p_note: note || null,
      p_rooms: rooms,
    };
    const { data, error: rpcError } = await supabase.rpc(rpcName, rpcArgs);

    if (rpcError) {
      const message = rpcError.message || "Không thể hoàn tất đặt phòng.";
      console.error(`${rpcName} failed:`, rpcError.message);
      if (message.includes("chỉ còn")) {
        return NextResponse.json({ error: message }, { status: 409 });
      }
      if (message.includes("phù hợp tối đa")) {
        return NextResponse.json({ error: message }, { status: 400 });
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const rpcResult = data as RpcBookingResponse | null;
    if (!rpcResult?.success || !rpcResult.booking) {
      console.error("Invalid create_booking_atomic response.");
      return NextResponse.json({ error: "Không thể hoàn tất đặt phòng." }, { status: 500 });
    }

    const booking = rpcResult.booking;
    const bookingId = Number(booking.id);
    const { data: bookingRooms, error: bookingRoomsError } = await supabase
      .from("booking_rooms")
      .select("booking_id, room_id, quantity, price_per_night, price_per_month")
      .eq("booking_id", bookingId)
      .order("id", { ascending: true });

    if (bookingRoomsError) {
      console.error("Could not load booking room details:", bookingRoomsError.message);
    }

    const roomIds = (bookingRooms ?? []).map((item) => Number(item.room_id)).filter(Number.isFinite);
    const { data: roomDetails, error: roomDetailsError } = roomIds.length
      ? await supabase.from("rooms").select("id, name_vi, name_en").in("id", roomIds)
      : { data: [], error: null };
    if (roomDetailsError) {
      console.error("Could not load room names for Telegram:", roomDetailsError.message);
    }

    const bookingResponse = {
      ...booking,
      id: bookingId,
      bookingCode: booking.bookingCode ?? booking.booking_code ?? bookingCode,
      hotelSlug: hotel.slug,
      hotelNameVi: hotel.name_vi,
      hotelNameEn: hotel.name_en,
      stayType,
      months,
      checkIn: stayType === "day" ? checkIn : null,
      checkOut: stayType === "day" ? checkOut : null,
      nights: stayType === "day"
        ? Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86400000)
        : 0,
      adults,
      children,
      fullName,
      email,
      phone,
      note,
      rooms: bookingRoomsError ? [] : bookingRooms ?? [],
      totalAmount: Number(rpcResult.totalAmount ?? booking.totalAmount ?? booking.total_amount ?? 0),
    };

    await sendBookingTelegramNotification({
      bookingCode: String(bookingResponse.bookingCode),
      hotelName: hotel.name_vi || hotel.name_en || hotel.slug,
      fullName,
      phone,
      stayType,
      checkIn: stayType === "day" ? checkIn : null,
      checkOut: stayType === "day" ? checkOut : null,
      nights: bookingResponse.nights,
      months,
      adults,
      children,
      rooms: (bookingRooms ?? []).map((item, index) => {
        const room = roomDetails?.find((detail) => Number(detail.id) === Number(item.room_id));
        return {
          name: room?.name_vi || room?.name_en || rooms[index]?.roomSlug || `Phòng ${index + 1}`,
          quantity: Number(item.quantity ?? rooms[index]?.quantity ?? 0),
          unitPrice: stayType === "month"
            ? Number(item.price_per_month ?? item.price_per_night ?? 0)
            : Number(item.price_per_night ?? 0),
        };
      }),
      totalAmount: bookingResponse.totalAmount,
    });

    return NextResponse.json({ success: true, booking: bookingResponse });
  } catch (error) {
    console.error("POST /api/bookings failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Có lỗi xảy ra khi tạo đặt phòng." }, { status: 500 });
  }
}