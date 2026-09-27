import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type BookingRoomInput = {
roomSlug: string;
quantity: number;
};

type BookingRequest = {
hotelSlug: string;
checkIn: string;
checkOut: string;
adults: number;
children: number;
fullName: string;
email?: string;
phone: string;
note?: string;
rooms: BookingRoomInput[];
};

function getServerSupabase() {
const supabaseUrl =
process.env.NEXT_PUBLIC_SUPABASE_URL;

const secretKey =
process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
throw new Error(
"Missing NEXT_PUBLIC_SUPABASE_URL"
);
}

if (!secretKey) {
throw new Error(
"Missing SUPABASE_SECRET_KEY"
);
}

return createClient(
supabaseUrl,
secretKey,
{
auth: {
autoRefreshToken: false,
persistSession: false,
},
}
);
}

function isValidDate(
value: string
): boolean {
if (
!/^\d{4}-\d{2}-\d{2}$/.test(
value
)
) {
return false;
}

const parts =
value.split("-");

const year =
Number(parts[0]);

const month =
Number(parts[1]);

const day =
Number(parts[2]);

if (
!Number.isInteger(year) ||
!Number.isInteger(month) ||
!Number.isInteger(day)
) {
return false;
}

if (
month < 1 ||
month > 12
) {
return false;
}

if (
day < 1 ||
day > 31
) {
return false;
}

const daysInMonth =
new Date(
Date.UTC(
year,
month,
0
)
).getUTCDate();

return (
day <= daysInMonth
);
}

function createBookingCode() {
const now =
new Date();

const year =
now.getFullYear();

const month =
String(
now.getMonth() + 1
).padStart(2, "0");

const day =
String(
now.getDate()
).padStart(2, "0");

const random =
Math.floor(
100000 +
Math.random() *
900000
);

return `HY${year}${month}${day}${random}`;
}

function formatDateForTelegram(
value: string
) {
if (
!/^\d{4}-\d{2}-\d{2}$/.test(
value
)
) {
return value;
}

const [
year,
month,
day,
] = value.split("-");

return `${day}/${month}/${year}`;
}

function formatMoney(
value: number
) {
return new Intl.NumberFormat(
"vi-VN"
).format(
Number(value) || 0
) + "đ";
}

async function sendTelegramNotification(
message: string
) {
const botToken =
process.env.TELEGRAM_BOT_TOKEN;

const chatId =
process.env.TELEGRAM_CHAT_ID;

if (
!botToken ||
!chatId
) {
console.warn(
"Telegram notification skipped: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID."
);

return false;

}

try {
const response =
await fetch(
`https://api.telegram.org/bot${botToken}/sendMessage`,
{
method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        chat_id:
          chatId,

        text:
          message,

        disable_web_page_preview:
          true,
      }),

      cache: "no-store",
    }
  );

if (!response.ok) {
  const errorText =
    await response.text();

  console.error(
    "Telegram API error:",
    errorText
  );

  return false;
}

return true;

} catch (error) {
console.error(
"Telegram notification error:",
error
);

return false;

}
}

export async function POST(
request: Request
) {
try {
const body =
(await request.json()) as BookingRequest;

const hotelSlug =
  String(
    body.hotelSlug || ""
  ).trim();

const checkIn =
  String(
    body.checkIn || ""
  ).trim();

const checkOut =
  String(
    body.checkOut || ""
  ).trim();

const fullName =
  String(
    body.fullName || ""
  ).trim();

const email =
  String(
    body.email || ""
  ).trim();

const phone =
  String(
    body.phone || ""
  ).trim();

const note =
  String(
    body.note || ""
  ).trim();

/*
  ==========================================
  1. KIỂM TRA DỮ LIỆU
  ==========================================
*/

if (!hotelSlug) {
  return NextResponse.json(
    {
      error:
        "Thiếu thông tin khách sạn.",
    },
    { status: 400 }
  );
}

/*
  DEBUG NGÀY
*/

const validCheckIn =
  isValidDate(checkIn);

const validCheckOut =
  isValidDate(checkOut);

console.log(
  "DATE VALIDATION DEBUG:",
  {
    checkIn,
    checkOut,
    validCheckIn,
    validCheckOut,
  }
);

if (
  !validCheckIn ||
  !validCheckOut
) {
  return NextResponse.json(
    {
      error:
        "Ngày nhận/trả phòng không hợp lệ.",
    },
    { status: 400 }
  );
}

if (
  checkOut <= checkIn
) {
  return NextResponse.json(
    {
      error:
        "Ngày trả phòng phải sau ngày nhận phòng.",
    },
    { status: 400 }
  );
}

if (!fullName) {
  return NextResponse.json(
    {
      error:
        "Vui lòng nhập họ tên.",
    },
    { status: 400 }
  );
}

if (!phone) {
  return NextResponse.json(
    {
      error:
        "Vui lòng nhập số điện thoại.",
    },
    { status: 400 }
  );
}

/*
  ==========================================
  2. KIỂM TRA KHÁCH
  ==========================================
*/

const adults =
  Number(body.adults);

const children =
  Number(body.children);

if (
  !Number.isInteger(
    adults
  ) ||
  adults < 1
) {
  return NextResponse.json(
    {
      error:
        "Số người lớn không hợp lệ.",
    },
    { status: 400 }
  );
}

if (
  !Number.isInteger(
    children
  ) ||
  children < 0
) {
  return NextResponse.json(
    {
      error:
        "Số trẻ em không hợp lệ.",
    },
    { status: 400 }
  );
}

/*
  ==========================================
  3. KIỂM TRA PHÒNG
  ==========================================
*/

if (
  !Array.isArray(
    body.rooms
  ) ||
  body.rooms.length === 0
) {
  return NextResponse.json(
    {
      error:
        "Chưa chọn phòng.",
    },
    { status: 400 }
  );
}

const rooms =
  body.rooms.map(
    (room) => ({
      roomSlug:
        String(
          room?.roomSlug ||
            ""
        ).trim(),

      quantity:
        Number(
          room?.quantity
        ),
    })
  );

for (
  const room of rooms
) {
  if (
    !room.roomSlug
  ) {
    return NextResponse.json(
      {
        error:
          "Thiếu loại phòng.",
      },
      { status: 400 }
    );
  }

  if (
    !Number.isInteger(
      room.quantity
    ) ||
    room.quantity < 1
  ) {
    return NextResponse.json(
      {
        error:
          "Số lượng phòng không hợp lệ.",
      },
      { status: 400 }
    );
  }
}

/*
  Không cho trùng roomSlug.
*/

const roomSlugs =
  rooms.map(
    (room) =>
      room.roomSlug
  );

const uniqueRoomSlugs =
  new Set(
    roomSlugs
  );

if (
  uniqueRoomSlugs.size !==
  roomSlugs.length
) {
  return NextResponse.json(
    {
      error:
        "Danh sách phòng bị trùng loại phòng.",
    },
    { status: 400 }
  );
}

/*
  ==========================================
  4. SERVER SUPABASE
  ==========================================
*/

const supabase =
  getServerSupabase();

/*
  ==========================================
  5. TÌM HOTEL
  ==========================================
*/

const {
  data: hotel,
  error: hotelError,
} =
  await supabase
    .from("hotels")
    .select(
      `
        id,
        slug,
        name_vi,
        name_en
      `
    )
    .eq(
      "slug",
      hotelSlug
    )
    .eq(
      "status",
      "active"
    )
    .maybeSingle();

if (hotelError) {
  console.error(
    "hotelError:",
    hotelError
  );

  return NextResponse.json(
    {
      error:
        "Không thể kiểm tra khách sạn.",
    },
    { status: 500 }
  );
}

if (!hotel) {
  return NextResponse.json(
    {
      error:
        "Không tìm thấy khách sạn.",
    },
    { status: 404 }
  );
}

/*
  ==========================================
  6. TẠO BOOKING CODE
  ==========================================
*/

const bookingCode =
  createBookingCode();

/*
  ==========================================
  7. GỌI TRANSACTION ATOMIC
  ==========================================
*/

const {
  data,
  error:
    rpcError,
} =
  await supabase.rpc(
    "create_booking_atomic",
    {
      p_booking_code:
        bookingCode,

      p_hotel_id:
        Number(
          hotel.id
        ),

      p_check_in:
        checkIn,

      p_check_out:
        checkOut,

      p_adults:
        adults,

      p_children:
        children,

      p_full_name:
        fullName,

      p_email:
        email || null,

      p_phone:
        phone,

      p_note:
        note || null,

      p_rooms:
        rooms,
    }
  );

if (rpcError) {
  console.error(
    "create_booking_atomic error:",
    rpcError
  );

  const message =
    rpcError.message ||
    "";

  /*
    PostgreSQL exception do
    hết phòng.
  */

  if (
    message.includes(
      "chỉ còn"
    )
  ) {
    return NextResponse.json(
      {
        error:
          message,
      },
      { status: 409 }
    );
  }

  /*
    Lỗi sức chứa.
  */

  if (
    message.includes(
      "phù hợp tối đa"
    )
  ) {
    return NextResponse.json(
      {
        error:
          message,
      },
      { status: 400 }
    );
  }

  /*
    Nếu PostgreSQL báo lỗi liên quan
    đến ngày, trả nguyên message để
    xác định chính xác lỗi.
  */

  if (
    message
      .toLowerCase()
      .includes("date") ||
    message
      .toLowerCase()
      .includes("check_in") ||
    message
      .toLowerCase()
      .includes("check_out") ||
    message
      .toLowerCase()
      .includes("ngày")
  ) {
    return NextResponse.json(
      {
        error:
          `Lỗi dữ liệu ngày từ hệ thống đặt phòng: ${message}`,
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error:
        message ||
        "Không thể hoàn tất đặt phòng.",
    },
    { status: 500 }
  );
}

if (
  !data ||
  data.success !== true ||
  !data.booking
) {
  console.error(
    "Invalid RPC response:",
    data
  );

  return NextResponse.json(
    {
      error:
        "Không thể hoàn tất đặt phòng.",
    },
    { status: 500 }
  );
}

/*
  ==========================================
  8. LẤY BOOKING
  ==========================================
*/

const booking =
  data.booking as {
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
    totalAmount: number;
  };

/*
  ==========================================
  9. LẤY CHI TIẾT PHÒNG
  ==========================================
*/

const {
  data:
    bookingRooms,
  error:
    bookingRoomsError,
} =
  await supabase
    .from("booking_rooms")
    .select(
      `
        booking_id,
        room_id,
        quantity,
        price_per_night
      `
    )
    .eq(
      "booking_id",
      Number(
        booking.id
      )
    )
    .order(
      "id",
      {
        ascending: true,
      }
    );

if (
  bookingRoomsError
) {
  console.error(
    "bookingRoomsError:",
    bookingRoomsError
  );

  /*
    Booking đã tạo thành công,
    không được xóa chỉ vì query
    trả detail lỗi.
  */

  const telegramMessage =
    [
      "🔔 ĐẶT PHÒNG MỚI",
      "",
      `🏨 ${booking.hotelNameVi}`,
      "",
      `👤 Khách: ${booking.fullName}`,
      `📞 SĐT: ${booking.phone}`,
      booking.email
        ? `📧 Email: ${booking.email}`
        : "",
      "",
      `📅 Nhận phòng: ${formatDateForTelegram(
        booking.checkIn
      )}`,
      `📅 Trả phòng: ${formatDateForTelegram(
        booking.checkOut
      )}`,
      `🌙 Số đêm: ${booking.nights}`,
      "",
      `👥 Người lớn: ${booking.adults}`,
      `👶 Trẻ em: ${booking.children}`,
      "",
      `💰 Tổng: ${formatMoney(
        Number(
          booking.totalAmount
        ) || 0
      )}`,
      "",
      `🔑 Mã đặt phòng: ${booking.bookingCode}`,
      booking.note
        ? `\n📝 Ghi chú: ${booking.note}`
        : "",
    ]
      .filter(
        Boolean
      )
      .join("\n");

  await sendTelegramNotification(
    telegramMessage
  );

  return NextResponse.json(
    {
      success: true,

      booking: {
        ...booking,

        rooms: [],

        totalAmount:
          Number(
            booking.totalAmount
          ) || 0,
      },
    }
  );
}

/*
  ==========================================
  10. LẤY TÊN PHÒNG
  ==========================================
*/

const roomIds =
  (bookingRooms || [])
    .map(
      (room) =>
        Number(
          room.room_id
        )
    )
    .filter(
      (id) =>
        Number.isInteger(id)
    );

let roomNames:
  Record<
    number,
    string
  > = {};

if (
  roomIds.length > 0
) {
  const {
    data:
      roomData,
    error:
      roomDataError,
  } =
    await supabase
      .from("rooms")
      .select(
        `
          id,
          name_vi,
          name_en
        `
      )
      .in(
        "id",
        roomIds
      );

  if (
    roomDataError
  ) {
    console.error(
      "roomDataError:",
      roomDataError
    );
  } else {
    roomNames =
      Object.fromEntries(
        (roomData || []).map(
          (room) => [
            Number(
              room.id
            ),
            String(
              room.name_vi ||
                room.name_en ||
                `Phòng #${room.id}`
            ),
          ]
        )
      );
  }
}

/*
  ==========================================
  11. GỬI THÔNG BÁO TELEGRAM
  ==========================================
*/

const roomLines =
  (bookingRooms || [])
    .map(
      (room) => {
        const roomId =
          Number(
            room.room_id
          );

        const roomName =
          roomNames[
            roomId
          ] ||
          `Phòng #${roomId}`;

        const quantity =
          Number(
            room.quantity
          ) || 0;

        const price =
          Number(
            room.price_per_night
          ) || 0;

        return `🛏 ${roomName} × ${quantity}\n   ${formatMoney(
          price
        )}/đêm`;
      }
    )
    .join("\n");

const telegramMessage =
  [
    "🔔 ĐẶT PHÒNG MỚI",
    "",
    `🏨 ${booking.hotelNameVi}`,
    "",
    `👤 Khách: ${booking.fullName}`,
    `📞 SĐT: ${booking.phone}`,
    booking.email
      ? `📧 Email: ${booking.email}`
      : "",
    "",
    `📅 Nhận phòng: ${formatDateForTelegram(
      booking.checkIn
    )}`,
    `📅 Trả phòng: ${formatDateForTelegram(
      booking.checkOut
    )}`,
    `🌙 Số đêm: ${booking.nights}`,
    "",
    `👥 Người lớn: ${booking.adults}`,
    `👶 Trẻ em: ${booking.children}`,
    "",
    "🛏 PHÒNG:",
    roomLines ||
      "Không có thông tin phòng.",
    "",
    `💰 Tổng: ${formatMoney(
      Number(
        booking.totalAmount
      ) || 0
    )}`,
    "",
    `🔑 Mã đặt phòng: ${booking.bookingCode}`,
    booking.note
      ? `\n📝 Ghi chú: ${booking.note}`
      : "",
  ]
    .filter(
      Boolean
    )
    .join("\n");

await sendTelegramNotification(
  telegramMessage
);

/*
  ==========================================
  12. TRẢ KẾT QUẢ
  ==========================================
*/

return NextResponse.json({
  success: true,

  booking: {
    ...booking,

    id: Number(
      booking.id
    ),

    rooms:
      bookingRooms ||
      [],

    totalAmount:
      Number(
        booking.totalAmount
      ) || 0,
  },
});

} catch (error) {
console.error(
"POST /api/bookings error:",
error
);

return NextResponse.json(
  {
    error:
      "Có lỗi xảy ra khi tạo đặt phòng.",
  },
  { status: 500 }
);

}
}