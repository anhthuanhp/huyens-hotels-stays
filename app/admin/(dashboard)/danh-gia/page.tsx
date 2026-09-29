
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Hotel = {
  id: number;
  name_vi: string | null;
  name_en: string | null;
};

type CustomerReview = {
  id: number;
  hotel_id: number | null;
  guest_name: string;
  rating: number;
  review_vi: string;
  review_en: string | null;
  guest_country: string | null;
  source: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type ReviewForm = {
  hotel_id: string;
  guest_name: string;
  rating: string;
  review_vi: string;
  review_en: string;
  guest_country: string;
  source: string;
  is_published: boolean;
  sort_order: string;
};

const emptyForm: ReviewForm = {
  hotel_id: "",
  guest_name: "",
  rating: "5",
  review_vi: "",
  review_en: "",
  guest_country: "",
  source: "Website",
  is_published: true,
  sort_order: "0",
};

export default function DanhGiaPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelFilter, setHotelFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ReviewForm>(emptyForm);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hotelMap = useMemo(() => {
    const map = new Map<number, Hotel>();

    hotels.forEach((hotel) => {
      map.set(hotel.id, hotel);
    });

    return map;
  }, [hotels]);

  const filteredReviews = useMemo(() => {
    if (hotelFilter === "all") {
      return reviews;
    }

    return reviews.filter(
      (review) => String(review.hotel_id) === hotelFilter
    );
  }, [reviews, hotelFilter]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    const [
      { data: hotelData, error: hotelError },
      { data: reviewData, error: reviewError },
    ] = await Promise.all([
      supabase
        .from("hotels")
        .select("id, name_vi, name_en")
        .eq("status", "active")
        .order("id", { ascending: true }),

      supabase
        .from("customer_reviews")
        .select(
          "id, hotel_id, guest_name, rating, review_vi, review_en, guest_country, source, is_published, sort_order, created_at, updated_at"
        )
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    ]);

    if (hotelError) {
      setError(`Không tải được danh sách khách sạn: ${hotelError.message}`);
    }

    if (reviewError) {
      setError(`Không tải được đánh giá: ${reviewError.message}`);
    }

    if (!hotelError) {
      setHotels((hotelData ?? []) as Hotel[]);
    }

    if (!reviewError) {
      setReviews((reviewData ?? []) as CustomerReview[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setMessage("");
    setError("");

    setForm({
      ...emptyForm,
      hotel_id: hotels.length > 0 ? String(hotels[0].id) : "",
      sort_order: String(reviews.length + 1),
    });

    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (review: CustomerReview) => {
    setMessage("");
    setError("");

    setForm({
      hotel_id: review.hotel_id ? String(review.hotel_id) : "",
      guest_name: review.guest_name,
      rating: String(review.rating),
      review_vi: review.review_vi,
      review_en: review.review_en ?? "",
      guest_country: review.guest_country ?? "",
      source: review.source ?? "",
      is_published: review.is_published,
      sort_order: String(review.sort_order ?? 0),
    });

    setEditingId(review.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setMessage("");
    setError("");

    if (!form.guest_name.trim()) {
      setError("Vui lòng nhập tên khách.");
      return;
    }

    if (!form.review_vi.trim()) {
      setError("Vui lòng nhập nội dung đánh giá tiếng Việt.");
      return;
    }

    const rating = Number(form.rating);

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      setError("Điểm đánh giá phải từ 1 đến 5.");
      return;
    }

    const sortOrder = Number(form.sort_order);

    if (!Number.isFinite(sortOrder)) {
      setError("Thứ tự hiển thị phải là số.");
      return;
    }

    setSaving(true);

    const payload = {
      hotel_id: form.hotel_id ? Number(form.hotel_id) : null,
      guest_name: form.guest_name.trim(),
      rating,
      review_vi: form.review_vi.trim(),
      review_en: form.review_en.trim() || null,
      guest_country: form.guest_country.trim() || null,
      source: form.source.trim() || "Website",
      is_published: form.is_published,
      sort_order: sortOrder,
    };

    let result;

    if (editingId !== null) {
      result = await supabase
        .from("customer_reviews")
        .update(payload)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("customer_reviews")
        .insert(payload);
    }

    setSaving(false);

    if (result.error) {
      setError(`Lưu đánh giá thất bại: ${result.error.message}`);
      return;
    }

    setMessage(
      editingId !== null
        ? "Đã cập nhật đánh giá."
        : "Đã thêm đánh giá mới."
    );

    resetForm();
    await loadData();
  };

  const togglePublished = async (review: CustomerReview) => {
    setMessage("");
    setError("");

    const { error: updateError } = await supabase
      .from("customer_reviews")
      .update({
        is_published: !review.is_published,
      })
      .eq("id", review.id);

    if (updateError) {
      setError(`Không cập nhật được trạng thái: ${updateError.message}`);
      return;
    }

    setReviews((current) =>
      current.map((item) =>
        item.id === review.id
          ? {
              ...item,
              is_published: !item.is_published,
            }
          : item
      )
    );

    setMessage(
      review.is_published
        ? "Đã ẩn đánh giá khỏi website."
        : "Đã hiển thị đánh giá trên website."
    );
  };

  const deleteReview = async (review: CustomerReview) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa đánh giá của "${review.guest_name}" không?`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    const { error: deleteError } = await supabase
      .from("customer_reviews")
      .delete()
      .eq("id", review.id);

    if (deleteError) {
      setError(`Xóa đánh giá thất bại: ${deleteError.message}`);
      return;
    }

    setReviews((current) =>
      current.filter((item) => item.id !== review.id)
    );

    setMessage("Đã xóa đánh giá.");
  };

  const getHotelName = (hotelId: number | null) => {
    if (!hotelId) {
      return "Tất cả / Không xác định";
    }

    return (
      hotelMap.get(hotelId)?.name_vi ??
      `Khách sạn #${hotelId}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Đánh giá khách hàng
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Quản lý các đánh giá hiển thị trên trang chủ.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700"
        >
          + Thêm đánh giá
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                {editingId !== null
                  ? "Chỉnh sửa đánh giá"
                  : "Thêm đánh giá mới"}
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Nội dung này sẽ được sử dụng cho khu vực đánh giá trên website.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
            >
              Đóng
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Khách sạn
              </label>
              <select
                value={form.hotel_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    hotel_id: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-500"
              >
                <option value="">Không gắn khách sạn</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name_vi ?? hotel.name_en ?? `Khách sạn #${hotel.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Tên khách
              </label>
              <input
                type="text"
                value={form.guest_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    guest_name: event.target.value,
                  }))
                }
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Quốc gia
              </label>
              <input
                type="text"
                value={form.guest_country}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    guest_country: event.target.value,
                  }))
                }
                placeholder="Vietnam"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Nguồn
              </label>
              <input
                type="text"
                value={form.source}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    source: event.target.value,
                  }))
                }
                placeholder="Booking, Google, Website..."
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Điểm đánh giá
              </label>
              <select
                value={form.rating}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rating: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-500"
              >
                <option value="5">5 / 5</option>
                <option value="4">4 / 5</option>
                <option value="3">3 / 5</option>
                <option value="2">2 / 5</option>
                <option value="1">1 / 5</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sort_order: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Đánh giá tiếng Việt *
              </label>
              <textarea
                value={form.review_vi}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    review_vi: event.target.value,
                  }))
                }
                rows={5}
                placeholder="Nội dung đánh giá..."
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Đánh giá tiếng Anh
              </label>
              <textarea
                value={form.review_en}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    review_en: event.target.value,
                  }))
                }
                rows={5}
                placeholder="Review content..."
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      is_published: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-neutral-300"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Hiển thị đánh giá trên website
                </span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Đang lưu..."
                : editingId !== null
                  ? "Lưu thay đổi"
                  : "Thêm đánh giá"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Hủy
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-neutral-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-neutral-900">
              Danh sách đánh giá
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              {filteredReviews.length} đánh giá
            </p>
          </div>

          <select
            value={hotelFilter}
            onChange={(event) => setHotelFilter(event.target.value)}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-neutral-500"
          >
            <option value="all">Tất cả khách sạn</option>
            {hotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.name_vi ?? hotel.name_en ?? `Khách sạn #${hotel.id}`}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            Đang tải đánh giá...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            Chưa có đánh giá nào.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredReviews.map((review) => (
              <article
                key={review.id}
                className="p-5 transition hover:bg-neutral-50"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-neutral-900">
                        {review.guest_name}
                      </h3>

                      <span className="text-amber-500">
                        {"★".repeat(Math.max(0, Math.min(5, review.rating)))}
                      </span>

                      <span className="text-sm text-neutral-500">
                        {review.rating}/5
                      </span>

                      {review.guest_country && (
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">
                          {review.guest_country}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                      <span>
                        Khách sạn: {getHotelName(review.hotel_id)}
                      </span>
                      <span>
                        Nguồn: {review.source || "Không xác định"}
                      </span>
                      <span>
                        Thứ tự: {review.sort_order}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                          Tiếng Việt
                        </p>
                        <p className="whitespace-pre-line text-sm leading-6 text-neutral-700">
                          {review.review_vi}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                          English
                        </p>
                        <p className="whitespace-pre-line text-sm leading-6 text-neutral-700">
                          {review.review_en || "Chưa có nội dung tiếng Anh."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 lg:w-40 lg:justify-end">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        review.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {review.is_published ? "Đang hiển thị" : "Đang ẩn"}
                    </span>

                    <button
                      type="button"
                      onClick={() => togglePublished(review)}
                      className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                    >
                      {review.is_published ? "Ẩn" : "Hiện"}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditForm(review)}
                      className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                    >
                      Sửa
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteReview(review)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
