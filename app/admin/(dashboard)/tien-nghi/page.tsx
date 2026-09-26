"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Amenity = {
  id: number;
  name_vi: string;
  name_en: string;
  icon: string | null;
  sort_order: number;
  status: "active" | "inactive";
};

type HotelAmenityCatalog = {
  id: number;
  name_vi: string;
  name_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  icon: string | null;
  sort_order: number;
  status: "active" | "inactive";
};

type Room = {
  id: number;
  hotel_id: number;
  name_vi: string;
  name_en: string;
  status: "active" | "inactive";
};

type Hotel = {
  id: number;
  name_vi: string;
  name_en: string;
};

type RoomAmenity = {
  id: number;
  room_id: number;
  amenity_id: number | null;
  name_vi: string;
  name_en: string;
  icon: string | null;
  sort_order: number;
  status: "active" | "inactive";
};

type HotelAmenity = {
  id: number;
  hotel_id: number;
  amenity_id: number | null;
  name_vi: string;
  name_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  icon: string | null;
  sort_order: number;
  status: "active" | "inactive";
};

type MainTab = "room" | "hotel";

export default function TienNghiPage() {
  // =========================================================
  // TIỆN NGHI PHÒNG
  // =========================================================

  const [amenities, setAmenities] = useState<Amenity[]>([]);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [roomAmenities, setRoomAmenities] = useState<RoomAmenity[]>([]);

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);

  const [showAddRoomAmenity, setShowAddRoomAmenity] = useState(false);
  const [editingAmenity, setEditingAmenity] =
    useState<Amenity | null>(null);

  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [icon, setIcon] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  // =========================================================
  // TIỆN ÍCH KHÁCH SẠN - DANH MỤC
  // =========================================================

  const [hotelAmenityCatalog, setHotelAmenityCatalog] = useState<
    HotelAmenityCatalog[]
  >([]);

  const [hotelAmenities, setHotelAmenities] = useState<HotelAmenity[]>([]);

  const [showAddHotelAmenity, setShowAddHotelAmenity] = useState(false);
  const [editingHotelAmenity, setEditingHotelAmenity] =
    useState<HotelAmenityCatalog | null>(null);

  const [hotelNameVi, setHotelNameVi] = useState("");
  const [hotelNameEn, setHotelNameEn] = useState("");
  const [hotelDescriptionVi, setHotelDescriptionVi] = useState("");
  const [hotelDescriptionEn, setHotelDescriptionEn] = useState("");
  const [hotelIcon, setHotelIcon] = useState("");
  const [hotelSortOrder, setHotelSortOrder] = useState("0");

  // =========================================================
  // GÁN TIỆN ÍCH KHÁCH SẠN
  // =========================================================

  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([]);
  const [savingHotelAssignments, setSavingHotelAssignments] = useState(false);

  // =========================================================
  // CHUNG
  // =========================================================

  const [mainTab, setMainTab] = useState<MainTab>("room");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    syncSelectedHotelAmenities();
  }, [selectedHotelId, hotelAmenities]);

  async function loadData() {
    setLoading(true);
    setError("");

    const [
      amenitiesResult,
      hotelsResult,
      roomsResult,
      roomAmenitiesResult,
      hotelAmenityCatalogResult,
      hotelAmenitiesResult,
    ] = await Promise.all([
      // -------------------------------------------------------
      // TIỆN NGHI PHÒNG
      // -------------------------------------------------------

      supabase
        .from("amenity_catalog")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),

      supabase
        .from("hotels")
        .select("id, name_vi, name_en")
        .eq("status", "active")
        .order("id", { ascending: true }),

      supabase
        .from("rooms")
        .select("id, hotel_id, name_vi, name_en, status")
        .eq("status", "active")
        .order("hotel_id", { ascending: true })
        .order("id", { ascending: true }),

      supabase
        .from("room_amenities")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),

      // -------------------------------------------------------
      // TIỆN ÍCH KHÁCH SẠN - DANH MỤC
      // -------------------------------------------------------

      supabase
        .from("hotel_amenity_catalog")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),

      // -------------------------------------------------------
      // TIỆN ÍCH ĐÃ GÁN CHO KHÁCH SẠN
      // -------------------------------------------------------

      supabase
        .from("hotel_amenities")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
    ]);

    if (amenitiesResult.error) {
      setError(
        `Không tải được danh mục tiện nghi phòng: ${amenitiesResult.error.message}`
      );
    }

    if (hotelsResult.error) {
      setError(
        `Không tải được khách sạn: ${hotelsResult.error.message}`
      );
    }

    if (roomsResult.error) {
      setError(
        `Không tải được phòng: ${roomsResult.error.message}`
      );
    }

    if (roomAmenitiesResult.error) {
      setError(
        `Không tải được tiện nghi phòng: ${roomAmenitiesResult.error.message}`
      );
    }

    if (hotelAmenityCatalogResult.error) {
      setError(
        `Không tải được danh mục tiện ích khách sạn: ${hotelAmenityCatalogResult.error.message}`
      );
    }

    if (hotelAmenitiesResult.error) {
      setError(
        `Không tải được tiện ích khách sạn: ${hotelAmenitiesResult.error.message}`
      );
    }

    setAmenities((amenitiesResult.data || []) as Amenity[]);
    setHotels((hotelsResult.data || []) as Hotel[]);
    setRooms((roomsResult.data || []) as Room[]);
    setRoomAmenities((roomAmenitiesResult.data || []) as RoomAmenity[]);

    setHotelAmenityCatalog(
      (hotelAmenityCatalogResult.data || []) as HotelAmenityCatalog[]
    );

    setHotelAmenities(
      (hotelAmenitiesResult.data || []) as HotelAmenity[]
    );

    setLoading(false);
  }

  // =========================================================
  // TIỆN NGHI PHÒNG - FORM
  // =========================================================

  function resetRoomAmenityForm() {
    setNameVi("");
    setNameEn("");
    setIcon("");
    setSortOrder("0");
    setEditingAmenity(null);
  }

  function openAddRoomAmenity() {
    resetRoomAmenityForm();

    const nextSort =
      amenities.length > 0
        ? Math.max(...amenities.map((a) => a.sort_order)) + 1
        : 1;

    setSortOrder(String(nextSort));

    setShowAddRoomAmenity(true);
    setMessage("");
    setError("");
  }

  function openEditRoomAmenity(amenity: Amenity) {
    setEditingAmenity(amenity);

    setNameVi(amenity.name_vi);
    setNameEn(amenity.name_en);
    setIcon(amenity.icon || "");
    setSortOrder(String(amenity.sort_order));

    setShowAddRoomAmenity(true);
    setMessage("");
    setError("");
  }

  function closeRoomAmenityForm() {
    setShowAddRoomAmenity(false);
    resetRoomAmenityForm();
  }

  async function saveRoomAmenity() {
    if (!nameVi.trim()) {
      setError("Vui lòng nhập tên tiện nghi tiếng Việt.");
      return;
    }

    if (!nameEn.trim()) {
      setError("Vui lòng nhập tên tiện nghi tiếng Anh.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name_vi: nameVi.trim(),
      name_en: nameEn.trim(),
      icon: icon.trim() || null,
      sort_order: Number(sortOrder) || 0,
    };

    if (editingAmenity) {
      const { error: updateError } = await supabase
        .from("amenity_catalog")
        .update(payload)
        .eq("id", editingAmenity.id);

      if (updateError) {
        setError(`Không thể cập nhật: ${updateError.message}`);
        setSaving(false);
        return;
      }

      await supabase
        .from("room_amenities")
        .update({
          name_vi: payload.name_vi,
          name_en: payload.name_en,
          icon: payload.icon,
          sort_order: payload.sort_order,
        })
        .eq("amenity_id", editingAmenity.id);

      setMessage("Đã cập nhật tiện nghi phòng.");
    } else {
      const { error: insertError } = await supabase
        .from("amenity_catalog")
        .insert(payload);

      if (insertError) {
        setError(`Không thể thêm tiện nghi: ${insertError.message}`);
        setSaving(false);
        return;
      }

      setMessage("Đã thêm tiện nghi phòng mới.");
    }

    closeRoomAmenityForm();

    await loadData();

    setSaving(false);
  }

  async function toggleAmenity(amenity: Amenity) {
    setError("");
    setMessage("");

    const newStatus =
      amenity.status === "active" ? "inactive" : "active";

    const { error: updateError } = await supabase
      .from("amenity_catalog")
      .update({
        status: newStatus,
      })
      .eq("id", amenity.id);

    if (updateError) {
      setError(
        `Không thể thay đổi trạng thái: ${updateError.message}`
      );
      return;
    }

    setMessage(
      newStatus === "active"
        ? `Đã bật "${amenity.name_vi}".`
        : `Đã tắt "${amenity.name_vi}".`
    );

    await loadData();
  }

  async function deleteAmenity(amenity: Amenity) {
    const usedRooms = roomAmenities.filter(
      (item) => item.amenity_id === amenity.id
    );

    const confirmed = window.confirm(
      usedRooms.length > 0
        ? `"${amenity.name_vi}" đang được gán cho ${usedRooms.length} phòng.\n\nXóa tiện nghi này sẽ xóa luôn việc gán khỏi các phòng đó.\n\nBạn có chắc muốn xóa?`
        : `Bạn có chắc muốn xóa "${amenity.name_vi}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    const { error: assignmentError } = await supabase
      .from("room_amenities")
      .delete()
      .eq("amenity_id", amenity.id);

    if (assignmentError) {
      setError(
        `Không thể xóa gán tiện nghi: ${assignmentError.message}`
      );
      return;
    }

    const { error: deleteError } = await supabase
      .from("amenity_catalog")
      .delete()
      .eq("id", amenity.id);

    if (deleteError) {
      setError(`Không thể xóa tiện nghi: ${deleteError.message}`);
      return;
    }

    setMessage(`Đã xóa "${amenity.name_vi}".`);

    await loadData();
  }

  // =========================================================
  // TIỆN ÍCH KHÁCH SẠN - FORM DANH MỤC
  // =========================================================

  function resetHotelAmenityForm() {
    setHotelNameVi("");
    setHotelNameEn("");
    setHotelDescriptionVi("");
    setHotelDescriptionEn("");
    setHotelIcon("");
    setHotelSortOrder("0");
    setEditingHotelAmenity(null);
  }

  function openAddHotelAmenity() {
    resetHotelAmenityForm();

    const nextSort =
      hotelAmenityCatalog.length > 0
        ? Math.max(
            ...hotelAmenityCatalog.map((a) => a.sort_order)
          ) + 1
        : 1;

    setHotelSortOrder(String(nextSort));

    setShowAddHotelAmenity(true);
    setMessage("");
    setError("");
  }

  function openEditHotelAmenity(
    amenity: HotelAmenityCatalog
  ) {
    setEditingHotelAmenity(amenity);

    setHotelNameVi(amenity.name_vi);
    setHotelNameEn(amenity.name_en || "");
    setHotelDescriptionVi(amenity.description_vi || "");
    setHotelDescriptionEn(amenity.description_en || "");
    setHotelIcon(amenity.icon || "");
    setHotelSortOrder(String(amenity.sort_order));

    setShowAddHotelAmenity(true);
    setMessage("");
    setError("");
  }

  function closeHotelAmenityForm() {
    setShowAddHotelAmenity(false);
    resetHotelAmenityForm();
  }

  async function saveHotelAmenity() {
    if (!hotelNameVi.trim()) {
      setError(
        "Vui lòng nhập tên tiện ích khách sạn tiếng Việt."
      );
      return;
    }

    if (!hotelNameEn.trim()) {
      setError(
        "Vui lòng nhập tên tiện ích khách sạn tiếng Anh."
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name_vi: hotelNameVi.trim(),
      name_en: hotelNameEn.trim(),
      description_vi:
        hotelDescriptionVi.trim() || null,
      description_en:
        hotelDescriptionEn.trim() || null,
      icon: hotelIcon.trim() || null,
      sort_order: Number(hotelSortOrder) || 0,
    };

    if (editingHotelAmenity) {
      const { error: updateError } = await supabase
        .from("hotel_amenity_catalog")
        .update(payload)
        .eq("id", editingHotelAmenity.id);

      if (updateError) {
        setError(
          `Không thể cập nhật tiện ích khách sạn: ${updateError.message}`
        );
        setSaving(false);
        return;
      }

      /*
       * Đồng bộ thông tin hiển thị sang các bản ghi
       * đã được gán cho khách sạn.
       */
      const { error: syncError } = await supabase
        .from("hotel_amenities")
        .update({
          name_vi: payload.name_vi,
          name_en: payload.name_en,
          description_vi: payload.description_vi,
          description_en: payload.description_en,
          icon: payload.icon,
          sort_order: payload.sort_order,
        })
        .eq("amenity_id", editingHotelAmenity.id);

      if (syncError) {
        setError(
          `Đã cập nhật danh mục nhưng không đồng bộ được dữ liệu khách sạn: ${syncError.message}`
        );
        setSaving(false);
        return;
      }

      setMessage("Đã cập nhật tiện ích khách sạn.");
    } else {
      const { error: insertError } = await supabase
        .from("hotel_amenity_catalog")
        .insert(payload);

      if (insertError) {
        setError(
          `Không thể thêm tiện ích khách sạn: ${insertError.message}`
        );
        setSaving(false);
        return;
      }

      setMessage("Đã thêm tiện ích khách sạn mới.");
    }

    closeHotelAmenityForm();

    await loadData();

    setSaving(false);
  }

  async function toggleHotelAmenity(
    amenity: HotelAmenityCatalog
  ) {
    setError("");
    setMessage("");

    const newStatus =
      amenity.status === "active" ? "inactive" : "active";

    const { error: updateError } = await supabase
      .from("hotel_amenity_catalog")
      .update({
        status: newStatus,
      })
      .eq("id", amenity.id);

    if (updateError) {
      setError(
        `Không thể thay đổi trạng thái: ${updateError.message}`
      );
      return;
    }

    setMessage(
      newStatus === "active"
        ? `Đã bật "${amenity.name_vi}".`
        : `Đã tắt "${amenity.name_vi}".`
    );

    await loadData();
  }

  async function deleteHotelAmenity(
    amenity: HotelAmenityCatalog
  ) {
    const usedHotels = hotelAmenities.filter(
      (item) => item.amenity_id === amenity.id
    );

    const confirmed = window.confirm(
      usedHotels.length > 0
        ? `"${amenity.name_vi}" đang được gán cho ${usedHotels.length} khách sạn.\n\nXóa tiện ích này sẽ xóa luôn việc gán khỏi các khách sạn đó.\n\nBạn có chắc muốn xóa?`
        : `Bạn có chắc muốn xóa "${amenity.name_vi}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    const { error: assignmentError } = await supabase
      .from("hotel_amenities")
      .delete()
      .eq("amenity_id", amenity.id);

    if (assignmentError) {
      setError(
        `Không thể xóa gán tiện ích: ${assignmentError.message}`
      );
      return;
    }

    const { error: deleteError } = await supabase
      .from("hotel_amenity_catalog")
      .delete()
      .eq("id", amenity.id);

    if (deleteError) {
      setError(
        `Không thể xóa tiện ích khách sạn: ${deleteError.message}`
      );
      return;
    }

    setMessage(`Đã xóa "${amenity.name_vi}".`);

    await loadData();
  }

  // =========================================================
  // GÁN TIỆN ÍCH CHO KHÁCH SẠN
  // =========================================================

  function syncSelectedHotelAmenities() {
    if (!selectedHotelId) {
      setSelectedAmenityIds([]);
      return;
    }

    const assignedIds = hotelAmenities
      .filter(
        (item) =>
          item.hotel_id === selectedHotelId &&
          item.status === "active" &&
          item.amenity_id !== null
      )
      .map((item) => item.amenity_id as number);

    setSelectedAmenityIds(assignedIds);
  }

  function isHotelAmenityChecked(amenityId: number) {
    return selectedAmenityIds.includes(amenityId);
  }

  function toggleSelectedHotelAmenity(amenityId: number) {
    setSelectedAmenityIds((current) =>
      current.includes(amenityId)
        ? current.filter((id) => id !== amenityId)
        : [...current, amenityId]
    );

    setMessage("");
    setError("");
  }

  function selectedHotelName() {
    if (!selectedHotelId) {
      return "";
    }

    return (
      hotels.find((hotel) => hotel.id === selectedHotelId)
        ?.name_vi || ""
    );
  }

  function selectedHotelAssignedCount() {
    if (!selectedHotelId) {
      return 0;
    }

    return selectedAmenityIds.length;
  }

  async function saveHotelAmenityAssignments() {
    if (!selectedHotelId) {
      setError("Vui lòng chọn khách sạn.");
      return;
    }

    setSavingHotelAssignments(true);
    setError("");
    setMessage("");

    /*
     * Xóa toàn bộ gán hiện tại của khách sạn.
     * Sau đó tạo lại theo danh sách người dùng đã tích.
     *
     * Nhờ vậy:
     * - bỏ tick = xóa khỏi khách sạn
     * - tick = thêm vào khách sạn
     * - không ảnh hưởng khách sạn khác
     */
    const { error: deleteError } = await supabase
      .from("hotel_amenities")
      .delete()
      .eq("hotel_id", selectedHotelId);

    if (deleteError) {
      setError(
        `Không thể cập nhật tiện ích khách sạn: ${deleteError.message}`
      );
      setSavingHotelAssignments(false);
      return;
    }

    const selectedCatalogItems = hotelAmenityCatalog
      .filter(
        (amenity) =>
          amenity.status === "active" &&
          selectedAmenityIds.includes(amenity.id)
      )
      .sort((a, b) => a.sort_order - b.sort_order);

    if (selectedCatalogItems.length > 0) {
      const insertPayload = selectedCatalogItems.map(
        (amenity, index) => ({
          hotel_id: selectedHotelId,
          amenity_id: amenity.id,
          name_vi: amenity.name_vi,
          name_en: amenity.name_en,
          description_vi: amenity.description_vi,
          description_en: amenity.description_en,
          icon: amenity.icon,
          sort_order: index + 1,
          status: "active" as const,
        })
      );

      const { error: insertError } = await supabase
        .from("hotel_amenities")
        .insert(insertPayload);

      if (insertError) {
        setError(
          `Không thể lưu tiện ích cho khách sạn: ${insertError.message}`
        );
        setSavingHotelAssignments(false);
        return;
      }
    }

    setMessage(
      `Đã lưu ${selectedAmenityIds.length} tiện ích cho ${selectedHotelName()}.`
    );

    await loadData();

    setSavingHotelAssignments(false);
  }

  // =========================================================
  // GÁN TIỆN NGHI PHÒNG
  // =========================================================

  function hotelName(hotelId: number) {
    const hotel = hotels.find(
      (item) => item.id === hotelId
    );

    if (!hotel) {
      return "";
    }

    return hotel.name_vi;
  }

  function filteredRooms() {
    if (!selectedHotelId) {
      return rooms;
    }

    return rooms.filter(
      (room) => room.hotel_id === selectedHotelId
    );
  }

  function isAmenityChecked(amenityId: number) {
    if (!selectedRoomId) {
      return false;
    }

    return roomAmenities.some(
      (item) =>
        item.room_id === selectedRoomId &&
        item.amenity_id === amenityId &&
        item.status === "active"
    );
  }

  async function toggleRoomAmenity(amenity: Amenity) {
    if (!selectedRoomId) {
      setError("Vui lòng chọn phòng trước.");
      return;
    }

    setError("");
    setMessage("");

    const existing = roomAmenities.find(
      (item) =>
        item.room_id === selectedRoomId &&
        item.amenity_id === amenity.id
    );

    if (!existing) {
      const { error: insertError } = await supabase
        .from("room_amenities")
        .insert({
          room_id: selectedRoomId,
          amenity_id: amenity.id,
          name_vi: amenity.name_vi,
          name_en: amenity.name_en,
          icon: amenity.icon,
          sort_order: amenity.sort_order,
          status: "active",
        });

      if (insertError) {
        setError(
          `Không thể thêm tiện nghi cho phòng: ${insertError.message}`
        );
        return;
      }

      setMessage(
        `Đã thêm "${amenity.name_vi}" cho phòng.`
      );
    } else {
      const newStatus =
        existing.status === "active"
          ? "inactive"
          : "active";

      const { error: updateError } = await supabase
        .from("room_amenities")
        .update({
          status: newStatus,
        })
        .eq("id", existing.id);

      if (updateError) {
        setError(
          `Không thể thay đổi tiện nghi phòng: ${updateError.message}`
        );
        return;
      }

      setMessage(
        newStatus === "active"
          ? `Đã bật "${amenity.name_vi}" cho phòng.`
          : `Đã tắt "${amenity.name_vi}" cho phòng.`
      );
    }

    await loadData();
  }

  const selectedRoom = rooms.find(
    (room) => room.id === selectedRoomId
  );

  const selectedRoomAmenityCount = selectedRoomId
    ? roomAmenities.filter(
        (item) =>
          item.room_id === selectedRoomId &&
          item.status === "active"
      ).length
    : 0;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Tiện nghi & tiện ích
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Quản lý tiện nghi phòng và tiện ích khách sạn.
            </p>
          </div>

          <button
            onClick={
              mainTab === "room"
                ? openAddRoomAmenity
                : openAddHotelAmenity
            }
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            +
            {" "}
            {mainTab === "room"
              ? "Thêm tiện nghi phòng"
              : "Thêm tiện ích khách sạn"}
          </button>
        </div>

        {/* ================================================= */}
        {/* MESSAGE */}
        {/* ================================================= */}

        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* TABS */}
        {/* ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setMainTab("room");
                setMessage("");
                setError("");
              }}
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                mainTab === "room"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Tiện nghi phòng
            </button>

            <button
              onClick={() => {
                setMainTab("hotel");
                setMessage("");
                setError("");
              }}
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                mainTab === "hotel"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Tiện ích khách sạn
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* TAB: TIỆN NGHI PHÒNG */}
        {/* ================================================= */}

        {mainTab === "room" && (
          <div className="space-y-6">

            {/* DANH MỤC */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Danh mục tiện nghi phòng
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Danh mục dùng để gán cho từng phòng.
                    </p>
                  </div>

                  <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                    {amenities.length} tiện nghi
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Đang tải...
                </div>
              ) : amenities.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Chưa có tiện nghi nào.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-3">STT</th>
                        <th className="px-5 py-3">Icon</th>
                        <th className="px-5 py-3">Tiếng Việt</th>
                        <th className="px-5 py-3">English</th>
                        <th className="px-5 py-3">Thứ tự</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3 text-right">
                          Thao tác
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {amenities.map((amenity, index) => (
                        <tr
                          key={amenity.id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-5 py-4 text-sm text-slate-500">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
                              {amenity.icon || "—"}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                            {amenity.name_vi}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {amenity.name_en}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {amenity.sort_order}
                          </td>

                          <td className="px-5 py-4">
                            <button
                              onClick={() =>
                                toggleAmenity(amenity)
                              }
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                amenity.status === "active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {amenity.status === "active"
                                ? "Đang dùng"
                                : "Đã tắt"}
                            </button>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() =>
                                  openEditRoomAmenity(amenity)
                                }
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              >
                                Sửa
                              </button>

                              <button
                                onClick={() =>
                                  deleteAmenity(amenity)
                                }
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* GÁN CHO PHÒNG */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Gán tiện nghi cho phòng
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Chọn khách sạn → chọn phòng → tích các tiện nghi.
                </p>
              </div>

              <div className="grid gap-6 p-5 lg:grid-cols-[280px_1fr]">

                {/* LEFT */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Khách sạn
                    </label>

                    <select
                      value={selectedHotelId ?? ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? Number(e.target.value)
                          : null;

                        setSelectedHotelId(value);
                        setSelectedRoomId(null);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                    >
                      <option value="">
                        Tất cả khách sạn
                      </option>

                      {hotels.map((hotel) => (
                        <option
                          key={hotel.id}
                          value={hotel.id}
                        >
                          {hotel.name_vi}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Phòng
                    </label>

                    <select
                      value={selectedRoomId ?? ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? Number(e.target.value)
                          : null;

                        setSelectedRoomId(value);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                    >
                      <option value="">
                        -- Chọn phòng --
                      </option>

                      {filteredRooms().map((room) => (
                        <option
                          key={room.id}
                          value={room.id}
                        >
                          {room.name_vi}
                          {selectedHotelId
                            ? ""
                            : ` — ${hotelName(
                                room.hotel_id
                              )}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedRoom && (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <div className="text-xs text-slate-500">
                        Phòng đang chọn
                      </div>

                      <div className="mt-1 font-semibold text-slate-900">
                        {selectedRoom.name_vi}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {hotelName(selectedRoom.hotel_id)}
                      </div>

                      <div className="mt-3 text-sm text-slate-600">
                        Đang có{" "}
                        <span className="font-bold text-slate-900">
                          {selectedRoomAmenityCount}
                        </span>{" "}
                        tiện nghi
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT */}
                <div>
                  {!selectedRoomId ? (
                    <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
                      <div>
                        <div className="text-3xl">🛏️</div>

                        <div className="mt-3 font-semibold text-slate-700">
                          Chưa chọn phòng
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          Chọn phòng bên trái để quản lý tiện nghi.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            Tiện nghi của{" "}
                            {selectedRoom?.name_vi}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Tích chọn để bật tiện nghi cho phòng.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {amenities
                          .filter(
                            (amenity) =>
                              amenity.status === "active"
                          )
                          .map((amenity) => {
                            const checked =
                              isAmenityChecked(amenity.id);

                            return (
                              <button
                                key={amenity.id}
                                onClick={() =>
                                  toggleRoomAmenity(amenity)
                                }
                                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                                  checked
                                    ? "border-slate-900 bg-slate-50"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                              >
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs ${
                                    checked
                                      ? "bg-slate-900 text-white"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {checked
                                    ? "✓"
                                    : amenity.icon || "•"}
                                </div>

                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-slate-900">
                                    {amenity.name_vi}
                                  </div>

                                  <div className="mt-1 text-xs text-slate-500">
                                    {amenity.name_en}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================================================= */}
        {/* TAB: TIỆN ÍCH KHÁCH SẠN */}
        {/* ================================================= */}

        {mainTab === "hotel" && (
          <div className="space-y-6">

            {/* ================================================= */}
            {/* GÁN TIỆN ÍCH CHO KHÁCH SẠN */}
            {/* ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Đăng ký tiện ích theo khách sạn
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Chọn khách sạn rồi tích những tiện ích thực tế
                    mà khách sạn đó đang có.
                  </p>
                </div>
              </div>

              <div className="p-5">

                {/* CHỌN KHÁCH SẠN */}
                <div className="max-w-xl">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Khách sạn
                  </label>

                  <select
                    value={selectedHotelId ?? ""}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : null;

                      setSelectedHotelId(value);
                      setMessage("");
                      setError("");
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="">
                      -- Chọn khách sạn --
                    </option>

                    {hotels.map((hotel) => (
                      <option
                        key={hotel.id}
                        value={hotel.id}
                      >
                        {hotel.name_vi}
                      </option>
                    ))}
                  </select>
                </div>

                {!selectedHotelId ? (
                  <div className="mt-6 flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
                    <div>
                      <div className="text-4xl">🏨</div>

                      <div className="mt-3 font-semibold text-slate-700">
                        Chưa chọn khách sạn
                      </div>

                      <div className="mt-1 text-sm text-slate-500">
                        Chọn khách sạn ở trên để đăng ký tiện ích.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6">

                    {/* HEADER */}
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          Tiện ích của {selectedHotelName()}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Đã chọn{" "}
                          <span className="font-semibold text-slate-900">
                            {selectedHotelAssignedCount()}
                          </span>{" "}
                          tiện ích.
                        </p>
                      </div>

                      <button
                        onClick={saveHotelAmenityAssignments}
                        disabled={savingHotelAssignments}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingHotelAssignments
                          ? "Đang lưu..."
                          : "Lưu tiện ích"}
                      </button>
                    </div>

                    {/* DANH SÁCH TIỆN ÍCH */}
                    {hotelAmenityCatalog.filter(
                      (amenity) => amenity.status === "active"
                    ).length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                        <div className="text-4xl">🏨</div>

                        <div className="mt-3 font-semibold text-slate-800">
                          Chưa có tiện ích trong danh mục
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          Hãy thêm tiện ích ở phần danh mục bên dưới.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {hotelAmenityCatalog
                          .filter(
                            (amenity) =>
                              amenity.status === "active"
                          )
                          .map((amenity) => {
                            const checked =
                              isHotelAmenityChecked(
                                amenity.id
                              );

                            return (
                              <button
                                key={amenity.id}
                                type="button"
                                onClick={() =>
                                  toggleSelectedHotelAmenity(
                                    amenity.id
                                  )
                                }
                                className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                                  checked
                                    ? "border-slate-900 bg-slate-50 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <div
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition ${
                                    checked
                                      ? "bg-slate-900 text-white"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {checked
                                    ? "✓"
                                    : amenity.icon || "•"}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="text-sm font-semibold text-slate-900">
                                        {amenity.name_vi}
                                      </div>

                                      {amenity.name_en && (
                                        <div className="mt-1 text-xs text-slate-500">
                                          {amenity.name_en}
                                        </div>
                                      )}
                                    </div>

                                    <div
                                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                                        checked
                                          ? "border-slate-900 bg-slate-900 text-white"
                                          : "border-slate-300 bg-white text-transparent"
                                      }`}
                                    >
                                      ✓
                                    </div>
                                  </div>

                                  {amenity.description_vi && (
                                    <div className="mt-2 text-xs leading-5 text-slate-500">
                                      {amenity.description_vi}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* ================================================= */}
            {/* DANH MỤC TIỆN ÍCH */}
            {/* ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Danh mục tiện ích khách sạn
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Tạo tiện ích một lần để sau đó gán cho
                      nhiều khách sạn.
                    </p>
                  </div>

                  <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                    {hotelAmenityCatalog.length} tiện ích
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Đang tải...
                </div>
              ) : hotelAmenityCatalog.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="text-4xl">🏨</div>

                  <div className="mt-3 font-semibold text-slate-800">
                    Chưa có tiện ích khách sạn
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Hãy thêm các tiện ích như Thang máy,
                    Wifi, Lễ tân 24/7, Tivi, Tủ lạnh...
                  </p>

                  <button
                    onClick={openAddHotelAmenity}
                    className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    + Thêm tiện ích khách sạn
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-3">STT</th>
                        <th className="px-5 py-3">Icon</th>
                        <th className="px-5 py-3">Tiếng Việt</th>
                        <th className="px-5 py-3">English</th>
                        <th className="px-5 py-3">Mô tả</th>
                        <th className="px-5 py-3">Thứ tự</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3 text-right">
                          Thao tác
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {hotelAmenityCatalog.map(
                        (amenity, index) => (
                          <tr
                            key={amenity.id}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="px-5 py-4 text-sm text-slate-500">
                              {index + 1}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
                                {amenity.icon || "—"}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                              {amenity.name_vi}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {amenity.name_en || "—"}
                            </td>

                            <td className="max-w-[280px] px-5 py-4">
                              <div className="text-sm text-slate-600">
                                {amenity.description_vi || "—"}
                              </div>

                              {amenity.description_en && (
                                <div className="mt-1 text-xs text-slate-400">
                                  {amenity.description_en}
                                </div>
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {amenity.sort_order}
                            </td>

                            <td className="px-5 py-4">
                              <button
                                onClick={() =>
                                  toggleHotelAmenity(
                                    amenity
                                  )
                                }
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  amenity.status === "active"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {amenity.status === "active"
                                  ? "Đang dùng"
                                  : "Đã tắt"}
                              </button>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() =>
                                    openEditHotelAmenity(
                                      amenity
                                    )
                                  }
                                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  Sửa
                                </button>

                                <button
                                  onClick={() =>
                                    deleteHotelAmenity(
                                      amenity
                                    )
                                  }
                                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* ===================================================== */}
      {/* MODAL TIỆN NGHI PHÒNG */}
      {/* ===================================================== */}

      {showAddRoomAmenity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-900">
                {editingAmenity
                  ? "Sửa tiện nghi phòng"
                  : "Thêm tiện nghi phòng"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Nhập thông tin tiện nghi bằng tiếng Việt
                và tiếng Anh.
              </p>
            </div>

            <div className="space-y-5 p-6">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tên tiếng Việt *
                </label>

                <input
                  value={nameVi}
                  onChange={(e) =>
                    setNameVi(e.target.value)
                  }
                  placeholder="Ví dụ: Két an toàn"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tên tiếng Anh *
                </label>

                <input
                  value={nameEn}
                  onChange={(e) =>
                    setNameEn(e.target.value)
                  }
                  placeholder="Ví dụ: Safety box"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Icon
                </label>

                <input
                  value={icon}
                  onChange={(e) =>
                    setIcon(e.target.value)
                  }
                  placeholder="Ví dụ: wifi, tv, bath..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Có thể để trống.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Thứ tự hiển thị
                </label>

                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={closeRoomAmenityForm}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>

              <button
                onClick={saveRoomAmenity}
                disabled={saving}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving
                  ? "Đang lưu..."
                  : editingAmenity
                  ? "Lưu thay đổi"
                  : "Thêm tiện nghi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* MODAL TIỆN ÍCH KHÁCH SẠN */}
      {/* ===================================================== */}

      {showAddHotelAmenity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-900">
                {editingHotelAmenity
                  ? "Sửa tiện ích khách sạn"
                  : "Thêm tiện ích khách sạn"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tiện ích này được tạo một lần và có thể
                dùng cho nhiều khách sạn.
              </p>
            </div>

            <div className="space-y-5 p-6">

              {/* VI */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tên tiện ích - Tiếng Việt *
                </label>

                <input
                  value={hotelNameVi}
                  onChange={(e) =>
                    setHotelNameVi(e.target.value)
                  }
                  placeholder="Ví dụ: Thang máy"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              {/* EN */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tên tiện ích - English *
                </label>

                <input
                  value={hotelNameEn}
                  onChange={(e) =>
                    setHotelNameEn(e.target.value)
                  }
                  placeholder="Example: Elevator"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              {/* DESCRIPTION */}
              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Mô tả - Tiếng Việt
                  </label>

                  <textarea
                    value={hotelDescriptionVi}
                    onChange={(e) =>
                      setHotelDescriptionVi(
                        e.target.value
                      )
                    }
                    rows={5}
                    placeholder="Ví dụ: Thang máy phục vụ tất cả các tầng của khách sạn."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Mô tả - English
                  </label>

                  <textarea
                    value={hotelDescriptionEn}
                    onChange={(e) =>
                      setHotelDescriptionEn(
                        e.target.value
                      )
                    }
                    rows={5}
                    placeholder="Example: Elevator serving all hotel floors."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              {/* ICON */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Icon
                </label>

                <input
                  value={hotelIcon}
                  onChange={(e) =>
                    setHotelIcon(e.target.value)
                  }
                  placeholder="Ví dụ: elevator, wifi, tv, refrigerator..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Lưu tên icon để frontend xử lý hiển thị.
                </p>
              </div>

              {/* SORT */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Thứ tự hiển thị
                </label>

                <input
                  type="number"
                  value={hotelSortOrder}
                  onChange={(e) =>
                    setHotelSortOrder(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={closeHotelAmenityForm}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>

              <button
                onClick={saveHotelAmenity}
                disabled={saving}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving
                  ? "Đang lưu..."
                  : editingHotelAmenity
                  ? "Lưu thay đổi"
                  : "Thêm tiện ích"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}