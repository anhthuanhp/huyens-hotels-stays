"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
};

type Activity = {
  id: number;
  title_vi: string;
  title_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  activity_date: string | null;
  hotel_id: number | null;
  status: "active" | "inactive";
  sort_order: number;
  created_at: string;
};

type Media = {
  id: number;
  bucket: string;
  path: string;
  file_name: string;
  public_url: string;
  entity_type: string;
  entity_id: number | null;
  alt_vi: string | null;
  alt_en: string | null;
  is_cover: boolean;
  sort_order: number;
  status: "active" | "inactive";
  created_at: string;
};

type UploadItem = {
  file: File;
  altVi: string;
  altEn: string;
  isCover: boolean;
  progress: number;
  status: "waiting" | "uploading" | "success" | "error";
  error?: string;
};

const BUCKET = "website-media";

/*
 * QUAN TRỌNG:
 *
 * media.entity_type trong database hiện cho phép:
 * hotel / room / experience / offer / blog / hero / service
 *
 * Vì vậy phần "Hình ảnh hoạt động / Trải nghiệm"
 * phải dùng entity_type = "experience".
 */
const MEDIA_ENTITY_TYPE = "experience";

function belongsToActivity(
  media: Media,
  activityId: number | null
) {
  if (activityId === null) return false;

  return (
    media.entity_type === MEDIA_ENTITY_TYPE &&
    String(media.entity_id) === String(activityId)
  );
}

function createSlug(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "activity"
  );
}

function formatDate(value: string | null) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return value;
  }
}

export default function TraiNghiemAdminPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [media, setMedia] = useState<Media[]>([]);

  const [selectedActivityId, setSelectedActivityId] =
    useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(
    null
  );

  const [titleVi, setTitleVi] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionVi, setDescriptionVi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [hotelId, setHotelId] = useState("");
  const [activityStatus, setActivityStatus] = useState<
    "active" | "inactive"
  >("active");
  const [sortOrder, setSortOrder] = useState("0");

  const [uploadItems, setUploadItems] = useState<UploadItem[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedActivity = useMemo(() => {
    if (selectedActivityId === null) return null;

    return (
      activities.find(
        (activity) =>
          String(activity.id) ===
          String(selectedActivityId)
      ) ?? null
    );
  }, [activities, selectedActivityId]);

  const activityMedia = useMemo(() => {
    if (selectedActivityId === null) return [];

    return media
      .filter((item) =>
        belongsToActivity(item, selectedActivityId)
      )
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [media, selectedActivityId]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [
        { data: hotelData, error: hotelError },
        { data: activityData, error: activityError },
        { data: mediaData, error: mediaError },
      ] = await Promise.all([
        supabase
          .from("hotels")
          .select("id, slug, name_vi, name_en")
          .order("name_vi"),

        supabase
          .from("activities")
          .select("*")
          .order("sort_order", {
            ascending: true,
          })
          .order("activity_date", {
            ascending: false,
            nullsFirst: false,
          })
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("media")
          .select("*")
          .eq("entity_type", MEDIA_ENTITY_TYPE)
          .order("sort_order", {
            ascending: true,
          })
          .order("created_at", {
            ascending: true,
          }),
      ]);

      if (hotelError) {
        throw new Error(
          `Không tải được danh sách khách sạn: ${hotelError.message}`
        );
      }

      if (activityError) {
        throw new Error(
          `Không tải được hoạt động: ${activityError.message}`
        );
      }

      if (mediaError) {
        throw new Error(
          `Không tải được thư viện ảnh: ${mediaError.message}`
        );
      }

      setHotels((hotelData ?? []) as Hotel[]);
      setActivities((activityData ?? []) as Activity[]);
      setMedia((mediaData ?? []) as Media[]);

      setSelectedActivityId((current) => {
        if (
          current !== null &&
          (activityData ?? []).some(
            (item) =>
              String(item.id) === String(current)
          )
        ) {
          return current;
        }

        return activityData && activityData.length > 0
          ? activityData[0].id
          : null;
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải dữ liệu."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitleVi("");
    setTitleEn("");
    setDescriptionVi("");
    setDescriptionEn("");
    setActivityDate("");
    setHotelId("");
    setActivityStatus("active");
    setSortOrder("0");
    setUploadItems([]);
    setError("");
    setSuccess("");
  }

  function editActivity(activity: Activity) {
    setEditingId(activity.id);
    setSelectedActivityId(activity.id);

    setTitleVi(activity.title_vi);
    setTitleEn(activity.title_en ?? "");
    setDescriptionVi(activity.description_vi ?? "");
    setDescriptionEn(activity.description_en ?? "");
    setActivityDate(
      activity.activity_date
        ? activity.activity_date.substring(0, 10)
        : ""
    );
    setHotelId(
      activity.hotel_id !== null
        ? String(activity.hotel_id)
        : ""
    );
    setActivityStatus(activity.status);
    setSortOrder(String(activity.sort_order));

    setUploadItems([]);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function selectActivity(activity: Activity) {
    setSelectedActivityId(activity.id);
    setEditingId(activity.id);

    setTitleVi(activity.title_vi);
    setTitleEn(activity.title_en ?? "");
    setDescriptionVi(activity.description_vi ?? "");
    setDescriptionEn(activity.description_en ?? "");
    setActivityDate(
      activity.activity_date
        ? activity.activity_date.substring(0, 10)
        : ""
    );
    setHotelId(
      activity.hotel_id !== null
        ? String(activity.hotel_id)
        : ""
    );
    setActivityStatus(activity.status);
    setSortOrder(String(activity.sort_order));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanTitleVi = titleVi.trim();

    if (!cleanTitleVi) {
      setError("Vui lòng nhập tên hoạt động.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title_vi: cleanTitleVi,
        title_en: titleEn.trim() || null,
        description_vi: descriptionVi.trim() || null,
        description_en: descriptionEn.trim() || null,
        activity_date: activityDate || null,
        hotel_id: hotelId ? Number(hotelId) : null,
        status: activityStatus,
        sort_order: Number(sortOrder) || 0,
      };

      if (editingId !== null) {
        const { error: updateError } = await supabase
          .from("activities")
          .update(payload)
          .eq("id", editingId);

        if (updateError) {
          throw new Error(
            `Không thể cập nhật hoạt động: ${updateError.message}`
          );
        }

        setSuccess("Đã cập nhật hoạt động.");
      } else {
        const { data, error: insertError } =
          await supabase
            .from("activities")
            .insert(payload)
            .select("*")
            .single();

        if (insertError) {
          throw new Error(
            `Không thể thêm hoạt động: ${insertError.message}`
          );
        }

        if (data) {
          setSelectedActivityId(data.id);
          setEditingId(data.id);
        }

        setSuccess("Đã thêm hoạt động.");
      }

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể lưu hoạt động."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteActivity(activity: Activity) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa hoạt động "${activity.title_vi}" không?\n\nCác ảnh của hoạt động này cũng sẽ được xóa khỏi thư viện.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const relatedMedia = media.filter((item) =>
        belongsToActivity(item, activity.id)
      );

      if (relatedMedia.length > 0) {
        const paths = relatedMedia.map(
          (item) => item.path
        );

        const { error: storageError } =
          await supabase.storage
            .from(BUCKET)
            .remove(paths);

        if (storageError) {
          console.warn(
            "Không thể xóa một số file Storage:",
            storageError.message
          );
        }

        const {
          error: mediaDeleteError,
        } = await supabase
          .from("media")
          .delete()
          .eq("entity_type", MEDIA_ENTITY_TYPE)
          .eq("entity_id", activity.id);

        if (mediaDeleteError) {
          throw new Error(
            `Không thể xóa thư viện ảnh: ${mediaDeleteError.message}`
          );
        }
      }

      const {
        error: activityDeleteError,
      } = await supabase
        .from("activities")
        .delete()
        .eq("id", activity.id);

      if (activityDeleteError) {
        throw new Error(
          `Không thể xóa hoạt động: ${activityDeleteError.message}`
        );
      }

      if (selectedActivityId === activity.id) {
        setSelectedActivityId(null);
        resetForm();
      }

      setSuccess("Đã xóa hoạt động.");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể xóa hoạt động."
      );
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    if (files.length === 0) return;

    const newItems: UploadItem[] = files.map(
      (file, index) => ({
        file,
        altVi:
          selectedActivity?.title_vi ??
          titleVi.trim(),
        altEn:
          selectedActivity?.title_en ??
          titleEn.trim(),
        isCover:
          activityMedia.length === 0 &&
          uploadItems.length === 0 &&
          index === 0,
        progress: 0,
        status: "waiting",
      })
    );

    setUploadItems((current) => [
      ...current,
      ...newItems,
    ]);

    event.target.value = "";
  }

  function updateUploadItem(
    index: number,
    updates: Partial<UploadItem>
  ) {
    setUploadItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...updates,
            }
          : item
      )
    );
  }

  function removeUploadItem(index: number) {
    setUploadItems((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  async function uploadImages() {
    if (selectedActivityId === null) {
      setError(
        "Vui lòng chọn một hoạt động trước khi tải ảnh."
      );
      return;
    }

    const activity = activities.find(
      (item) => item.id === selectedActivityId
    );

    if (!activity) {
      setError("Không tìm thấy hoạt động đang chọn.");
      return;
    }

    if (uploadItems.length === 0) {
      setError("Vui lòng chọn ít nhất một ảnh.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    let successCount = 0;
    const errorMessages: string[] = [];

    try {
      const existingMedia = media.filter((item) =>
        belongsToActivity(item, selectedActivityId)
      );

      let startingOrder =
        existingMedia.length > 0
          ? Math.max(
              ...existingMedia.map(
                (item) =>
                  Number(item.sort_order) || 0
              )
            ) + 1
          : 0;

      let coverAlreadyExists =
        existingMedia.some(
          (item) =>
            item.is_cover &&
            item.status === "active"
        );

      const safeFolderName = createSlug(
        activity.title_vi
      );

      const folder = `activities/${selectedActivityId}-${safeFolderName}`;

      for (
        let index = 0;
        index < uploadItems.length;
        index++
      ) {
        const item = uploadItems[index];

        updateUploadItem(index, {
          status: "uploading",
          progress: 10,
          error: undefined,
        });

        const extension =
          item.file.name.includes(".")
            ? item.file.name
                .split(".")
                .pop()
                ?.toLowerCase() || "jpg"
            : "jpg";

        /*
         * UUID chỉ dùng cho tên file Storage.
         *
         * Không dùng UUID làm media.id vì media.id
         * là bigint identity trong PostgreSQL.
         */
        const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

        const path = `${folder}/${uniqueName}`;

        try {
          const {
            error: storageError,
          } = await supabase.storage
            .from(BUCKET)
            .upload(path, item.file, {
              cacheControl: "3600",
              upsert: false,
              contentType:
                item.file.type ||
                "application/octet-stream",
            });

          if (storageError) {
            throw new Error(
              `Storage upload lỗi: ${storageError.message}`
            );
          }

          updateUploadItem(index, {
            progress: 70,
          });

          const {
            data: publicUrlData,
          } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(path);

          const publicUrl =
            publicUrlData.publicUrl;

          const shouldBeCover =
            item.isCover &&
            !coverAlreadyExists;

          /*
           * media.id là BIGINT IDENTITY.
           * Không truyền id.
           * PostgreSQL tự sinh ID.
           */
          const mediaRecord = {
            bucket: BUCKET,
            path,
            file_name: item.file.name,
            public_url: publicUrl,

            /*
             * Database constraint cho phép "experience",
             * không cho phép "activity".
             */
            entity_type: MEDIA_ENTITY_TYPE,

            entity_id: selectedActivityId,

            alt_vi:
              item.altVi.trim() ||
              activity.title_vi ||
              null,

            alt_en:
              item.altEn.trim() ||
              activity.title_en ||
              null,

            is_cover: shouldBeCover,
            sort_order: startingOrder,
            status: "active" as const,
          };

          updateUploadItem(index, {
            progress: 85,
          });

          const {
            error: insertError,
          } = await supabase
            .from("media")
            .insert(mediaRecord);

          if (insertError) {
            /*
             * Nếu Storage thành công nhưng database
             * thất bại thì xóa file Storage.
             */
            await supabase.storage
              .from(BUCKET)
              .remove([path]);

            throw new Error(
              `Không lưu được vào thư viện: ${insertError.message}`
            );
          }

          if (shouldBeCover) {
            coverAlreadyExists = true;
          }

          startingOrder += 1;
          successCount += 1;

          updateUploadItem(index, {
            progress: 100,
            status: "success",
          });
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Upload thất bại.";

          errorMessages.push(
            `${item.file.name}: ${message}`
          );

          updateUploadItem(index, {
            status: "error",
            error: message,
          });
        }
      }

      if (successCount > 0) {
        setSuccess(
          `Đã tải lên và lưu ${successCount} ảnh vào thư viện.`
        );
      }

      if (errorMessages.length > 0) {
        setError(
          errorMessages.join("\n")
        );
      }

      await loadData();

      if (errorMessages.length === 0) {
        setUploadItems([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải ảnh lên."
      );
    } finally {
      setUploading(false);
    }
  }

  async function setCover(mediaItem: Media) {
    if (selectedActivityId === null) return;

    setError("");
    setSuccess("");

    try {
      const {
        error: clearError,
      } = await supabase
        .from("media")
        .update({
          is_cover: false,
        })
        .eq("entity_type", MEDIA_ENTITY_TYPE)
        .eq("entity_id", selectedActivityId);

      if (clearError) {
        throw new Error(
          `Không thể bỏ ảnh cover cũ: ${clearError.message}`
        );
      }

      const {
        error: coverError,
      } = await supabase
        .from("media")
        .update({
          is_cover: true,
          status: "active",
        })
        .eq("id", mediaItem.id);

      if (coverError) {
        throw new Error(
          `Không thể đặt ảnh cover: ${coverError.message}`
        );
      }

      setSuccess(
        "Đã đặt ảnh này làm ảnh đại diện."
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể đặt ảnh cover."
      );
    }
  }

  async function toggleMediaStatus(
    mediaItem: Media
  ) {
    const newStatus =
      mediaItem.status === "active"
        ? "inactive"
        : "active";

    setError("");
    setSuccess("");

    try {
      const {
        error: updateError,
      } = await supabase
        .from("media")
        .update({
          status: newStatus,
        })
        .eq("id", mediaItem.id);

      if (updateError) {
        throw new Error(
          `Không thể cập nhật trạng thái ảnh: ${updateError.message}`
        );
      }

      setSuccess(
        newStatus === "active"
          ? "Đã kích hoạt ảnh."
          : "Đã ẩn ảnh."
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể cập nhật ảnh."
      );
    }
  }

  async function deleteMedia(
    mediaItem: Media
  ) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa ảnh "${mediaItem.file_name}" không?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const {
        error: storageError,
      } = await supabase.storage
        .from(mediaItem.bucket || BUCKET)
        .remove([mediaItem.path]);

      if (storageError) {
        console.warn(
          "Không thể xóa file Storage:",
          storageError.message
        );
      }

      const {
        error: deleteError,
      } = await supabase
        .from("media")
        .delete()
        .eq("id", mediaItem.id);

      if (deleteError) {
        throw new Error(
          `Không thể xóa bản ghi thư viện: ${deleteError.message}`
        );
      }

      setSuccess("Đã xóa ảnh.");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể xóa ảnh."
      );
    }
  }

  const selectedCover = activityMedia.find(
    (item) =>
      item.is_cover &&
      item.status === "active"
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1500px] px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Hình ảnh hoạt động
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Quản lý các hoạt động, trải nghiệm và thư
            viện hình ảnh của từng hoạt động.
          </p>
        </div>

        {error && (
          <div className="mb-5 whitespace-pre-line rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId !== null
                    ? "Chỉnh sửa hoạt động"
                    : "Thêm hoạt động"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Nhập thông tin hoạt động bằng tiếng
                  Việt và tiếng Anh.
                </p>
              </div>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Thêm mới
                </button>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tên hoạt động – Tiếng Việt
                </label>

                <input
                  type="text"
                  value={titleVi}
                  onChange={(event) =>
                    setTitleVi(event.target.value)
                  }
                  placeholder="Ví dụ: Khám phá phố đi bộ Nguyễn Huệ"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tên hoạt động – English
                </label>

                <input
                  type="text"
                  value={titleEn}
                  onChange={(event) =>
                    setTitleEn(event.target.value)
                  }
                  placeholder="Example: Explore Nguyen Hue Walking Street"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Mô tả – Tiếng Việt
                </label>

                <textarea
                  value={descriptionVi}
                  onChange={(event) =>
                    setDescriptionVi(
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder="Mô tả hoạt động..."
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description – English
                </label>

                <textarea
                  value={descriptionEn}
                  onChange={(event) =>
                    setDescriptionEn(
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder="Activity description..."
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Khách sạn liên quan
                </label>

                <select
                  value={hotelId}
                  onChange={(event) =>
                    setHotelId(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">
                    Không gắn với khách sạn cụ thể
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Ngày hoạt động
                  </label>

                  <input
                    type="date"
                    value={activityDate}
                    onChange={(event) =>
                      setActivityDate(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Thứ tự
                  </label>

                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(event) =>
                      setSortOrder(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Trạng thái
                </label>

                <select
                  value={activityStatus}
                  onChange={(event) =>
                    setActivityStatus(
                      event.target.value as
                        | "active"
                        | "inactive"
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="active">
                    Đang hoạt động
                  </option>
                  <option value="inactive">
                    Tạm ẩn
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Đang lưu..."
                  : editingId !== null
                    ? "Lưu thay đổi"
                    : "Thêm hoạt động"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Danh sách hoạt động
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Chọn một hoạt động để quản lý hình ảnh.
                </p>
              </div>

              {loading ? (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  Đang tải dữ liệu...
                </div>
              ) : activities.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  Chưa có hoạt động nào.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {activities.map((activity) => {
                    const cover =
                      media.find(
                        (item) =>
                          belongsToActivity(
                            item,
                            activity.id
                          ) &&
                          item.is_cover &&
                          item.status === "active"
                      ) ??
                      media.find(
                        (item) =>
                          belongsToActivity(
                            item,
                            activity.id
                          ) &&
                          item.status === "active"
                      );

                    const imageCount =
                      media.filter((item) =>
                        belongsToActivity(
                          item,
                          activity.id
                        )
                      ).length;

                    const isSelected =
                      selectedActivityId ===
                      activity.id;

                    return (
                      <div
                        key={activity.id}
                        className={`flex flex-col gap-4 p-5 transition md:flex-row md:items-center ${
                          isSelected
                            ? "bg-sky-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 md:w-36">
                          {cover ? (
                            <img
                              src={cover.public_url}
                              alt={
                                cover.alt_vi ||
                                activity.title_vi
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                              Chưa có ảnh
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-900">
                              {activity.title_vi}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                activity.status ===
                                "active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {activity.status ===
                              "active"
                                ? "Hiển thị"
                                : "Tạm ẩn"}
                            </span>
                          </div>

                          {activity.title_en && (
                            <p className="mt-1 text-sm text-slate-500">
                              {activity.title_en}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>
                              Ảnh: {imageCount}
                            </span>

                            {activity.activity_date && (
                              <span>
                                Ngày:{" "}
                                {formatDate(
                                  activity.activity_date
                                )}
                              </span>
                            )}

                            {activity.hotel_id !==
                              null && (
                              <span>
                                Khách sạn:{" "}
                                {hotels.find(
                                  (hotel) =>
                                    hotel.id ===
                                    activity.hotel_id
                                )?.name_vi ??
                                  "Không xác định"}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              selectActivity(
                                activity
                              )
                            }
                            className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
                          >
                            Quản lý ảnh
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              editActivity(activity)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void deleteActivity(
                                activity
                              )
                            }
                            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Thư viện hình ảnh
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedActivity
                        ? `Hoạt động: ${selectedActivity.title_vi}`
                        : "Chọn một hoạt động để quản lý hình ảnh."}
                    </p>
                  </div>

                  {selectedActivity && (
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
                    >
                      + Chọn ảnh
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {!selectedActivity ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  Chọn một hoạt động ở phía trên để xem
                  thư viện ảnh.
                </div>
              ) : (
                <>
                  {uploadItems.length > 0 && (
                    <div className="border-b border-slate-200 bg-slate-50 p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-slate-800">
                            Ảnh chờ tải lên
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Ảnh đầu tiên sẽ được chọn làm
                            cover nếu hoạt động chưa có
                            ảnh cover.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            void uploadImages()
                          }
                          disabled={uploading}
                          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {uploading
                            ? "Đang tải..."
                            : "Tải ảnh lên"}
                        </button>
                      </div>

                      <div className="space-y-4">
                        {uploadItems.map(
                          (item, index) => (
                            <div
                              key={`${item.file.name}-${index}`}
                              className="rounded-xl border border-slate-200 bg-white p-4"
                            >
                              <div className="flex gap-4">
                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                  <img
                                    src={URL.createObjectURL(
                                      item.file
                                    )}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-slate-800">
                                        {item.file.name}
                                      </p>

                                      <p className="mt-1 text-xs text-slate-400">
                                        {Math.round(
                                          item.file
                                            .size /
                                            1024
                                        )}{" "}
                                        KB
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeUploadItem(
                                          index
                                        )
                                      }
                                      disabled={
                                        uploading
                                      }
                                      className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-700"
                                    >
                                      Xóa
                                    </button>
                                  </div>

                                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                                    <input
                                      type="text"
                                      value={item.altVi}
                                      onChange={(
                                        event
                                      ) =>
                                        updateUploadItem(
                                          index,
                                          {
                                            altVi:
                                              event
                                                .target
                                                .value,
                                          }
                                        )
                                      }
                                      placeholder="Alt tiếng Việt"
                                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-sky-500"
                                    />

                                    <input
                                      type="text"
                                      value={item.altEn}
                                      onChange={(
                                        event
                                      ) =>
                                        updateUploadItem(
                                          index,
                                          {
                                            altEn:
                                              event
                                                .target
                                                .value,
                                          }
                                        )
                                      }
                                      placeholder="Alt English"
                                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-sky-500"
                                    />
                                  </div>

                                  <div className="mt-3 flex items-center justify-between">
                                    <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
                                      <input
                                        type="checkbox"
                                        checked={
                                          item.isCover
                                        }
                                        onChange={(
                                          event
                                        ) => {
                                          const checked =
                                            event.target
                                              .checked;

                                          setUploadItems(
                                            (
                                              current
                                            ) =>
                                              current.map(
                                                (
                                                  upload,
                                                  uploadIndex
                                                ) =>
                                                  uploadIndex ===
                                                  index
                                                    ? {
                                                        ...upload,
                                                        isCover:
                                                          checked,
                                                      }
                                                    : {
                                                        ...upload,
                                                        isCover:
                                                          checked
                                                            ? false
                                                            : upload.isCover,
                                                      }
                                              )
                                          );
                                        }}
                                      />

                                      Ảnh đại diện
                                    </label>

                                    <span
                                      className={`text-xs font-semibold ${
                                        item.status ===
                                        "success"
                                          ? "text-emerald-600"
                                          : item.status ===
                                              "error"
                                            ? "text-red-600"
                                            : item.status ===
                                                "uploading"
                                              ? "text-sky-600"
                                              : "text-slate-400"
                                      }`}
                                    >
                                      {item.status ===
                                        "waiting" &&
                                        "Chờ tải"}

                                      {item.status ===
                                        "uploading" &&
                                        `Đang tải ${item.progress}%`}

                                      {item.status ===
                                        "success" &&
                                        "Đã lưu"}

                                      {item.status ===
                                        "error" &&
                                        "Lỗi"}
                                    </span>
                                  </div>

                                  {item.status ===
                                    "uploading" && (
                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                      <div
                                        className="h-full rounded-full bg-sky-500 transition-all"
                                        style={{
                                          width: `${item.progress}%`,
                                        }}
                                      />
                                    </div>
                                  )}

                                  {item.error && (
                                    <p className="mt-2 text-xs text-red-600">
                                      {item.error}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {selectedCover && (
                    <div className="border-b border-slate-200 px-6 py-5">
                      <div className="flex items-center gap-4 rounded-xl bg-sky-50 p-4">
                        <div className="h-20 w-28 overflow-hidden rounded-lg">
                          <img
                            src={
                              selectedCover.public_url
                            }
                            alt={
                              selectedCover.alt_vi ||
                              selectedActivity.title_vi
                            }
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-sky-600">
                            Ảnh đại diện
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {selectedCover.file_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activityMedia.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="text-4xl">
                        🖼️
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        Chưa có hình ảnh
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Bấm “+ Chọn ảnh” để tải hình ảnh
                        cho hoạt động này.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-3 xl:grid-cols-4">
                      {activityMedia.map(
                        (mediaItem) => (
                          <div
                            key={mediaItem.id}
                            className={`group overflow-hidden rounded-xl border bg-white ${
                              mediaItem.is_cover
                                ? "border-sky-500 ring-2 ring-sky-100"
                                : "border-slate-200"
                            }`}
                          >
                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                              <img
                                src={
                                  mediaItem.public_url
                                }
                                alt={
                                  mediaItem.alt_vi ||
                                  selectedActivity.title_vi
                                }
                                className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${
                                  mediaItem.status ===
                                  "inactive"
                                    ? "opacity-40"
                                    : ""
                                }`}
                              />

                              {mediaItem.is_cover && (
                                <div className="absolute left-2 top-2 rounded-full bg-sky-600 px-2.5 py-1 text-[10px] font-bold text-white">
                                  COVER
                                </div>
                              )}

                              {mediaItem.status ===
                                "inactive" && (
                                <div className="absolute right-2 top-2 rounded-full bg-slate-800/80 px-2.5 py-1 text-[10px] font-bold text-white">
                                  ĐANG ẨN
                                </div>
                              )}
                            </div>

                            <div className="p-3">
                              <p
                                className="truncate text-xs font-semibold text-slate-700"
                                title={
                                  mediaItem.file_name
                                }
                              >
                                {mediaItem.file_name}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {!mediaItem.is_cover && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void setCover(
                                        mediaItem
                                      )
                                    }
                                    className="rounded-lg border border-sky-200 px-2.5 py-1.5 text-[11px] font-semibold text-sky-700 transition hover:bg-sky-50"
                                  >
                                    Đặt cover
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    void toggleMediaStatus(
                                      mediaItem
                                    )
                                  }
                                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                  {mediaItem.status ===
                                  "active"
                                    ? "Ẩn"
                                    : "Hiện"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void deleteMedia(
                                      mediaItem
                                    )
                                  }
                                  className="rounded-lg border border-red-200 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}