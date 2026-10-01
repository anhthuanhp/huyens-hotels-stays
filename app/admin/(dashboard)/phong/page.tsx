"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
};

type Room = {
  id: number;
  hotel_id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  description_vi: string | null;
  description_en: string | null;
  size: number | null;
  max_guests: number;
  beds_vi: string | null;
  beds_en: string | null;
  base_price_daily: number;
  base_price_monthly: number;
  quantity: number;
  amenities_vi: string[];
  amenities_en: string[];
  status: "active" | "inactive";
};

type RoomForm = {
  hotel_id: string;
  slug: string;
  name_vi: string;
  name_en: string;
  description_vi: string;
  description_en: string;
  size: string;
  max_guests: string;
  beds_vi: string;
  beds_en: string;
  base_price_daily: string;
  base_price_monthly: string;
  quantity: string;
  amenities_vi: string;
  amenities_en: string;
  status: "active" | "inactive";
};

const emptyForm: RoomForm = {
  hotel_id: "",
  slug: "",
  name_vi: "",
  name_en: "",
  description_vi: "",
  description_en: "",
  size: "",
  max_guests: "2",
  beds_vi: "",
  beds_en: "",
  base_price_daily: "0",
  base_price_monthly: "0",
  quantity: "1",
  amenities_vi: "",
  amenities_en: "",
  status: "active",
};

export default function AdminRoomsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [selectedHotel, setSelectedHotel] = useState("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [form, setForm] = useState<RoomForm>(emptyForm);

  const loadData = async () => {
    setLoading(true);

    const [hotelsResult, roomsResult] = await Promise.all([
      supabase
        .from("hotels")
        .select("id, slug, name_vi, name_en")
        .order("name_vi", {
          ascending: true,
        }),

      supabase
        .from("rooms")
        .select("*")
        .order("hotel_id", {
          ascending: true,
        })
        .order("name_vi", {
          ascending: true,
        }),
    ]);

    if (hotelsResult.error) {
      console.error("Lỗi tải khách sạn:", hotelsResult.error);
    } else {
      setHotels((hotelsResult.data ?? []) as Hotel[]);
    }

    if (roomsResult.error) {
      console.error("Lỗi tải phòng:", roomsResult.error);
    } else {
      setRooms((roomsResult.data ?? []) as Room[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rooms.filter((room) => {
      if (
        selectedHotel !== "all" &&
        String(room.hotel_id) !== selectedHotel
      ) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        room.name_vi.toLowerCase().includes(keyword) ||
        room.name_en.toLowerCase().includes(keyword) ||
        room.slug.toLowerCase().includes(keyword)
      );
    });
  }, [rooms, selectedHotel, search]);

  const getHotel = (hotelId: number) => {
    return hotels.find((hotel) => hotel.id === hotelId);
  };

  const openCreate = () => {
    setEditingRoom(null);

    setForm({
      ...emptyForm,
      hotel_id:
        selectedHotel !== "all"
          ? selectedHotel
          : hotels[0]
            ? String(hotels[0].id)
            : "",
    });

    setShowForm(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);

    setForm({
      hotel_id: String(room.hotel_id),
      slug: room.slug,
      name_vi: room.name_vi,
      name_en: room.name_en,
      description_vi: room.description_vi ?? "",
      description_en: room.description_en ?? "",
      size:
        room.size !== null
          ? String(room.size)
          : "",
      max_guests: String(room.max_guests),
      beds_vi: room.beds_vi ?? "",
      beds_en: room.beds_en ?? "",
      base_price_daily: String(
        room.base_price_daily ?? 0
      ),
      base_price_monthly: String(
        room.base_price_monthly ?? 0
      ),
      quantity: String(room.quantity),
      amenities_vi:
        Array.isArray(room.amenities_vi)
          ? room.amenities_vi.join(", ")
          : "",
      amenities_en:
        Array.isArray(room.amenities_en)
          ? room.amenities_en.join(", ")
          : "",
      status: room.status,
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingRoom(null);
    setForm(emptyForm);
  };

  const updateForm = (
    field: keyof RoomForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const parseAmenities = (value: string) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const saveRoom = async () => {
    if (!form.hotel_id) {
      window.alert("Vui lòng chọn khách sạn.");
      return;
    }

    if (!form.slug.trim()) {
      window.alert("Vui lòng nhập slug phòng.");
      return;
    }

    if (!form.name_vi.trim()) {
      window.alert("Vui lòng nhập tên phòng tiếng Việt.");
      return;
    }

    if (!form.name_en.trim()) {
      window.alert("Vui lòng nhập tên phòng tiếng Anh.");
      return;
    }

    const quantity = Number(form.quantity);
    const maxGuests = Number(form.max_guests);

    const basePriceDaily = Number(
      form.base_price_daily
    );

    const basePriceMonthly = Number(
      form.base_price_monthly
    );

    const size =
      form.size.trim() === ""
        ? null
        : Number(form.size);

    if (
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      window.alert(
        "Số lượng phòng phải là số nguyên từ 0 trở lên."
      );
      return;
    }

    if (
      !Number.isInteger(maxGuests) ||
      maxGuests < 1
    ) {
      window.alert(
        "Số khách tối đa phải từ 1 trở lên."
      );
      return;
    }

    if (
      !Number.isFinite(basePriceDaily) ||
      basePriceDaily < 0
    ) {
      window.alert("Giá ngày không hợp lệ.");
      return;
    }

    if (
      !Number.isFinite(basePriceMonthly) ||
      basePriceMonthly < 0
    ) {
      window.alert("Giá tháng không hợp lệ.");
      return;
    }

    if (
      size !== null &&
      (!Number.isFinite(size) || size <= 0)
    ) {
      window.alert("Diện tích phòng không hợp lệ.");
      return;
    }

    setSaving(true);

    const payload = {
      hotel_id: Number(form.hotel_id),
      slug: form.slug.trim(),
      name_vi: form.name_vi.trim(),
      name_en: form.name_en.trim(),
      description_vi:
        form.description_vi.trim() || null,
      description_en:
        form.description_en.trim() || null,
      size,
      max_guests: maxGuests,
      beds_vi: form.beds_vi.trim() || null,
      beds_en: form.beds_en.trim() || null,
      base_price_daily: basePriceDaily,
      base_price_monthly: basePriceMonthly,
      quantity,
      amenities_vi:
        parseAmenities(form.amenities_vi),
      amenities_en:
        parseAmenities(form.amenities_en),
      status: form.status,
    };

    let error = null;

    if (editingRoom) {
      const result = await supabase
        .from("rooms")
        .update(payload)
        .eq("id", editingRoom.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("rooms")
        .insert(payload);

      error = result.error;
    }

    if (error) {
      console.error("Lỗi lưu phòng:", error);

      window.alert(
        `Không thể lưu phòng.\n\n${error.message}`
      );

      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(false);
    setEditingRoom(null);
    setForm(emptyForm);

    await loadData();
  };

  const deleteRoom = async (room: Room) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa loại phòng "${room.name_vi}"?\n\nNếu phòng này đã từng được dùng trong booking, database có thể không cho phép xóa.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(room.id);

    const { error } = await supabase
      .from("rooms")
      .delete()
      .eq("id", room.id);

    if (error) {
      console.error("Lỗi xóa phòng:", error);

      window.alert(
        `Không thể xóa phòng.\n\n${error.message}\n\nNếu phòng đã có booking, nên chuyển trạng thái sang "Ngừng bán" thay vì xóa.`
      );

      setDeleting(null);
      return;
    }

    setDeleting(null);

    await loadData();
  };

  const toggleStatus = async (room: Room) => {
    const newStatus =
      room.status === "active"
        ? "inactive"
        : "active";

    const { error } = await supabase
      .from("rooms")
      .update({
        status: newStatus,
      })
      .eq("id", room.id);

    if (error) {
      console.error(
        "Lỗi đổi trạng thái:",
        error
      );

      window.alert(
        `Không thể cập nhật trạng thái.\n\n${error.message}`
      );

      return;
    }

    setRooms((current) =>
      current.map((item) =>
        item.id === room.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );
  };

  const formatMoney = (value: number) => {
    return (
      new Intl.NumberFormat("vi-VN").format(
        value
      ) + " đ"
    );
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Phòng
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Quản lý loại phòng, giá ngày, giá tháng và số lượng phòng thực tế.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          disabled={hotels.length === 0}
          className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Thêm loại phòng
        </button>
      </div>

      <div className="mb-5 grid gap-3 lg:grid-cols-[240px_1fr]">
        <select
          value={selectedHotel}
          onChange={(event) =>
            setSelectedHotel(
              event.target.value
            )
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

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Tìm tên phòng hoặc slug..."
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tổng loại phòng"
          value={String(
            filteredRooms.length
          )}
        />

        <StatCard
          label="Đang bán"
          value={String(
            filteredRooms.filter(
              (room) =>
                room.status === "active"
            ).length
          )}
        />

        <StatCard
          label="Ngừng bán"
          value={String(
            filteredRooms.filter(
              (room) =>
                room.status === "inactive"
            ).length
          )}
        />

        <StatCard
          label="Tổng số phòng"
          value={String(
            filteredRooms.reduce(
              (total, room) =>
                total +
                Number(room.quantity || 0),
              0
            )
          )}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">
                  Phòng
                </th>

                <th className="px-5 py-4">
                  Khách sạn
                </th>

                <th className="px-5 py-4">
                  Diện tích
                </th>

                <th className="px-5 py-4">
                  Sức chứa
                </th>

                <th className="px-5 py-4">
                  Giá/ngày
                </th>

                <th className="px-5 py-4">
                  Giá/tháng
                </th>

                <th className="px-5 py-4">
                  Số lượng
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
                    colSpan={9}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    Chưa có loại phòng phù hợp.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr
                    key={room.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {room.name_vi}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {room.name_en}
                        </div>

                        <div className="mt-1 text-[11px] text-slate-400">
                          {room.slug}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-slate-700">
                        {getHotel(room.hotel_id)
                          ?.name_vi ?? "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {room.size
                        ? `${room.size} m²`
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {room.max_guests} khách
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">
                        {formatMoney(
                          Number(
                            room.base_price_daily || 0
                          )
                        )}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        VNĐ / đêm
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">
                        {formatMoney(
                          Number(
                            room.base_price_monthly || 0
                          )
                        )}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        VNĐ / tháng
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-800">
                        {room.quantity}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          toggleStatus(room)
                        }
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          room.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {room.status === "active"
                          ? "Đang bán"
                          : "Ngừng bán"}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEdit(room)
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteRoom(room)
                          }
                          disabled={
                            deleting === room.id
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deleting === room.id
                            ? "Đang xóa..."
                            : "Xóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingRoom
                    ? "Sửa loại phòng"
                    : "Thêm loại phòng"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Thông tin này sẽ được sử dụng cho website và hệ thống đặt phòng.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>

            <div className="grid gap-6 p-6">
              <section>
                <h3 className="mb-4 font-semibold text-slate-900">
                  Thông tin cơ bản
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Khách sạn">
                    <select
                      value={form.hotel_id}
                      onChange={(event) =>
                        updateForm(
                          "hotel_id",
                          event.target.value
                        )
                      }
                      className={inputClass}
                    >
                      <option value="">
                        Chọn khách sạn
                      </option>

                      {hotels.map((hotel) => (
                        <option
                          key={hotel.id}
                          value={String(
                            hotel.id
                          )}
                        >
                          {hotel.name_vi}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Slug">
                    <input
                      value={form.slug}
                      onChange={(event) =>
                        updateForm(
                          "slug",
                          event.target.value
                        )
                      }
                      placeholder="deluxe-double"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Tên phòng tiếng Việt">
                    <input
                      value={form.name_vi}
                      onChange={(event) =>
                        updateForm(
                          "name_vi",
                          event.target.value
                        )
                      }
                      placeholder="Deluxe Double"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Tên phòng tiếng Anh">
                    <input
                      value={form.name_en}
                      onChange={(event) =>
                        updateForm(
                          "name_en",
                          event.target.value
                        )
                      }
                      placeholder="Deluxe Double Room"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Diện tích (m²)">
                    <input
                      type="number"
                      min="0"
                      value={form.size}
                      onChange={(event) =>
                        updateForm(
                          "size",
                          event.target.value
                        )
                      }
                      placeholder="25"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Số khách tối đa">
                    <input
                      type="number"
                      min="1"
                      value={form.max_guests}
                      onChange={(event) =>
                        updateForm(
                          "max_guests",
                          event.target.value
                        )
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Giá ngày / đêm (VNĐ)">
                    <input
                      type="number"
                      min="0"
                      value={
                        form.base_price_daily
                      }
                      onChange={(event) =>
                        updateForm(
                          "base_price_daily",
                          event.target.value
                        )
                      }
                      placeholder="500000"
                      className={inputClass}
                    />

                    <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      Giá dùng khi khách đặt theo ngày.
                    </div>
                  </Field>

                  <Field label="Giá tháng (VNĐ)">
                    <input
                      type="number"
                      min="0"
                      value={
                        form.base_price_monthly
                      }
                      onChange={(event) =>
                        updateForm(
                          "base_price_monthly",
                          event.target.value
                        )
                      }
                      placeholder="8000000"
                      className={inputClass}
                    />

                    <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                      Giá dùng khi khách thuê theo tháng.
                    </div>
                  </Field>

                  <Field label="Tổng số phòng">
                    <input
                      type="number"
                      min="0"
                      value={form.quantity}
                      onChange={(event) =>
                        updateForm(
                          "quantity",
                          event.target.value
                        )
                      }
                      className={inputClass}
                    />

                    <p className="mt-1 text-xs text-slate-400">
                      Ví dụ loại phòng này có 5 phòng thực tế → nhập 5.
                    </p>
                  </Field>
                </div>

                <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4">
                  <div className="text-sm font-semibold text-sky-900">
                    Giá phòng
                  </div>

                  <p className="mt-1 text-xs leading-5 text-sky-700">
                    Mỗi loại phòng có thể bán đồng thời theo ngày
                    và theo tháng. Hai mức giá được lưu riêng cho từng phòng.
                  </p>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-white p-3">
                      <div className="text-xs text-slate-500">
                        Giá ngày
                      </div>

                      <div className="mt-1 font-semibold text-emerald-700">
                        {formatMoney(
                          Number(
                            form.base_price_daily || 0
                          )
                        )}{" "}
                        / đêm
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-3">
                      <div className="text-xs text-slate-500">
                        Giá tháng
                      </div>

                      <div className="mt-1 font-semibold text-blue-700">
                        {formatMoney(
                          Number(
                            form.base_price_monthly || 0
                          )
                        )}{" "}
                        / tháng
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-4 font-semibold text-slate-900">
                  Giường
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Giường tiếng Việt">
                    <input
                      value={form.beds_vi}
                      onChange={(event) =>
                        updateForm(
                          "beds_vi",
                          event.target.value
                        )
                      }
                      placeholder="1 giường đôi"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Giường tiếng Anh">
                    <input
                      value={form.beds_en}
                      onChange={(event) =>
                        updateForm(
                          "beds_en",
                          event.target.value
                        )
                      }
                      placeholder="1 double bed"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </section>

              <section>
                <h3 className="mb-4 font-semibold text-slate-900">
                  Mô tả
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Mô tả tiếng Việt">
                    <textarea
                      value={
                        form.description_vi
                      }
                      onChange={(event) =>
                        updateForm(
                          "description_vi",
                          event.target.value
                        )
                      }
                      rows={5}
                      className={textareaClass}
                    />
                  </Field>

                  <Field label="Mô tả tiếng Anh">
                    <textarea
                      value={
                        form.description_en
                      }
                      onChange={(event) =>
                        updateForm(
                          "description_en",
                          event.target.value
                        )
                      }
                      rows={5}
                      className={textareaClass}
                    />
                  </Field>
                </div>
              </section>

              <section>
                <h3 className="mb-4 font-semibold text-slate-900">
                  Tiện nghi
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Tiện nghi tiếng Việt">
                    <textarea
                      value={form.amenities_vi}
                      onChange={(event) =>
                        updateForm(
                          "amenities_vi",
                          event.target.value
                        )
                      }
                      rows={4}
                      placeholder="WiFi, Điều hòa, TV, Tủ lạnh"
                      className={textareaClass}
                    />

                    <p className="mt-1 text-xs text-slate-400">
                      Nhập các tiện nghi, cách nhau bằng dấu phẩy.
                    </p>
                  </Field>

                  <Field label="Tiện nghi tiếng Anh">
                    <textarea
                      value={form.amenities_en}
                      onChange={(event) =>
                        updateForm(
                          "amenities_en",
                          event.target.value
                        )
                      }
                      rows={4}
                      placeholder="WiFi, Air conditioning, TV, Refrigerator"
                      className={textareaClass}
                    />
                  </Field>
                </div>
              </section>

              <section>
                <h3 className="mb-4 font-semibold text-slate-900">
                  Trạng thái
                </h3>

                <Field label="Trạng thái">
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        "status",
                        event.target.value as
                          | "active"
                          | "inactive"
                      )
                    }
                    className={inputClass}
                  >
                    <option value="active">
                      Đang bán
                    </option>

                    <option value="inactive">
                      Ngừng bán
                    </option>
                  </select>
                </Field>
              </section>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={saveRoom}
                disabled={saving}
                className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Đang lưu..."
                  : editingRoom
                    ? "Lưu thay đổi"
                    : "Thêm loại phòng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-2xl font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

const textareaClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";