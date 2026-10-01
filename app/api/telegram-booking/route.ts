import { NextResponse } from "next/server";

type BookingRoom = {
  name?: string;
  quantity?: number;
};

type RequestBody = {
  bookingCode?: string;
  hotelName?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  stayType?: "day" | "month";
  checkIn?: string;
  checkOut?: string;
  months?: number;
  nights?: number;
  adults?: number;
  children?: number;
  rooms?: BookingRoom[];
  totalAmount?: number;
  note?: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(
    Math.max(0, Number(value) || 0),
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export async function POST(request: Request) {
  try {
    const token =
      process.env.TELEGRAM_BOT_TOKEN;

    const chatId =
      process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error(
        "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID",
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Telegram is not configured.",
        },
        { status: 500 },
      );
    }

    const body =
      (await request.json()) as RequestBody;

    const roomLines =
      (body.rooms || []).map((room) => {
        const name =
          room.name || "Phòng";

        const quantity =
          Number(room.quantity || 0);

        return `- ${name}: ${quantity} phòng`;
      });

    const stayInfo =
      body.stayType === "month"
        ? [
            "Hình thức: Thuê theo tháng",
            `Thời gian: ${Number(
              body.months || 1,
            )} tháng`,
          ].join("\n")
        : [
            "Hình thức: Đặt theo đêm",
            `Nhận phòng: ${formatDate(
              body.checkIn,
            )}`,
            `Trả phòng: ${formatDate(
              body.checkOut,
            )}`,
            `Số đêm: ${Number(
              body.nights || 0,
            )}`,
          ].join("\n");

    const message = [
      "🆕 ĐẶT PHÒNG MỚI",
      "",
      `Mã đặt phòng: ${
        body.bookingCode || "-"
      }`,
      `Khách sạn: ${
        body.hotelName || "-"
      }`,
      "",
      `Khách hàng: ${
        body.fullName || "-"
      }`,
      `Điện thoại: ${
        body.phone || "-"
      }`,
      `Email: ${
        body.email || "-"
      }`,
      "",
      stayInfo,
      `Người lớn: ${Number(
        body.adults || 0,
      )}`,
      `Trẻ em: ${Number(
        body.children || 0,
      )}`,
      "",
      "PHÒNG:",
      ...(roomLines.length > 0
        ? roomLines
        : ["- Không có thông tin phòng"]),
      "",
      `TỔNG TIỀN: ${formatMoney(
        Number(body.totalAmount || 0),
      )} VND`,
      "",
      `Ghi chú: ${
        body.note?.trim() || "-"
      }`,
      "",
      "Nguồn: huyenhotels.com",
    ].join("\n");

    const telegramResponse =
      await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
        },
      );

    const telegramResult =
      (await telegramResponse.json()) as {
        ok?: boolean;
        description?: string;
      };

    if (
      !telegramResponse.ok ||
      !telegramResult.ok
    ) {
      console.error(
        "Telegram sendMessage failed:",
        telegramResult,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            telegramResult.description ||
            "Unable to send Telegram message.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Telegram notification error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to send Telegram notification.",
      },
      { status: 500 },
    );
  }
}