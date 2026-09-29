"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type BookingStatus = "pending" | "confirmed" | "cancelled";

type Booking = {
id: number;
booking_code: string;
hotel_id: number;
check_in: string;
check_out: string;
adults: number;
children: number;
full_name: string;
email: string | null;
phone: string;
note: string | null;
status: BookingStatus;
created_at: string;
hotels:
| {
id: number;
slug: string;
name_vi: string;
name_en: string;
}
| null;
};

type BookingRoom = {
id: number;
booking_id: number;
room_id: number;
quantity: number;
price_per_night: number;
rooms:
| {
id: number;
slug: string;
name_vi: string;
name_en: string;
}
| null;
};

type BookingDetail = Booking & {
booking_rooms: BookingRoom[];
};

type HotelOption = {
id: number;
slug: string;
name_vi: string;
name_en: string;
};

type BookingRoomMap = Record<number, BookingRoom[]>;

const statusOptions = [
{ value: "all", label: "Tất cả trạng thái" },
{ value: "confirmed", label: "Đã xác nhận" },
{ value: "pending", label: "Chờ xử lý" },
{ value: "cancelled", label: "Đã hủy" },
];

export default function AdminBookingsPage() {
const [bookings, setBookings] = useState<Booking[]>([]);
const [hotels, setHotels] = useState<HotelOption[]>([]);
const [bookingRooms, setBookingRooms] = useState<BookingRoomMap>({});

const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);

const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [hotelFilter, setHotelFilter] = useState("all");
const [checkInFilter, setCheckInFilter] = useState("");

const [selectedBooking, setSelectedBooking] =
useState<BookingDetail | null>(null);

const [detailLoading, setDetailLoading] = useState(false);
const [updatingStatus, setUpdatingStatus] = useState(false);
const [deletingBooking, setDeletingBooking] = useState(false);

const loadData = async (showRefresh = false) => {
if (showRefresh) {
setRefreshing(true);
} else {
setLoading(true);
}

const [bookingsResult, hotelsResult, bookingRoomsResult] =
  await Promise.all([
    supabase
      .from("bookings")
      .select(
        `
        id,
        booking_code,
        hotel_id,
        check_in,
        check_out,
        adults,
        children,
        full_name,
        email,
        phone,
        note,
        status,
        created_at,
        hotels (
          id,
          slug,
          name_vi,
          name_en
        )
      `
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("hotels")
      .select("id, slug, name_vi, name_en")
      .eq("status", "active")
      .order("name_vi", { ascending: true }),

    supabase
      .from("booking_rooms")
      .select(
        `
        id,
        booking_id,
        room_id,
        quantity,
        price_per_night,
        rooms (
          id,
          slug,
          name_vi,
          name_en
        )
      `
      )
      .order("id", { ascending: true }),
  ]);

if (bookingsResult.error) {
  console.error("Lỗi tải booking:", bookingsResult.error);
  setBookings([]);
} else {
  setBookings(
    (bookingsResult.data ?? []) as unknown as Booking[]
  );
}

if (hotelsResult.error) {
  console.error("Lỗi tải khách sạn:", hotelsResult.error);
  setHotels([]);
} else {
  setHotels((hotelsResult.data ?? []) as HotelOption[]);
}

if (bookingRoomsResult.error) {
  console.error(
    "Lỗi tải chi tiết phòng booking:",
    bookingRoomsResult.error
  );
  setBookingRooms({});
} else {
  const roomMap: BookingRoomMap = {};

  const rows = (bookingRoomsResult.data ??
    []) as unknown as BookingRoom[];

  rows.forEach((item) => {
    if (!roomMap[item.booking_id]) {
      roomMap[item.booking_id] = [];
    }

    roomMap[item.booking_id].push(item);
  });

  setBookingRooms(roomMap);
}

setLoading(false);
setRefreshing(false);

};

useEffect(() => {
loadData();
}, []);

const filteredBookings = useMemo(() => {
const keyword = search.trim().toLowerCase();

return bookings.filter((booking) => {
  if (
    statusFilter !== "all" &&
    booking.status !== statusFilter
  ) {
    return false;
  }

  if (
    hotelFilter !== "all" &&
    String(booking.hotel_id) !== hotelFilter
  ) {
    return false;
  }

  if (
    checkInFilter &&
    booking.check_in !== checkInFilter
  ) {
    return false;
  }

  if (!keyword) {
    return true;
  }

  const rooms = bookingRooms[booking.id] ?? [];

  const roomText = rooms
    .map((item) =>
      [
        item.rooms?.name_vi ?? "",
        item.rooms?.name_en ?? "",
        item.rooms?.slug ?? "",
      ].join(" ")
    )
    .join(" ")
    .toLowerCase();

  return (
    booking.booking_code
      .toLowerCase()
      .includes(keyword) ||
    booking.full_name
      .toLowerCase()
      .includes(keyword) ||
    booking.phone
      .toLowerCase()
      .includes(keyword) ||
    (booking.email ?? "")
      .toLowerCase()
      .includes(keyword) ||
    (booking.hotels?.name_vi ?? "")
      .toLowerCase()
      .includes(keyword) ||
    roomText.includes(keyword)
  );
});

}, [
bookings,
bookingRooms,
search,
statusFilter,
hotelFilter,
checkInFilter,
]);

const openDetail = async (booking: Booking) => {
const existingRooms = bookingRooms[booking.id] ?? [];

setSelectedBooking({
  ...booking,
  booking_rooms: existingRooms,
});

if (existingRooms.length > 0) {
  return;
}

setDetailLoading(true);

const { data, error } = await supabase
  .from("booking_rooms")
  .select(
    `
    id,
    booking_id,
    room_id,
    quantity,
    price_per_night,
    rooms (
      id,
      slug,
      name_vi,
      name_en
    )
  `
  )
  .eq("booking_id", booking.id)
  .order("id", { ascending: true });

if (error) {
  console.error("Lỗi tải phòng booking:", error);
  setDetailLoading(false);
  return;
}

const rooms = (data ?? []) as unknown as BookingRoom[];

setBookingRooms((current) => ({
  ...current,
  [booking.id]: rooms,
}));

setSelectedBooking({
  ...booking,
  booking_rooms: rooms,
});

setDetailLoading(false);

};

const updateStatus = async (
booking: BookingDetail,
newStatus: BookingStatus
) => {
if (booking.status === newStatus) {
return;
}

const statusText = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
};

const confirmed = window.confirm(
  `Bạn có chắc muốn đổi booking ${booking.booking_code} sang "${statusText[newStatus]}"?`
);

if (!confirmed) {
  return;
}

setUpdatingStatus(true);

const { error } = await supabase
  .from("bookings")
  .update({
    status: newStatus,
  })
  .eq("id", booking.id);

if (error) {
  console.error("Lỗi cập nhật trạng thái:", error);

  window.alert(
    `Không thể cập nhật trạng thái.\n\n${error.message}`
  );

  setUpdatingStatus(false);
  return;
}

const updatedBooking: BookingDetail = {
  ...booking,
  status: newStatus,
};

setBookings((current) =>
  current.map((item) =>
    item.id === booking.id
      ? {
          ...item,
          status: newStatus,
        }
      : item
  )
);

setSelectedBooking(updatedBooking);

setUpdatingStatus(false);

};

const deleteBooking = async (
booking: BookingDetail
) => {
if (deletingBooking) {
return;
}

const confirmed = window.confirm(
  `Bạn có chắc chắn muốn XÓA booking ${booking.booking_code}?\n\n` +
    `Khách: ${booking.full_name}\n` +
    `Check-in: ${formatDate(booking.check_in)}\n` +
    `Check-out: ${formatDate(booking.check_out)}\n\n` +
    `Thao tác này sẽ xóa booking và toàn bộ chi tiết phòng đã đặt. Không thể hoàn tác.`
);

if (!confirmed) {
  return;
}

setDeletingBooking(true);

try {
  const { error: bookingRoomsError } = await supabase
    .from("booking_rooms")
    .delete()
    .eq("booking_id", booking.id);

  if (bookingRoomsError) {
    console.error(
      "Lỗi xóa chi tiết phòng booking:",
      bookingRoomsError
    );

    window.alert(
      `Không thể xóa chi tiết phòng của booking.\n\n${bookingRoomsError.message}`
    );

    setDeletingBooking(false);
    return;
  }

  const { error: bookingError } = await supabase
    .from("bookings")
    .delete()
    .eq("id", booking.id);

  if (bookingError) {
    console.error(
      "Lỗi xóa booking:",
      bookingError
    );

    window.alert(
      `Không thể xóa booking.\n\n${bookingError.message}`
    );

    setDeletingBooking(false);
    return;
  }

  setBookings((current) =>
    current.filter(
      (item) => item.id !== booking.id
    )
  );

  setBookingRooms((current) => {
    const next = { ...current };
    delete next[booking.id];
    return next;
  });

  setSelectedBooking(null);

  window.alert(
    `Đã xóa booking ${booking.booking_code}.`
  );
} catch (error) {
  console.error(
    "Lỗi không xác định khi xóa booking:",
    error
  );

  window.alert(
    "Không thể xóa booking. Vui lòng thử lại."
  );
} finally {
  setDeletingBooking(false);
}

};

const formatDate = (date: string) => {
if (!date) {
return "";
}

return new Intl.DateTimeFormat("vi-VN").format(
  new Date(`${date}T00:00:00`)
);

};

const formatDateTime = (date: string) => {
if (!date) {
return "";
}

return new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
}).format(new Date(date));

};

const formatMoney = (value: number) => {
return new Intl.NumberFormat("vi-VN").format(value) + " đ";
};

const getNights = (
checkIn: string,
checkOut: string
) => {
if (!checkIn || !checkOut) {
return 0;
}

const start = new Date(`${checkIn}T00:00:00`);
const end = new Date(`${checkOut}T00:00:00`);

const difference =
  end.getTime() - start.getTime();

return Math.max(
  0,
  Math.round(
    difference / (1000 * 60 * 60 * 24)
  )
);

};

const getRoomCount = (
rooms: BookingRoom[]
) => {
return rooms.reduce(
(total, item) =>
total + Number(item.quantity || 0),
0
);
};

const getRoomTypeCount = (
rooms: BookingRoom[]
) => {
return rooms.length;
};

const getBookingTotal = (
booking: BookingDetail
) => {
const nights = getNights(
booking.check_in,
booking.check_out
);

return booking.booking_rooms.reduce(
  (total, item) =>
    total +
    Number(item.quantity || 0) *
      Number(item.price_per_night || 0) *
      nights,
  0
);

};

return (
<div>
<div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
<div>
<h1 className="text-2xl font-semibold tracking-tight text-slate-900">
Đặt phòng
</h1>

      <p className="mt-1 text-sm text-slate-500">
        Quản lý toàn bộ booking từ website.
      </p>
    </div>

    <button
      type="button"
      onClick={() => loadData(true)}
      disabled={refreshing}
      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {refreshing ? "Đang tải..." : "Làm mới"}
    </button>
  </div>

  <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_190px_190px_180px]">
    <input
      value={search}
      onChange={(event) =>
        setSearch(event.target.value)
      }
      placeholder="Tìm mã booking, tên khách, điện thoại, phòng..."
      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
    />

    <select
      value={hotelFilter}
      onChange={(event) =>
        setHotelFilter(event.target.value)
      }
      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
    >
      <option value="all">
        Tất cả khách sạn
      </option>

      {hotels.map((hotel) => (
        <option
          key={hotel.id}
          value={String(hotel.id)}
        >
          {hotel.name_vi}
        </option>
      ))}
    </select>

    <select
      value={statusFilter}
      onChange={(event) =>
        setStatusFilter(event.target.value)
      }
      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
    >
      {statusOptions.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>

    <input
      type="date"
      value={checkInFilter}
      onChange={(event) =>
        setCheckInFilter(event.target.value)
      }
      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
    />
  </div>

  {(search ||
    statusFilter !== "all" ||
    hotelFilter !== "all" ||
    checkInFilter) && (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-500">
        Bộ lọc đang dùng:
      </span>

      {search && (
        <FilterTag
          label={`Từ khóa: ${search}`}
          onRemove={() => setSearch("")}
        />
      )}

      {hotelFilter !== "all" && (
        <FilterTag
          label={
            hotels.find(
              (hotel) =>
                String(hotel.id) ===
                hotelFilter
            )?.name_vi ?? "Khách sạn"
          }
          onRemove={() =>
            setHotelFilter("all")
          }
        />
      )}

      {statusFilter !== "all" && (
        <FilterTag
          label={
            statusOptions.find(
              (item) =>
                item.value === statusFilter
            )?.label ?? statusFilter
          }
          onRemove={() =>
            setStatusFilter("all")
          }
        />
      )}

      {checkInFilter && (
        <FilterTag
          label={`Check-in: ${formatDate(
            checkInFilter
          )}`}
          onRemove={() =>
            setCheckInFilter("")
          }
        />
      )}

      <button
        type="button"
        onClick={() => {
          setSearch("");
          setHotelFilter("all");
          setStatusFilter("all");
          setCheckInFilter("");
        }}
        className="ml-1 text-xs font-medium text-sky-600 hover:text-sky-700"
      >
        Xóa tất cả
      </button>
    </div>
  )}

  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1350px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-5 py-4">
              Booking
            </th>

            <th className="px-5 py-4">
              Khách
            </th>

            <th className="px-5 py-4">
              Khách sạn
            </th>

            <th className="px-5 py-4">
              Lưu trú
            </th>

            <th className="px-5 py-4">
              Phòng đã đặt
            </th>

            <th className="px-5 py-4">
              Khách
            </th>

            <th className="px-5 py-4">
              Trạng thái
            </th>

            <th className="px-5 py-4 text-right">
              Thao tác
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td
                colSpan={8}
                className="px-5 py-12 text-center text-slate-400"
              >
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : filteredBookings.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-5 py-12 text-center text-slate-400"
              >
                Không có booking phù hợp.
              </td>
            </tr>
          ) : (
            filteredBookings.map((booking) => {
              const rooms =
                bookingRooms[booking.id] ?? [];

              const roomCount =
                getRoomCount(rooms);

              const roomTypeCount =
                getRoomTypeCount(rooms);

              return (
                <tr
                  key={booking.id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">
                      {booking.booking_code}
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      {formatDateTime(
                        booking.created_at
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">
                      {booking.full_name}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {booking.phone}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {booking.hotels?.name_vi ??
                      "—"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="text-slate-700">
                      {formatDate(
                        booking.check_in
                      )}
                    </div>

                    <div className="text-xs text-slate-400">
                      đến{" "}
                      {formatDate(
                        booking.check_out
                      )}
                    </div>

                    <div className="mt-1 text-xs font-medium text-sky-600">
                      {getNights(
                        booking.check_in,
                        booking.check_out
                      )}{" "}
                      đêm
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    {rooms.length === 0 ? (
                      <span className="text-xs text-slate-400">
                        Chưa có dữ liệu
                      </span>
                    ) : (
                      <div className="max-w-[340px]">
                        <div className="flex flex-wrap gap-1.5">
                          {rooms.map((item) => (
                            <span
                              key={item.id}
                              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                            >
                              {item.rooms
                                ?.name_vi ??
                                "Phòng"}{" "}
                              ×{" "}
                              {item.quantity}
                            </span>
                          ))}
                        </div>

                        <div className="mt-2 text-xs text-slate-500">
                          {roomTypeCount} loại
                          phòng •{" "}
                          {roomCount} phòng
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {booking.adults} người lớn

                    {booking.children > 0 &&
                      ` + ${booking.children} trẻ em`}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge
                      status={booking.status}
                    />
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        openDetail(booking)
                      }
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>

    <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
      Hiển thị{" "}
      <span className="font-semibold text-slate-700">
        {filteredBookings.length}
      </span>{" "}
      / {bookings.length} booking
    </div>
  </div>

  {selectedBooking && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <div className="text-lg font-semibold text-slate-900">
              {selectedBooking.booking_code}
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Chi tiết đặt phòng
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSelectedBooking(null)
            }
            disabled={deletingBooking}
            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Đóng
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <InfoBlock
            title="Thông tin khách"
            items={[
              [
                "Họ tên",
                selectedBooking.full_name,
              ],
              [
                "Điện thoại",
                selectedBooking.phone,
              ],
              [
                "Email",
                selectedBooking.email ||
                  "—",
              ],
              [
                "Người lớn",
                String(
                  selectedBooking.adults
                ),
              ],
              [
                "Trẻ em",
                String(
                  selectedBooking.children
                ),
              ],
            ]}
          />

          <InfoBlock
            title="Thông tin lưu trú"
            items={[
              [
                "Khách sạn",
                selectedBooking.hotels
                  ?.name_vi ?? "—",
              ],
              [
                "Check-in",
                formatDate(
                  selectedBooking.check_in
                ),
              ],
              [
                "Check-out",
                formatDate(
                  selectedBooking.check_out
                ),
              ],
              [
                "Số đêm",
                String(
                  getNights(
                    selectedBooking.check_in,
                    selectedBooking.check_out
                  )
                ),
              ],
              [
                "Tổng số phòng",
                String(
                  getRoomCount(
                    selectedBooking.booking_rooms
                  )
                ),
              ],
              [
                "Loại phòng",
                String(
                  getRoomTypeCount(
                    selectedBooking.booking_rooms
                  )
                ),
              ],
            ]}
          />
        </div>

        <div className="border-t border-slate-200 px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold text-slate-900">
              Chi tiết phòng đã đặt
            </h3>

            <div className="text-sm text-slate-500">
              {getRoomTypeCount(
                selectedBooking.booking_rooms
              )}{" "}
              loại phòng •{" "}
              {getRoomCount(
                selectedBooking.booking_rooms
              )}{" "}
              phòng
            </div>
          </div>

          {detailLoading ? (
            <div className="mt-4 text-sm text-slate-400">
              Đang tải...
            </div>
          ) : selectedBooking
              .booking_rooms.length === 0 ? (
            <div className="mt-4 text-sm text-slate-400">
              Không có dữ liệu phòng.
            </div>
          ) : (
            <>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          Loại phòng
                        </th>

                        <th className="px-4 py-3 text-center">
                          Số lượng
                        </th>

                        <th className="px-4 py-3 text-right">
                          Giá/đêm
                        </th>

                        <th className="px-4 py-3 text-center">
                          Số đêm
                        </th>

                        <th className="px-4 py-3 text-right">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {selectedBooking.booking_rooms.map(
                        (item) => {
                          const nights =
                            getNights(
                              selectedBooking.check_in,
                              selectedBooking.check_out
                            );

                          const subtotal =
                            Number(
                              item.quantity ||
                                0
                            ) *
                            Number(
                              item.price_per_night ||
                                0
                            ) *
                            nights;

                          return (
                            <tr
                              key={item.id}
                            >
                              <td className="px-4 py-4">
                                <div className="font-medium text-slate-800">
                                  {item.rooms
                                    ?.name_vi ??
                                    "—"}
                                </div>

                                {item.rooms
                                  ?.name_en && (
                                  <div className="mt-1 text-xs text-slate-400">
                                    {
                                      item
                                        .rooms
                                        .name_en
                                    }
                                  </div>
                                )}
                              </td>

                              <td className="px-4 py-4 text-center font-medium">
                                {
                                  item.quantity
                                }
                              </td>

                              <td className="px-4 py-4 text-right">
                                {formatMoney(
                                  Number(
                                    item.price_per_night
                                  )
                                )}
                              </td>

                              <td className="px-4 py-4 text-center">
                                {nights}
                              </td>

                              <td className="px-4 py-4 text-right font-medium text-slate-800">
                                {formatMoney(
                                  subtotal
                                )}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <SummaryCard
                  label="Loại phòng"
                  value={`${getRoomTypeCount(
                    selectedBooking.booking_rooms
                  )}`}
                  suffix=" loại"
                />

                <SummaryCard
                  label="Tổng số phòng"
                  value={`${getRoomCount(
                    selectedBooking.booking_rooms
                  )}`}
                  suffix=" phòng"
                />

                <SummaryCard
                  label="Tổng tiền"
                  value={formatMoney(
                    getBookingTotal(
                      selectedBooking
                    )
                  )}
                />
              </div>
            </>
          )}

          {selectedBooking.note && (
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <div className="text-xs font-medium text-slate-500">
                Ghi chú
              </div>

              <div className="mt-2 text-sm text-slate-700">
                {selectedBooking.note}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">
                Trạng thái booking
              </div>

              <div className="mt-2">
                <StatusBadge
                  status={
                    selectedBooking.status
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={
                  updatingStatus ||
                  deletingBooking ||
                  selectedBooking.status ===
                    "pending"
                }
                onClick={() =>
                  updateStatus(
                    selectedBooking,
                    "pending"
                  )
                }
                className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Chờ xử lý
              </button>

              <button
                type="button"
                disabled={
                  updatingStatus ||
                  deletingBooking ||
                  selectedBooking.status ===
                    "confirmed"
                }
                onClick={() =>
                  updateStatus(
                    selectedBooking,
                    "confirmed"
                  )
                }
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Xác nhận
              </button>

              <button
                type="button"
                disabled={
                  updatingStatus ||
                  deletingBooking ||
                  selectedBooking.status ===
                    "cancelled"
                }
                onClick={() =>
                  updateStatus(
                    selectedBooking,
                    "cancelled"
                  )
                }
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Hủy booking
              </button>
            </div>
          </div>

          {updatingStatus && (
            <div className="mt-4 text-xs text-slate-400">
              Đang cập nhật trạng thái...
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">
                Dọn dẹp dữ liệu
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Xóa booking và toàn bộ chi tiết phòng đã đặt.
              </div>
            </div>

            <button
              type="button"
              disabled={
                deletingBooking ||
                updatingStatus
              }
              onClick={() =>
                deleteBooking(
                  selectedBooking
                )
              }
              className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingBooking
                ? "Đang xóa..."
                : "Xóa đặt phòng"}
            </button>
          </div>

          {deletingBooking && (
            <div className="mt-3 text-xs text-red-500">
              Đang xóa booking và dữ liệu phòng...
            </div>
          )}
        </div>
      </div>
    </div>
  )}
</div>

);
}

function StatusBadge({
status,
}: {
status: BookingStatus;
}) {
const config = {
confirmed: {
label: "Đã xác nhận",
className:
"bg-emerald-50 text-emerald-700",
},

pending: {
  label: "Chờ xử lý",
  className:
    "bg-amber-50 text-amber-700",
},

cancelled: {
  label: "Đã hủy",
  className:
    "bg-red-50 text-red-700",
},

} as const;

const item = config[status];

return (
<span
className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${item.className}`}
>
{item.label}
</span>
);
}

function FilterTag({
label,
onRemove,
}: {
label: string;
onRemove: () => void;
}) {
return (
<span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
{label}

  <button
    type="button"
    onClick={onRemove}
    className="font-semibold text-slate-400 hover:text-slate-700"
    aria-label={`Xóa bộ lọc ${label}`}
  >
    ×
  </button>
</span>

);
}

function InfoBlock({
title,
items,
}: {
title: string;
items: [string, string][];
}) {
return (
<div>
<h3 className="font-semibold text-slate-900">
{title}
</h3>

  <div className="mt-4 space-y-3">
    {items.map(([label, value]) => (
      <div
        key={label}
        className="flex justify-between gap-4 border-b border-slate-100 pb-3"
      >
        <span className="text-sm text-slate-500">
          {label}
        </span>

        <span className="text-right text-sm font-medium text-slate-800">
          {value}
        </span>
      </div>
    ))}
  </div>
</div>

);
}

function SummaryCard({
label,
value,
suffix,
}: {
label: string;
value: string;
suffix?: string;
}) {
return (
<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
<div className="text-xs text-slate-500">
{label}
</div>

  <div className="mt-1 text-lg font-semibold text-slate-900">
    {value}
    {suffix && (
      <span className="ml-1 text-sm font-normal text-slate-500">
        {suffix}
      </span>
    )}
  </div>
</div>

);
}