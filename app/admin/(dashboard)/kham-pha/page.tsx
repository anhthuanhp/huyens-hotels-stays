
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Hotel = {
  id: number;
  slug: string;
  name_vi: string | null;
  name_en: string | null;
  status: string | null;
};

type NearbyCategory = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  icon: string | null;
  sort_order: number;
  status: boolean;
};

type HotelNearbyPlace = {
  id: number;
  hotel_id: number;
  category_id: number;
  name_vi: string;
  name_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  distance_m: number | null;
  walking_minutes: number | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  image: string | null;
  sort_order: number;
  status: boolean;
};

type PlaceForm = {
  category_id: string;
  name_vi: string;
  name_en: string;
  description_vi: string;
  description_en: string;
  distance_m: string;
  walking_minutes: string;
  latitude: string;
  longitude: string;
  google_maps_url: string;
  image: string;
  sort_order: string;
  status: boolean;
};

const EMPTY_FORM: PlaceForm = {
  category_id: "",
  name_vi: "",
  name_en: "",
  description_vi: "",
  description_en: "",
  distance_m: "",
  walking_minutes: "",
  latitude: "",
  longitude: "",
  google_maps_url: "",
  image: "",
  sort_order: "0",
  status: true,
};

function getHotelName(
  hotel: Hotel,
  language: "vi" | "en"
) {
  if (language === "vi") {
    return hotel.name_vi || hotel.name_en || hotel.slug;
  }

  return hotel.name_en || hotel.name_vi || hotel.slug;
}

function getCategoryName(
  category: NearbyCategory,
  language: "vi" | "en"
) {
  if (language === "vi") {
    return category.name_vi || category.name_en;
  }

  return category.name_en || category.name_vi;
}

function getInitialForm(
  categoryId: number | null
): PlaceForm {
  return {
    ...EMPTY_FORM,
    category_id:
      categoryId !== null ? String(categoryId) : "",
  };
}

export default function AdminNearbyPage() {
  const [language, setLanguage] =
    useState<"vi" | "en">("vi");

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [categories, setCategories] = useState<
    NearbyCategory[]
  >([]);
  const [places, setPlaces] = useState<
    HotelNearbyPlace[]
  >([]);

  const [selectedHotelId, setSelectedHotelId] =
    useState<number | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<PlaceForm>(getInitialForm(null));

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [loadingHotels, setLoadingHotels] =
    useState(true);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [loadingPlaces, setLoadingPlaces] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedLanguage =
      window.localStorage.getItem("huyen-language");

    if (
      savedLanguage === "vi" ||
      savedLanguage === "en"
    ) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    loadHotels();
    loadCategories();
  }, []);

  useEffect(() => {
    if (!selectedHotelId) {
      setPlaces([]);
      return;
    }

    loadPlaces(selectedHotelId);
  }, [selectedHotelId]);

  useEffect(() => {
    if (
      selectedCategoryId !== null &&
      categories.some(
        (category) =>
          category.id === selectedCategoryId
      )
    ) {
      setForm((current) => ({
        ...current,
        category_id: String(selectedCategoryId),
      }));
    }
  }, [selectedCategoryId, categories]);

  async function loadHotels() {
    setLoadingHotels(true);
    setError("");

    const { data, error: queryError } =
      await supabase
        .from("hotels")
        .select(
          "id, slug, name_vi, name_en, status"
        )
        .order("id", {
          ascending: true,
        });

    if (queryError) {
      console.error(
        "Load hotels error:",
        queryError
      );

      setError(
        "Không thể tải danh sách khách sạn."
      );

      setHotels([]);
    } else {
      const rows = (data ?? []) as Hotel[];

      setHotels(rows);

      if (
        selectedHotelId === null &&
        rows.length > 0
      ) {
        const activeHotel =
          rows.find(
            (hotel) =>
              hotel.status === "active"
          ) || rows[0];

        setSelectedHotelId(activeHotel.id);
      }
    }

    setLoadingHotels(false);
  }

  async function loadCategories() {
    setLoadingCategories(true);

    const { data, error: queryError } =
      await supabase
        .from("nearby_categories")
        .select(
          "id, slug, name_vi, name_en, icon, sort_order, status"
        )
        .order("sort_order", {
          ascending: true,
        });

    if (queryError) {
      console.error(
        "Load nearby categories error:",
        queryError
      );

      setError(
        "Không thể tải danh mục khám phá."
      );

      setCategories([]);
    } else {
      const rows =
        (data ?? []) as NearbyCategory[];

      setCategories(rows);

      if (
        selectedCategoryId === null &&
        rows.length > 0
      ) {
        const activeCategory =
          rows.find(
            (category) =>
              category.status === true
          ) || rows[0];

        setSelectedCategoryId(
          activeCategory.id
        );

        setForm(
          getInitialForm(activeCategory.id)
        );
      }
    }

    setLoadingCategories(false);
  }

  async function loadPlaces(hotelId: number) {
    setLoadingPlaces(true);
    setError("");

    const { data, error: queryError } =
      await supabase
        .from("hotel_nearby_places")
        .select(
          "id, hotel_id, category_id, name_vi, name_en, description_vi, description_en, distance_m, walking_minutes, latitude, longitude, google_maps_url, image, sort_order, status"
        )
        .eq("hotel_id", hotelId)
        .order("category_id", {
          ascending: true,
        })
        .order("sort_order", {
          ascending: true,
        })
        .order("id", {
          ascending: true,
        });

    if (queryError) {
      console.error(
        "Load nearby places error:",
        queryError
      );

      setError(
        "Không thể tải danh sách địa điểm."
      );

      setPlaces([]);
    } else {
      setPlaces(
        (data ?? []) as HotelNearbyPlace[]
      );
    }

    setLoadingPlaces(false);
  }

  const activeCategories = useMemo(() => {
    return categories.filter(
      (category) => category.status === true
    );
  }, [categories]);

  const filteredPlaces = useMemo(() => {
    if (selectedCategoryId === null) {
      return places;
    }

    return places.filter(
      (place) =>
        place.category_id ===
        selectedCategoryId
    );
  }, [places, selectedCategoryId]);

  const selectedHotel = useMemo(() => {
    return hotels.find(
      (hotel) => hotel.id === selectedHotelId
    );
  }, [hotels, selectedHotelId]);

  function updateField<K extends keyof PlaceForm>(
    field: K,
    value: PlaceForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    const categoryId =
      selectedCategoryId !== null
        ? selectedCategoryId
        : activeCategories[0]?.id ?? null;

    setEditingId(null);
    setForm(getInitialForm(categoryId));
    setError("");
    setMessage("");
  }

  function startEdit(place: HotelNearbyPlace) {
    setEditingId(place.id);

    setSelectedCategoryId(place.category_id);

    setForm({
      category_id: String(place.category_id),
      name_vi: place.name_vi || "",
      name_en: place.name_en || "",
      description_vi:
        place.description_vi || "",
      description_en:
        place.description_en || "",
      distance_m:
        place.distance_m !== null
          ? String(place.distance_m)
          : "",
      walking_minutes:
        place.walking_minutes !== null
          ? String(place.walking_minutes)
          : "",
      latitude:
        place.latitude !== null
          ? String(place.latitude)
          : "",
      longitude:
        place.longitude !== null
          ? String(place.longitude)
          : "",
      google_maps_url:
        place.google_maps_url || "",
      image: place.image || "",
      sort_order: String(
        place.sort_order ?? 0
      ),
      status: place.status === true,
    });

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSave() {
    setError("");
    setMessage("");

    if (!selectedHotelId) {
      setError("Vui lòng chọn khách sạn.");
      return;
    }

    if (!form.category_id) {
      setError("Vui lòng chọn danh mục.");
      return;
    }

    if (!form.name_vi.trim()) {
      setError(
        "Vui lòng nhập tên địa điểm tiếng Việt."
      );
      return;
    }

    const distance =
      form.distance_m.trim() === ""
        ? null
        : Number(form.distance_m);

    const walkingMinutes =
      form.walking_minutes.trim() === ""
        ? null
        : Number(form.walking_minutes);

    const latitude =
      form.latitude.trim() === ""
        ? null
        : Number(form.latitude);

    const longitude =
      form.longitude.trim() === ""
        ? null
        : Number(form.longitude);

    const sortOrder =
      form.sort_order.trim() === ""
        ? 0
        : Number(form.sort_order);

    if (
      distance !== null &&
      (!Number.isFinite(distance) ||
        distance < 0)
    ) {
      setError("Khoảng cách không hợp lệ.");
      return;
    }

    if (
      walkingMinutes !== null &&
      (!Number.isFinite(walkingMinutes) ||
        walkingMinutes < 0)
    ) {
      setError(
        "Thời gian đi bộ không hợp lệ."
      );
      return;
    }

    if (
      latitude !== null &&
      !Number.isFinite(latitude)
    ) {
      setError("Vĩ độ không hợp lệ.");
      return;
    }

    if (
      longitude !== null &&
      !Number.isFinite(longitude)
    ) {
      setError("Kinh độ không hợp lệ.");
      return;
    }

    if (
      !Number.isFinite(sortOrder) ||
      sortOrder < 0
    ) {
      setError("Thứ tự không hợp lệ.");
      return;
    }

    setSaving(true);

    const payload = {
      hotel_id: selectedHotelId,
      category_id: Number(form.category_id),
      name_vi: form.name_vi.trim(),
      name_en:
        form.name_en.trim() || null,
      description_vi:
        form.description_vi.trim() || null,
      description_en:
        form.description_en.trim() || null,
      distance_m: distance,
      walking_minutes: walkingMinutes,
      latitude,
      longitude,
      google_maps_url:
        form.google_maps_url.trim() || null,
      image: form.image.trim() || null,
      sort_order: sortOrder,
      status: form.status,
    };

    if (editingId === null) {
      const { data, error: insertError } =
        await supabase
          .from("hotel_nearby_places")
          .insert(payload)
          .select(
            "id, hotel_id, category_id, name_vi, name_en, description_vi, description_en, distance_m, walking_minutes, latitude, longitude, google_maps_url, image, sort_order, status"
          )
          .single();

      if (insertError) {
        console.error(
          "Insert nearby place error:",
          insertError
        );

        setError(
          insertError.message ||
            "Không thể thêm địa điểm."
        );
      } else {
        setPlaces((current) =>
          [
            ...current,
            data as HotelNearbyPlace,
          ].sort((a, b) => {
            if (
              a.category_id !==
              b.category_id
            ) {
              return (
                a.category_id -
                b.category_id
              );
            }

            return (
              a.sort_order - b.sort_order
            );
          })
        );

        setMessage(
          "Đã thêm địa điểm thành công."
        );

        setForm(
          getInitialForm(
            selectedCategoryId
          )
        );
      }
    } else {
      const { data, error: updateError } =
        await supabase
          .from("hotel_nearby_places")
          .update(payload)
          .eq("id", editingId)
          .select(
            "id, hotel_id, category_id, name_vi, name_en, description_vi, description_en, distance_m, walking_minutes, latitude, longitude, google_maps_url, image, sort_order, status"
          )
          .single();

      if (updateError) {
        console.error(
          "Update nearby place error:",
          updateError
        );

        setError(
          updateError.message ||
            "Không thể cập nhật địa điểm."
        );
      } else {
        setPlaces((current) =>
          current
            .map((item) =>
              item.id === editingId
                ? (data as HotelNearbyPlace)
                : item
            )
            .sort((a, b) => {
              if (
                a.category_id !==
                b.category_id
              ) {
                return (
                  a.category_id -
                  b.category_id
                );
              }

              return (
                a.sort_order - b.sort_order
              );
            })
        );

        setMessage(
          "Đã cập nhật địa điểm thành công."
        );

        setEditingId(null);

        setForm(
          getInitialForm(
            selectedCategoryId
          )
        );
      }
    }

    setSaving(false);
  }

  async function handleDelete(
    place: HotelNearbyPlace
  ) {
    const placeName =
      place.name_vi ||
      place.name_en ||
      "địa điểm này";

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa "${placeName}" không?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(place.id);
    setError("");
    setMessage("");

    const { error: deleteError } =
      await supabase
        .from("hotel_nearby_places")
        .delete()
        .eq("id", place.id);

    if (deleteError) {
      console.error(
        "Delete nearby place error:",
        deleteError
      );

      setError(
        deleteError.message ||
          "Không thể xóa địa điểm."
      );
    } else {
      setPlaces((current) =>
        current.filter(
          (item) => item.id !== place.id
        )
      );

      if (editingId === place.id) {
        resetForm();
      }

      setMessage(
        "Đã xóa địa điểm thành công."
      );
    }

    setDeletingId(null);
  }

  async function handleToggleStatus(
    place: HotelNearbyPlace
  ) {
    setError("");
    setMessage("");

    const nextStatus = !place.status;

    const { error: updateError } =
      await supabase
        .from("hotel_nearby_places")
        .update({
          status: nextStatus,
        })
        .eq("id", place.id);

    if (updateError) {
      console.error(
        "Toggle nearby status error:",
        updateError
      );

      setError(
        updateError.message ||
          "Không thể thay đổi trạng thái."
      );

      return;
    }

    setPlaces((current) =>
      current.map((item) =>
        item.id === place.id
          ? {
              ...item,
              status: nextStatus,
            }
          : item
      )
    );

    setMessage(
      nextStatus
        ? "Đã bật địa điểm."
        : "Đã tắt địa điểm."
    );
  }

  async function handleToggleCategory(
    category: NearbyCategory
  ) {
    setError("");
    setMessage("");

    const nextStatus = !category.status;

    const { error: updateError } =
      await supabase
        .from("nearby_categories")
        .update({
          status: nextStatus,
        })
        .eq("id", category.id);

    if (updateError) {
      console.error(
        "Toggle category status error:",
        updateError
      );

      setError(
        updateError.message ||
          "Không thể thay đổi trạng thái danh mục."
      );

      return;
    }

    setCategories((current) =>
      current.map((item) =>
        item.id === category.id
          ? {
              ...item,
              status: nextStatus,
            }
          : item
      )
    );

    setMessage(
      nextStatus
        ? "Đã bật danh mục."
        : "Đã tắt danh mục."
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Quản trị nội dung
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                Khám phá xung quanh
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Quản lý các địa điểm gần từng
                khách sạn.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              + Thêm địa điểm
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">
                Khách sạn
              </h2>

              <div className="mt-3">
                {loadingHotels ? (
                  <div className="rounded-xl bg-slate-100 px-3 py-3 text-sm text-slate-500">
                    Đang tải...
                  </div>
                ) : (
                  <select
                    value={
                      selectedHotelId !== null
                        ? String(selectedHotelId)
                        : ""
                    }
                    onChange={(event) => {
                      const value =
                        Number(
                          event.target.value
                        );

                      setSelectedHotelId(
                        Number.isFinite(value) &&
                          value > 0
                          ? value
                          : null
                      );

                      setEditingId(null);
                      setMessage("");
                      setError("");
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-500"
                  >
                    <option value="">
                      Chọn khách sạn
                    </option>

                    {hotels.map((hotel) => (
                      <option
                        key={hotel.id}
                        value={hotel.id}
                      >
                        {getHotelName(
                          hotel,
                          language
                        )}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Danh mục
                </h2>

                <span className="text-xs text-slate-400">
                  {categories.length}
                </span>
              </div>

              <div className="mt-3 space-y-1.5">
                {loadingCategories ? (
                  <div className="rounded-xl bg-slate-100 px-3 py-3 text-sm text-slate-500">
                    Đang tải...
                  </div>
                ) : (
                  categories.map((category) => {
                    const active =
                      selectedCategoryId ===
                      category.id;

                    const count =
                      places.filter(
                        (place) =>
                          place.category_id ===
                          category.id
                      ).length;

                    return (
                      <div
                        key={category.id}
                        className={`flex items-center gap-2 rounded-xl border px-2 py-2 transition ${
                          active
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategoryId(
                              category.id
                            );
                            setEditingId(null);
                            setForm(
                              getInitialForm(
                                category.id
                              )
                            );
                            setMessage("");
                            setError("");
                          }}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                          {category.icon && (
                            <span
                              className="shrink-0"
                              aria-hidden="true"
                            >
                              {category.icon}
                            </span>
                          )}

                          <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {getCategoryName(
                              category,
                              language
                            )}
                          </span>

                          <span
                            className={`shrink-0 text-xs ${
                              active
                                ? "text-slate-300"
                                : "text-slate-400"
                            }`}
                          >
                            {count}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleCategory(
                              category
                            )
                          }
                          className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                            category.status
                              ? active
                                ? "bg-white/30"
                                : "bg-emerald-500"
                              : active
                                ? "bg-white/20"
                                : "bg-slate-300"
                          }`}
                          aria-label={
                            category.status
                              ? "Tắt danh mục"
                              : "Bật danh mục"
                          }
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                              category.status
                                ? "left-[18px]"
                                : "left-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </aside>

          <div className="min-w-0 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    {editingId !== null
                      ? "Chỉnh sửa địa điểm"
                      : "Thêm địa điểm"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedHotel
                      ? getHotelName(
                          selectedHotel,
                          language
                        )
                      : "Chưa chọn khách sạn"}
                  </p>
                </div>

                {editingId !== null && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Hủy chỉnh sửa
                  </button>
                )}
              </div>

              <div className="mt-5 grid gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Danh mục
                    </span>

                    <select
                      value={form.category_id}
                      onChange={(event) => {
                        const value =
                          Number(
                            event.target.value
                          );

                        updateField(
                          "category_id",
                          event.target.value
                        );

                        if (
                          Number.isFinite(
                            value
                          ) &&
                          value > 0
                        ) {
                          setSelectedCategoryId(
                            value
                          );
                        }
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    >
                      <option value="">
                        Chọn danh mục
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.icon
                              ? `${category.icon} `
                              : ""}
                            {getCategoryName(
                              category,
                              language
                            )}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Thứ tự hiển thị
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={form.sort_order}
                      onChange={(event) =>
                        updateField(
                          "sort_order",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Tên địa điểm — VI *
                    </span>

                    <input
                      type="text"
                      value={form.name_vi}
                      onChange={(event) =>
                        updateField(
                          "name_vi",
                          event.target.value
                        )
                      }
                      placeholder="Ví dụ: Chợ Bến Thành"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Tên địa điểm — EN
                    </span>

                    <input
                      type="text"
                      value={form.name_en}
                      onChange={(event) =>
                        updateField(
                          "name_en",
                          event.target.value
                        )
                      }
                      placeholder="Example: Ben Thanh Market"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Mô tả — VI
                    </span>

                    <textarea
                      value={form.description_vi}
                      onChange={(event) =>
                        updateField(
                          "description_vi",
                          event.target.value
                        )
                      }
                      rows={3}
                      className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Mô tả — EN
                    </span>

                    <textarea
                      value={form.description_en}
                      onChange={(event) =>
                        updateField(
                          "description_en",
                          event.target.value
                        )
                      }
                      rows={3}
                      className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Khoảng cách (m)
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.distance_m}
                      onChange={(event) =>
                        updateField(
                          "distance_m",
                          event.target.value
                        )
                      }
                      placeholder="250"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Đi bộ (phút)
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.walking_minutes}
                      onChange={(event) =>
                        updateField(
                          "walking_minutes",
                          event.target.value
                        )
                      }
                      placeholder="3"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Vĩ độ
                    </span>

                    <input
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={(event) =>
                        updateField(
                          "latitude",
                          event.target.value
                        )
                      }
                      placeholder="10.7679"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Kinh độ
                    </span>

                    <input
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={(event) =>
                        updateField(
                          "longitude",
                          event.target.value
                        )
                      }
                      placeholder="106.6930"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Google Maps URL
                  </span>

                  <input
                    type="url"
                    value={form.google_maps_url}
                    onChange={(event) =>
                      updateField(
                        "google_maps_url",
                        event.target.value
                      )
                    }
                    placeholder="https://maps.google.com/..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                  />

                  <span className="mt-1.5 block text-xs text-slate-400">
                    Link này được dùng cho nút mũi tên
                    chỉ đường trên website.
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    URL hình ảnh
                  </span>

                  <input
                    type="url"
                    value={form.image}
                    onChange={(event) =>
                      updateField(
                        "image",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                  />

                  <span className="mt-1.5 block text-xs text-slate-400">
                    Tạm thời nhập URL ảnh. Có thể
                    tích hợp upload Storage vào bước
                    tiếp theo.
                  </span>
                </label>

                {form.image && (
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={form.image}
                      alt=""
                      className="h-40 w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.status}
                      onChange={(event) =>
                        updateField(
                          "status",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />

                    <span className="text-sm font-semibold text-slate-700">
                      Hiển thị trên website
                    </span>
                  </label>

                  <div className="flex gap-2">
                    {editingId !== null && (
                      <button
                        type="button"
                        onClick={resetForm}
                        disabled={saving}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        Hủy
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={
                        saving ||
                        !selectedHotelId
                      }
                      className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving
                        ? "Đang lưu..."
                        : editingId !== null
                          ? "Lưu thay đổi"
                          : "Thêm địa điểm"}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Danh sách địa điểm
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedHotel
                      ? getHotelName(
                          selectedHotel,
                          language
                        )
                      : "Chưa chọn khách sạn"}
                    {" · "}
                    {filteredPlaces.length} địa điểm
                  </p>
                </div>

                {selectedCategoryId !==
                  null && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(
                        null
                      );
                      setForm(
                        getInitialForm(null)
                      );
                      setEditingId(null);
                    }}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Xem tất cả
                  </button>
                )}
              </div>

              {loadingPlaces ? (
                <div className="px-5 py-12 text-center text-sm text-slate-500">
                  Đang tải danh sách địa điểm...
                </div>
              ) : filteredPlaces.length ===
                0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="text-sm font-semibold text-slate-700">
                    Chưa có địa điểm
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Thêm địa điểm đầu tiên cho
                    khách sạn này.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredPlaces.map(
                    (place) => {
                      const category =
                        categories.find(
                          (item) =>
                            item.id ===
                            place.category_id
                        );

                      return (
                        <div
                          key={place.id}
                          className={`flex flex-col gap-4 p-5 transition sm:flex-row sm:items-center ${
                            place.status
                              ? ""
                              : "bg-slate-50 opacity-60"
                          }`}
                        >
                          {place.image ? (
                            <img
                              src={place.image}
                              alt={
                                place.name_vi
                              }
                              className="h-20 w-20 shrink-0 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                              {category?.icon ||
                                "📍"}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-900">
                                {place.name_vi}
                              </h3>

                              {!place.status && (
                                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                  Đang tắt
                                </span>
                              )}

                              {category && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                                  {category.icon}{" "}
                                  {getCategoryName(
                                    category,
                                    language
                                  )}
                                </span>
                              )}
                            </div>

                            {place.name_en && (
                              <div className="mt-0.5 text-sm text-slate-500">
                                {place.name_en}
                              </div>
                            )}

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                              {place.distance_m !==
                                null && (
                                <span>
                                  {place.distance_m >=
                                  1000
                                    ? `${(
                                        place.distance_m /
                                        1000
                                      ).toFixed(
                                        1
                                      )} km`
                                    : `${Math.round(
                                        place.distance_m
                                      )} m`}
                                </span>
                              )}

                              {place.walking_minutes !==
                                null && (
                                <span>
                                  🚶{" "}
                                  {
                                    place.walking_minutes
                                  }{" "}
                                  phút
                                </span>
                              )}

                              <span>
                                Thứ tự{" "}
                                {place.sort_order}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {place.google_maps_url && (
                              <a
                                href={
                                  place.google_maps_url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                              >
                                Maps
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleStatus(
                                  place
                                )
                              }
                              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                place.status
                                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                              }`}
                            >
                              {place.status
                                ? "Đang bật"
                                : "Đang tắt"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                startEdit(place)
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Sửa
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  place
                                )
                              }
                              disabled={
                                deletingId ===
                                place.id
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId ===
                              place.id
                                ? "..."
                                : "Xóa"}
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
