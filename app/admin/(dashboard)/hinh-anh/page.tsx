"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

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
};

type Media = {
  id: number;
  bucket: string;
  path: string;
  file_name: string;
  public_url: string;
  entity_type: "hotel" | "room";
  entity_id: number | null;
  alt_vi: string | null;
  alt_en: string | null;
  is_cover: boolean;
  sort_order: number;
  status: "active" | "inactive";
  created_at: string;
};

type UploadStatus = "waiting" | "uploading" | "success" | "error";

type UploadItem = {
  id: string;
  file: File;
  preview: string;
  altVi: string;
  altEn: string;
  isCover: boolean;
  progress: number;
  status: UploadStatus;
  error?: string;
};

export default function HinhAnhPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [media, setMedia] = useState<Media[]>([]);

  const [entityType, setEntityType] = useState<"hotel" | "room">("room");
  const [hotelId, setHotelId] = useState("");
  const [roomId, setRoomId] = useState("");

  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedHotelId = hotelId ? Number(hotelId) : null;
  const selectedRoomId = roomId ? Number(roomId) : null;

  const filteredRooms = useMemo(() => {
    if (!selectedHotelId) return [];

    return rooms.filter(
      (room) => room.hotel_id === selectedHotelId
    );
  }, [rooms, selectedHotelId]);

  const currentEntityId =
    entityType === "hotel" ? selectedHotelId : selectedRoomId;

  const currentMedia = useMemo(() => {
    if (!currentEntityId) return [];

    return media
      .filter(
        (item) =>
          item.entity_type === entityType &&
          item.entity_id === currentEntityId
      )
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [media, entityType, currentEntityId]);

  const selectedHotel = hotels.find(
    (hotel) => hotel.id === selectedHotelId
  );

  const selectedRoom = rooms.find(
    (room) => room.id === selectedRoomId
  );

  const uploadedCount = uploadItems.filter(
    (item) => item.status === "success"
  ).length;

  const uploadingCount = uploadItems.filter(
    (item) => item.status === "uploading"
  ).length;

  const totalUploadCount = uploadItems.length;

  const totalProgress =
    uploadItems.length > 0
      ? Math.round(
          uploadItems.reduce(
            (total, item) => total + item.progress,
            0
          ) / uploadItems.length
        )
      : 0;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setRoomId("");
  }, [hotelId]);

  useEffect(() => {
    setMessage("");
    setError("");
  }, [entityType, hotelId, roomId]);

  async function loadData() {
    setLoading(true);
    setError("");

    const [
      { data: hotelData, error: hotelError },
      { data: roomData, error: roomError },
      { data: mediaData, error: mediaError },
    ] = await Promise.all([
      supabase
        .from("hotels")
        .select("id, slug, name_vi, name_en")
        .order("name_vi"),

      supabase
        .from("rooms")
        .select("id, hotel_id, slug, name_vi, name_en")
        .order("name_vi"),

      supabase
        .from("media")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: true }),
    ]);

    if (hotelError) {
      setError(
        `Không tải được khách sạn: ${hotelError.message}`
      );
    }

    if (roomError) {
      setError(
        `Không tải được phòng: ${roomError.message}`
      );
    }

    if (mediaError) {
      setError(
        `Không tải được hình ảnh: ${mediaError.message}`
      );
    }

    setHotels((hotelData ?? []) as Hotel[]);
    setRooms((roomData ?? []) as Room[]);
    setMedia((mediaData ?? []) as Media[]);

    setLoading(false);
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    const newItems: UploadItem[] = files.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      altVi: "",
      altEn: "",
      isCover: false,
      progress: 0,
      status: "waiting",
    }));

    setUploadItems((current) => {
      const combined = [...current, ...newItems];

      if (
        combined.length > 0 &&
        !combined.some((item) => item.isCover)
      ) {
        combined[0].isCover = true;
      }

      return combined;
    });

    event.target.value = "";
  }

  function removeUploadItem(id: string) {
    if (uploading) return;

    setUploadItems((current) => {
      const item = current.find((x) => x.id === id);

      if (item) {
        URL.revokeObjectURL(item.preview);
      }

      const next = current.filter((x) => x.id !== id);

      if (
        next.length > 0 &&
        !next.some((x) => x.isCover)
      ) {
        next[0].isCover = true;
      }

      return next;
    });
  }

  function updateUploadItem(
    id: string,
    field: "altVi" | "altEn",
    value: string
  ) {
    if (uploading) return;

    setUploadItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function setUploadCover(id: string) {
    if (uploading) return;

    setUploadItems((current) =>
      current.map((item) => ({
        ...item,
        isCover: item.id === id,
      }))
    );
  }

  function moveUploadItem(
    id: string,
    direction: "up" | "down"
  ) {
    if (uploading) return;

    setUploadItems((current) => {
      const index = current.findIndex(
        (item) => item.id === id
      );

      if (index < 0) return current;

      const newIndex =
        direction === "up" ? index - 1 : index + 1;

      if (
        newIndex < 0 ||
        newIndex >= current.length
      ) {
        return current;
      }

      const next = [...current];

      const temp = next[index];

      next[index] = next[newIndex];
      next[newIndex] = temp;

      return next;
    });
  }

  function updateUploadProgress(
    id: string,
    progress: number,
    status?: UploadStatus,
    errorMessage?: string
  ) {
    setUploadItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              progress,
              ...(status ? { status } : {}),
              ...(errorMessage
                ? { error: errorMessage }
                : {}),
            }
          : item
      )
    );
  }

  function uploadFileWithProgress(
    file: File,
    path: string,
    uploadItemId: string
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          reject(
            new Error(
              `Không lấy được phiên đăng nhập: ${sessionError.message}`
            )
          );
          return;
        }

        if (!session?.access_token) {
          reject(
            new Error(
              "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại."
            )
          );
          return;
        }

        const supabaseUrl =
          process.env.NEXT_PUBLIC_SUPABASE_URL;

        const publishableKey =
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

        if (!supabaseUrl || !publishableKey) {
          reject(
            new Error(
              "Thiếu cấu hình Supabase trong .env.local."
            )
          );
          return;
        }

        const xhr = new XMLHttpRequest();

        const encodedPath = path
          .split("/")
          .map((part) => encodeURIComponent(part))
          .join("/");

        const uploadUrl =
          `${supabaseUrl}/storage/v1/object/website-media/${encodedPath}`;

        xhr.open("POST", uploadUrl, true);

        xhr.setRequestHeader(
          "Authorization",
          `Bearer ${session.access_token}`
        );

        xhr.setRequestHeader(
          "apikey",
          publishableKey
        );

        xhr.setRequestHeader(
          "x-upsert",
          "false"
        );

        xhr.setRequestHeader(
          "cache-control",
          "3600"
        );

        xhr.setRequestHeader(
          "content-type",
          file.type || "application/octet-stream"
        );

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;

          const progress = Math.round(
            (event.loaded / event.total) * 100
          );

          updateUploadProgress(
            uploadItemId,
            progress,
            "uploading"
          );
        };

        xhr.onload = () => {
          if (
            xhr.status >= 200 &&
            xhr.status < 300
          ) {
            updateUploadProgress(
              uploadItemId,
              100,
              "success"
            );

            resolve();
            return;
          }

          let errorMessage = "Upload thất bại.";

          try {
            const response = JSON.parse(
              xhr.responseText
            );

            if (response?.message) {
              errorMessage = response.message;
            } else if (response?.error) {
              errorMessage = response.error;
            }
          } catch {
            if (xhr.responseText) {
              errorMessage = xhr.responseText;
            }
          }

          updateUploadProgress(
            uploadItemId,
            0,
            "error",
            errorMessage
          );

          reject(new Error(errorMessage));
        };

        xhr.onerror = () => {
          const errorMessage =
            "Không thể kết nối tới Supabase Storage.";

          updateUploadProgress(
            uploadItemId,
            0,
            "error",
            errorMessage
          );

          reject(new Error(errorMessage));
        };

        xhr.onabort = () => {
          const errorMessage =
            "Upload đã bị hủy.";

          updateUploadProgress(
            uploadItemId,
            0,
            "error",
            errorMessage
          );

          reject(new Error(errorMessage));
        };

        updateUploadProgress(
          uploadItemId,
          0,
          "uploading"
        );

        xhr.send(file);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi upload.";

        updateUploadProgress(
          uploadItemId,
          0,
          "error",
          message
        );

        reject(new Error(message));
      }
    });
  }

  async function uploadImages() {
    if (!currentEntityId) {
      setError(
        entityType === "hotel"
          ? "Hãy chọn khách sạn."
          : "Hãy chọn loại phòng."
      );

      return;
    }

    if (uploadItems.length === 0) {
      setError("Hãy chọn ít nhất một hình ảnh.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const bucket = "website-media";

      const entitySlug =
        entityType === "hotel"
          ? selectedHotel?.slug
          : `${selectedHotel?.slug}/${selectedRoom?.slug}`;

      if (!entitySlug) {
        throw new Error(
          "Không xác định được đối tượng hình ảnh."
        );
      }

      const existingMedia = currentMedia;

      const startingOrder =
        existingMedia.length > 0
          ? Math.max(
              ...existingMedia.map(
                (item) => item.sort_order
              )
            ) + 1
          : 0;

      let coverAlreadyExists =
        currentMedia.some(
          (item) =>
            item.is_cover &&
            item.status === "active"
        );

      const uploadedRecords: Omit<
        Media,
        "id" | "created_at"
      >[] = [];

      let successfulUploads = 0;
      const failedUploads: string[] = [];

      for (
        let index = 0;
        index < uploadItems.length;
        index++
      ) {
        const item = uploadItems[index];

        const extension =
          item.file.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const safeName =
          item.file.name
            .replace(/\.[^/.]+$/, "")
            .toLowerCase()
            .replace(/[^a-z0-9-_]+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "") || "image";

        const uniqueName =
          `${Date.now()}-${index}-${safeName}.${extension}`;

        const folder =
          entityType === "hotel"
            ? `hotels/${entitySlug}`
            : `rooms/${entitySlug}`;

        const path =
          `${folder}/${uniqueName}`;

        try {
          await uploadFileWithProgress(
            item.file,
            path,
            item.id
          );

          const { data: publicUrlData } =
            supabase.storage
              .from(bucket)
              .getPublicUrl(path);

          const shouldBeCover =
            item.isCover &&
            !coverAlreadyExists;

          if (shouldBeCover) {
            coverAlreadyExists = true;
          }

          uploadedRecords.push({
            bucket,
            path,
            file_name: item.file.name,
            public_url:
              publicUrlData.publicUrl,
            entity_type: entityType,
            entity_id: currentEntityId,
            alt_vi: item.altVi || null,
            alt_en: item.altEn || null,
            is_cover: shouldBeCover,
            sort_order:
              startingOrder + index,
            status: "active",
          });

          successfulUploads++;
        } catch (err) {
          failedUploads.push(
            item.file.name
          );
        }
      }

      if (uploadedRecords.length > 0) {
        const { error: insertError } =
          await supabase
            .from("media")
            .insert(uploadedRecords);

        if (insertError) {
          for (const record of uploadedRecords) {
            await supabase.storage
              .from(bucket)
              .remove([record.path]);
          }

          throw new Error(
            `Không lưu được thông tin hình ảnh: ${insertError.message}`
          );
        }
      }

      if (
        successfulUploads === uploadItems.length
      ) {
        setMessage(
          `Đã tải lên ${successfulUploads} hình ảnh thành công.`
        );
      } else if (successfulUploads > 0) {
        setMessage(
          `Đã tải lên ${successfulUploads}/${uploadItems.length} hình ảnh.`
        );

        if (failedUploads.length > 0) {
          setError(
            `Không tải được: ${failedUploads.join(
              ", "
            )}`
          );
        }
      } else {
        throw new Error(
          "Không có hình ảnh nào được tải lên thành công."
        );
      }

      for (const item of uploadItems) {
        URL.revokeObjectURL(item.preview);
      }

      setUploadItems([]);

      await loadData();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi tải hình ảnh.";

      setError(message);
    } finally {
      setUploading(false);
    }
  }

  async function setCover(mediaId: number) {
    if (!currentEntityId) return;

    setError("");
    setMessage("");

    const { error: resetError } =
      await supabase
        .from("media")
        .update({
          is_cover: false,
        })
        .eq("entity_type", entityType)
        .eq("entity_id", currentEntityId);

    if (resetError) {
      setError(
        `Không cập nhật ảnh cover: ${resetError.message}`
      );
      return;
    }

    const { error: coverError } =
      await supabase
        .from("media")
        .update({
          is_cover: true,
        })
        .eq("id", mediaId);

    if (coverError) {
      setError(
        `Không đặt được ảnh cover: ${coverError.message}`
      );
      return;
    }

    setMessage("Đã cập nhật ảnh cover.");

    await loadData();
  }

  async function deleteMedia(item: Media) {
    const confirmed = window.confirm(
      `Xóa hình ảnh "${item.file_name}"?\n\nHình ảnh sẽ bị xóa khỏi Storage và danh sách media.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: storageError } =
      await supabase.storage
        .from(item.bucket)
        .remove([item.path]);

    if (storageError) {
      setError(
        `Không xóa được file: ${storageError.message}`
      );
      return;
    }

    const { error: deleteError } =
      await supabase
        .from("media")
        .delete()
        .eq("id", item.id);

    if (deleteError) {
      setError(
        `Không xóa được dữ liệu media: ${deleteError.message}`
      );
      return;
    }

    setMessage("Đã xóa hình ảnh.");

    await loadData();
  }

  async function toggleStatus(item: Media) {
    const nextStatus =
      item.status === "active"
        ? "inactive"
        : "active";

    const { error } = await supabase
      .from("media")
      .update({
        status: nextStatus,
      })
      .eq("id", item.id);

    if (error) {
      setError(
        `Không cập nhật trạng thái: ${error.message}`
      );
      return;
    }

    await loadData();
  }

  async function updateSortOrder(
    item: Media,
    value: string
  ) {
    const sortOrder = Number(value);

    if (!Number.isFinite(sortOrder)) return;

    const { error } = await supabase
      .from("media")
      .update({
        sort_order: sortOrder,
      })
      .eq("id", item.id);

    if (error) {
      setError(
        `Không cập nhật thứ tự: ${error.message}`
      );
      return;
    }

    await loadData();
  }

  function clearSelection() {
    if (uploading) return;

    uploadItems.forEach((item) => {
      URL.revokeObjectURL(item.preview);
    });

    setHotelId("");
    setRoomId("");
    setUploadItems([]);
    setMessage("");
    setError("");
  }

  function getUploadStatusText(
    item: UploadItem
  ) {
    switch (item.status) {
      case "waiting":
        return "Chờ tải";

      case "uploading":
        return `Đang tải ${item.progress}%`;

      case "success":
        return "Đã tải ✓";

      case "error":
        return "Lỗi upload";

      default:
        return "";
    }
  }

  function getUploadStatusClass(
    status: UploadStatus
  ) {
    switch (status) {
      case "waiting":
        return "bg-slate-100 text-slate-600";

      case "uploading":
        return "bg-sky-100 text-sky-700";

      case "success":
        return "bg-emerald-100 text-emerald-700";

      case "error":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Hình ảnh
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Quản lý hình ảnh khách sạn và từng loại phòng.
        </p>
      </div>

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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Đối tượng
            </label>

            <select
              value={entityType}
              onChange={(event) =>
                setEntityType(
                  event.target.value as
                    | "hotel"
                    | "room"
                )
              }
              disabled={uploading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
            >
              <option value="room">
                Phòng
              </option>

              <option value="hotel">
                Khách sạn
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Khách sạn
            </label>

            <select
              value={hotelId}
              onChange={(event) =>
                setHotelId(event.target.value)
              }
              disabled={uploading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
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

          {entityType === "room" ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Loại phòng
              </label>

              <select
                value={roomId}
                onChange={(event) =>
                  setRoomId(event.target.value)
                }
                disabled={!hotelId || uploading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none disabled:bg-slate-100 focus:border-sky-500"
              >
                <option value="">
                  {hotelId
                    ? "-- Chọn loại phòng --"
                    : "-- Chọn khách sạn trước --"}
                </option>

                {filteredRooms.map((room) => (
                  <option
                    key={room.id}
                    value={room.id}
                  >
                    {room.name_vi}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-end">
              <div className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Ảnh sẽ thuộc về toàn bộ khách sạn.
              </div>
            </div>
          )}
        </div>

        {(selectedHotel || selectedRoom) && (
          <div className="mt-4 rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
            Đang quản lý:{" "}
            <strong>
              {entityType === "hotel"
                ? selectedHotel?.name_vi
                : `${selectedHotel?.name_vi} → ${selectedRoom?.name_vi}`}
            </strong>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Tải hình ảnh mới
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Có thể chọn nhiều ảnh cùng lúc.
            </p>
          </div>

          <label
            className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white ${
              !currentEntityId || uploading
                ? "cursor-not-allowed bg-slate-300"
                : "cursor-pointer bg-sky-600 hover:bg-sky-700"
            }`}
          >
            + Chọn hình ảnh

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              disabled={!currentEntityId || uploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {uploadItems.length > 0 && (
          <div className="mt-5 space-y-5">
            {/* TỔNG TIẾN ĐỘ */}
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">
                    {uploading
                      ? "Đang tải hình ảnh..."
                      : "Danh sách hình ảnh"}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {uploading
                      ? `${uploadedCount} / ${totalUploadCount} ảnh đã hoàn tất`
                      : `${totalUploadCount} ảnh đã chọn`}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-sky-700">
                    {totalProgress}%
                  </p>

                  {uploadingCount > 0 && (
                    <p className="text-xs text-sky-600">
                      {uploadingCount} ảnh đang tải
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-sky-600 transition-all duration-200"
                  style={{
                    width: `${totalProgress}%`,
                  }}
                />
              </div>
            </div>

            {uploadItems.map((item, index) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200"
              >
                <div className="grid md:grid-cols-[180px_1fr]">
                  <div className="relative h-44 bg-slate-100 md:h-full">
                    <img
                      src={item.preview}
                      alt={item.file.name}
                      className="h-full w-full object-cover"
                    />

                    {item.isCover && (
                      <div className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                        ẢNH COVER
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="truncate font-semibold text-slate-900"
                          title={item.file.name}
                        >
                          {item.file.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {(
                            item.file.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getUploadStatusClass(
                          item.status
                        )}`}
                      >
                        {getUploadStatusText(item)}
                      </span>
                    </div>

                    {/* PROGRESS TỪNG ẢNH */}
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-slate-500">
                          Tiến độ
                        </span>

                        <span className="font-semibold text-slate-700">
                          {item.progress}%
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-200 ${
                            item.status === "error"
                              ? "bg-red-500"
                              : item.status === "success"
                                ? "bg-emerald-500"
                                : "bg-sky-600"
                          }`}
                          style={{
                            width: `${item.progress}%`,
                          }}
                        />
                      </div>

                      {item.error && (
                        <p className="mt-2 text-xs text-red-600">
                          {item.error}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            moveUploadItem(
                              item.id,
                              "up"
                            )
                          }
                          disabled={
                            index === 0 || uploading
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium disabled:opacity-40"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveUploadItem(
                              item.id,
                              "down"
                            )
                          }
                          disabled={
                            index ===
                              uploadItems.length - 1 ||
                            uploading
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium disabled:opacity-40"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setUploadCover(item.id)
                          }
                          disabled={uploading}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                            item.isCover
                              ? "bg-amber-100 text-amber-700"
                              : "border border-slate-300 text-slate-700"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {item.isCover
                            ? "Ảnh cover"
                            : "Đặt làm cover"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeUploadItem(item.id)
                          }
                          disabled={uploading}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Alt tiếng Việt
                        </label>

                        <input
                          value={item.altVi}
                          onChange={(event) =>
                            updateUploadItem(
                              item.id,
                              "altVi",
                              event.target.value
                            )
                          }
                          disabled={uploading}
                          placeholder="Mô tả hình ảnh"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Alt tiếng Anh
                        </label>

                        <input
                          value={item.altEn}
                          onChange={(event) =>
                            updateUploadItem(
                              item.id,
                              "altEn",
                              event.target.value
                            )
                          }
                          disabled={uploading}
                          placeholder="Image description"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={uploadImages}
                disabled={uploading}
                className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {uploading
                  ? `Đang tải ${uploadedCount}/${totalUploadCount} ảnh...`
                  : `Tải lên ${uploadItems.length} hình ảnh`}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Thư viện hình ảnh
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {currentMedia.length} hình ảnh
            </p>
          </div>
        </div>

        {!currentEntityId ? (
          <div className="mt-6 rounded-xl bg-slate-50 py-12 text-center text-sm text-slate-500">
            Chọn khách sạn và đối tượng để xem hình ảnh.
          </div>
        ) : loading ? (
          <div className="mt-6 py-12 text-center text-sm text-slate-500">
            Đang tải...
          </div>
        ) : currentMedia.length === 0 ? (
          <div className="mt-6 rounded-xl bg-slate-50 py-12 text-center">
            <p className="text-sm text-slate-500">
              Chưa có hình ảnh.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Chọn hình ảnh ở phần phía trên để bắt đầu.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentMedia.map((item, index) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="relative aspect-[4/3] bg-slate-100">
                  <img
                    src={item.public_url}
                    alt={
                      item.alt_vi ||
                      item.file_name
                    }
                    className={`h-full w-full object-cover ${
                      item.status === "inactive"
                        ? "opacity-40"
                        : ""
                    }`}
                  />

                  {item.is_cover && (
                    <div className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                      COVER
                    </div>
                  )}

                  <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white">
                    #{index + 1}
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <p
                      className="truncate text-sm font-semibold text-slate-900"
                      title={item.file_name}
                    >
                      {item.file_name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Thứ tự: {item.sort_order}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCover(item.id)
                      }
                      disabled={item.is_cover}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {item.is_cover
                        ? "Đang cover"
                        : "Đặt cover"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleStatus(item)
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                        item.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status === "active"
                        ? "Đang hiện"
                        : "Đang ẩn"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs text-slate-500">
                      Thứ tự

                      <input
                        type="number"
                        defaultValue={
                          item.sort_order
                        }
                        onBlur={(event) =>
                          updateSortOrder(
                            item,
                            event.target.value
                          )
                        }
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
                      />
                    </label>

                    <div>
                      <span className="text-xs text-slate-500">
                        Trạng thái
                      </span>

                      <div className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        {item.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      deleteMedia(item)
                    }
                    className="w-full rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Xóa hình ảnh
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(selectedHotel || selectedRoom) && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearSelection}
            disabled={uploading}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xóa lựa chọn
          </button>
        </div>
      )}
    </div>
  );
}