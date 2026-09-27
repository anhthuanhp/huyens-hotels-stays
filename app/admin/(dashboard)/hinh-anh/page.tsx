
"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

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

type HeroSlide = {
  id: number;
  position: number;
  image_url: string;
  storage_path: string;
  title_vi: string | null;
  title_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
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

type HeroDraft = {
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
};

const HERO_BUCKET = "hero-images";
const HERO_MAX_SIZE = 300 * 1024;
const HERO_MAX_COUNT = 4;

export default function HinhAnhPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  const [entityType, setEntityType] = useState<"hotel" | "room">(
    "room"
  );
  const [hotelId, setHotelId] = useState("");
  const [roomId, setRoomId] = useState("");

  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [heroLoading, setHeroLoading] = useState(true);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroSavingId, setHeroSavingId] = useState<number | null>(null);
  const [heroDeletingId, setHeroDeletingId] = useState<number | null>(null);
  const [heroError, setHeroError] = useState("");
  const [heroMessage, setHeroMessage] = useState("");
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState("");
  const [heroPosition, setHeroPosition] = useState("1");
  const [heroDrafts, setHeroDrafts] = useState<Record<number, HeroDraft>>(
    {}
  );

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
    entityType === "hotel"
      ? selectedHotelId
      : selectedRoomId;

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

  const sortedHeroSlides = useMemo(
    () =>
      [...heroSlides].sort(
        (a, b) => a.position - b.position
      ),
    [heroSlides]
  );

  const activeHeroCount = heroSlides.filter(
    (item) => item.status === "active"
  ).length;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    return () => {
      if (heroPreview) {
        URL.revokeObjectURL(heroPreview);
      }
    };
  }, [heroPreview]);

  function handleEntityTypeChange(
    value: "hotel" | "room"
  ) {
    setEntityType(value);
    setHotelId("");
    setRoomId("");
    setMessage("");
    setError("");
  }

  function handleHotelChange(value: string) {
    setHotelId(value);
    setRoomId("");
    setMessage("");
    setError("");
  }

  function handleRoomChange(value: string) {
    setRoomId(value);
    setMessage("");
    setError("");
  }

  async function loadData() {
    setLoading(true);
    setHeroLoading(true);
    setError("");
    setHeroError("");

    const [
      { data: hotelData, error: hotelError },
      { data: roomData, error: roomError },
      { data: mediaData, error: mediaError },
      { data: heroData, error: heroErrorData },
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
        .order("created_at", {
          ascending: true,
        }),

      supabase
        .from("hero_slides")
        .select("*")
        .order("position"),
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

    if (heroErrorData) {
      setHeroError(
        `Không tải được Hero: ${heroErrorData.message}`
      );
    }

    setHotels((hotelData ?? []) as Hotel[]);
    setRooms((roomData ?? []) as Room[]);
    setMedia((mediaData ?? []) as Media[]);

    const heroRows = (heroData ?? []) as HeroSlide[];

    setHeroSlides(heroRows);

    const nextDrafts: Record<number, HeroDraft> = {};

    heroRows.forEach((slide) => {
      nextDrafts[slide.id] = {
        titleVi: slide.title_vi ?? "",
        titleEn: slide.title_en ?? "",
        descriptionVi: slide.description_vi ?? "",
        descriptionEn: slide.description_en ?? "",
      };
    });

    setHeroDrafts(nextDrafts);

    setLoading(false);
    setHeroLoading(false);
  }

  function handleHeroFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setHeroError("");
    setHeroMessage("");

    if (file.type !== "image/webp") {
      setHeroError(
        "Hero chỉ chấp nhận file WebP (.webp)."
      );
      return;
    }

    if (file.size > HERO_MAX_SIZE) {
      setHeroError(
        `Ảnh Hero không được vượt quá 300 KB. File hiện tại: ${(
          file.size / 1024
        ).toFixed(1)} KB.`
      );
      return;
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {     

      URL.revokeObjectURL(objectUrl);

     

      setHeroFile(file);

      if (heroPreview) {
        URL.revokeObjectURL(heroPreview);
      }

      setHeroPreview(URL.createObjectURL(file));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setHeroError(
        "Không thể đọc file hình ảnh này."
      );
    };

    image.src = objectUrl;
  }

  function clearHeroSelection() {
    if (heroUploading) return;

    if (heroPreview) {
      URL.revokeObjectURL(heroPreview);
    }

    setHeroFile(null);
    setHeroPreview("");
    setHeroError("");
  }

  async function uploadHero() {
    if (!heroFile) {
      setHeroError("Hãy chọn một ảnh Hero.");
      return;
    }

    const position = Number(heroPosition);

    if (
      !Number.isInteger(position) ||
      position < 1 ||
      position > HERO_MAX_COUNT
    ) {
      setHeroError(
        "Vị trí Hero phải từ 1 đến 4."
      );
      return;
    }

    const existingAtPosition = heroSlides.find(
      (slide) => slide.position === position
    );

    if (existingAtPosition) {
      setHeroError(
        `Vị trí ${position} đã có Hero. Hãy chọn vị trí khác hoặc thay ảnh tại Hero hiện tại.`
      );
      return;
    }

    if (activeHeroCount >= HERO_MAX_COUNT) {
      setHeroError(
        "Đã có tối đa 4 Hero active. Hãy ẩn hoặc xóa một Hero trước khi thêm."
      );
      return;
    }

    setHeroUploading(true);
    setHeroError("");
    setHeroMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          `Không lấy được phiên đăng nhập: ${sessionError.message}`
        );
      }

      if (!session?.access_token) {
        throw new Error(
          "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại."
        );
      }

      const timestamp = Date.now();

      const filePath = `hero-${position}-${timestamp}.webp`;

      const { error: uploadError } =
        await supabase.storage
          .from(HERO_BUCKET)
          .upload(filePath, heroFile, {
            cacheControl: "31536000",
            contentType: "image/webp",
            upsert: false,
          });

      if (uploadError) {
        throw new Error(
          `Upload Hero thất bại: ${uploadError.message}`
        );
      }

      const { data: publicUrlData } =
        supabase.storage
          .from(HERO_BUCKET)
          .getPublicUrl(filePath);

      const { error: insertError } =
        await supabase
          .from("hero_slides")
          .insert({
            position,
            image_url: publicUrlData.publicUrl,
            storage_path: filePath,
            title_vi: "",
            title_en: "",
            description_vi: "",
            description_en: "",
            status: "active",
          });

      if (insertError) {
        await supabase.storage
          .from(HERO_BUCKET)
          .remove([filePath]);

        throw new Error(
          `Không lưu được Hero: ${insertError.message}`
        );
      }

      setHeroMessage(
        `Đã thêm Hero vị trí ${position}.`
      );

      clearHeroSelection();

      await loadData();
    } catch (err) {
      setHeroError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi upload Hero."
      );
    } finally {
      setHeroUploading(false);
    }
  }

  async function replaceHeroImage(
    slide: HeroSlide,
    file: File
  ) {
    if (file.type !== "image/webp") {
      setHeroError(
        "Ảnh Hero chỉ được thay bằng file WebP."
      );
      return;
    }

    if (file.size > HERO_MAX_SIZE) {
      setHeroError(
        `Ảnh Hero không được vượt quá 300 KB. File hiện tại: ${(
          file.size / 1024
        ).toFixed(1)} KB.`
      );
      return;
    }

    const isValid = await validateHeroDimensions(file);

    if (!isValid) return;

    setHeroSavingId(slide.id);
    setHeroError("");
    setHeroMessage("");

    try {
      const timestamp = Date.now();

      const newPath = `hero-${slide.position}-${timestamp}.webp`;

      const { error: uploadError } =
        await supabase.storage
          .from(HERO_BUCKET)
          .upload(newPath, file, {
            cacheControl: "31536000",
            contentType: "image/webp",
            upsert: false,
          });

      if (uploadError) {
        throw new Error(
          `Không upload được ảnh mới: ${uploadError.message}`
        );
      }

      const { data: publicUrlData } =
        supabase.storage
          .from(HERO_BUCKET)
          .getPublicUrl(newPath);

      const { error: updateError } =
        await supabase
          .from("hero_slides")
          .update({
            image_url: publicUrlData.publicUrl,
            storage_path: newPath,
          })
          .eq("id", slide.id);

      if (updateError) {
        await supabase.storage
          .from(HERO_BUCKET)
          .remove([newPath]);

        throw new Error(
          `Không cập nhật Hero: ${updateError.message}`
        );
      }

      if (slide.storage_path) {
        await supabase.storage
          .from(HERO_BUCKET)
          .remove([slide.storage_path]);
      }

      setHeroMessage(
        `Đã thay ảnh Hero vị trí ${slide.position}.`
      );

      await loadData();
    } catch (err) {
      setHeroError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi thay ảnh Hero."
      );
    } finally {
      setHeroSavingId(null);
    }
  }

  async function handleHeroReplacement(
    slide: HeroSlide,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    await replaceHeroImage(slide, file);
  }

  function validateHeroDimensions(
    file: File
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        resolve(true);
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);

        setHeroError(
          "Không thể đọc kích thước ảnh Hero."
        );

        resolve(false);
      };

      image.src = objectUrl;
    });
  }

  function updateHeroDraft(
    id: number,
    field: keyof HeroDraft,
    value: string
  ) {
    setHeroDrafts((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? {
          titleVi: "",
          titleEn: "",
          descriptionVi: "",
          descriptionEn: "",
        }),
        [field]: value,
      },
    }));
  }

  async function saveHeroText(
    slide: HeroSlide
  ) {
    const draft = heroDrafts[slide.id];

    if (!draft) return;

    setHeroSavingId(slide.id);
    setHeroError("");
    setHeroMessage("");

    const { error: updateError } =
      await supabase
        .from("hero_slides")
        .update({
          title_vi: draft.titleVi.trim(),
          title_en: draft.titleEn.trim(),
          description_vi:
            draft.descriptionVi.trim(),
          description_en:
            draft.descriptionEn.trim(),
        })
        .eq("id", slide.id);

    if (updateError) {
      setHeroError(
        `Không lưu nội dung Hero: ${updateError.message}`
      );
      setHeroSavingId(null);
      return;
    }

    setHeroMessage(
      `Đã lưu nội dung Hero vị trí ${slide.position}.`
    );

    setHeroSavingId(null);
    await loadData();
  }

  async function toggleHeroStatus(
    slide: HeroSlide
  ) {
    const nextStatus =
      slide.status === "active"
        ? "inactive"
        : "active";

    if (
      nextStatus === "active" &&
      activeHeroCount >= HERO_MAX_COUNT
    ) {
      setHeroError(
        "Không thể Active thêm. Website chỉ cho phép tối đa 4 Hero active."
      );
      return;
    }

    setHeroSavingId(slide.id);
    setHeroError("");
    setHeroMessage("");

    const { error: updateError } =
      await supabase
        .from("hero_slides")
        .update({
          status: nextStatus,
        })
        .eq("id", slide.id);

    if (updateError) {
      setHeroError(
        `Không cập nhật trạng thái Hero: ${updateError.message}`
      );
      setHeroSavingId(null);
      return;
    }

    setHeroMessage(
      nextStatus === "active"
        ? `Đã bật Hero vị trí ${slide.position}.`
        : `Đã ẩn Hero vị trí ${slide.position}.`
    );

    setHeroSavingId(null);
    await loadData();
  }

  async function updateHeroPosition(
    slide: HeroSlide,
    value: string
  ) {
    const nextPosition = Number(value);

    if (
      !Number.isInteger(nextPosition) ||
      nextPosition < 1 ||
      nextPosition > HERO_MAX_COUNT
    ) {
      setHeroError(
        "Vị trí Hero phải từ 1 đến 4."
      );
      return;
    }

    if (nextPosition === slide.position) {
      return;
    }

    const occupiedSlide = heroSlides.find(
      (item) =>
        item.position === nextPosition &&
        item.id !== slide.id
    );

    if (occupiedSlide) {
      setHeroError(
        `Vị trí ${nextPosition} đang được sử dụng. Hãy chọn vị trí trống.`
      );
      return;
    }

    setHeroSavingId(slide.id);
    setHeroError("");
    setHeroMessage("");

    const { error: updateError } =
      await supabase
        .from("hero_slides")
        .update({
          position: nextPosition,
        })
        .eq("id", slide.id);

    if (updateError) {
      setHeroError(
        `Không cập nhật vị trí Hero: ${updateError.message}`
      );
      setHeroSavingId(null);
      return;
    }

    setHeroMessage(
      `Đã chuyển Hero sang vị trí ${nextPosition}.`
    );

    setHeroSavingId(null);
    await loadData();
  }

  async function deleteHero(slide: HeroSlide) {
    const confirmed = window.confirm(
      `Xóa Hero vị trí ${slide.position}?\n\nẢnh sẽ bị xóa khỏi Storage và bản ghi Hero.`
    );

    if (!confirmed) return;

    setHeroDeletingId(slide.id);
    setHeroError("");
    setHeroMessage("");

    try {
      const { error: deleteError } =
        await supabase
          .from("hero_slides")
          .delete()
          .eq("id", slide.id);

      if (deleteError) {
        throw new Error(
          `Không xóa được Hero: ${deleteError.message}`
        );
      }

      if (slide.storage_path) {
        const { error: storageError } =
          await supabase.storage
            .from(HERO_BUCKET)
            .remove([slide.storage_path]);

        if (storageError) {
          setHeroMessage(
            `Đã xóa bản ghi Hero nhưng chưa xóa được file Storage: ${storageError.message}`
          );
        } else {
          setHeroMessage(
            `Đã xóa Hero vị trí ${slide.position}.`
          );
        }
      } else {
        setHeroMessage(
          `Đã xóa Hero vị trí ${slide.position}.`
        );
      }

      await loadData();
    } catch (err) {
      setHeroError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi xóa Hero."
      );
    } finally {
      setHeroDeletingId(null);
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    if (files.length === 0) return;

    const newItems: UploadItem[] =
      files.map((file) => ({
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
      const combined = [
        ...current,
        ...newItems,
      ];

      if (
        combined.length > 0 &&
        !combined.some(
          (item) => item.isCover
        )
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
      const item = current.find(
        (x) => x.id === id
      );

      if (item) {
        URL.revokeObjectURL(item.preview);
      }

      const next = current.filter(
        (x) => x.id !== id
      );

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
        direction === "up"
          ? index - 1
          : index + 1;

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
              ...(status
                ? { status }
                : {}),
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
          process.env
            .NEXT_PUBLIC_SUPABASE_URL;

        const publishableKey =
          process.env
            .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

        if (
          !supabaseUrl ||
          !publishableKey
        ) {
          reject(
            new Error(
              "Thiếu cấu hình Supabase trong .env.local."
            )
          );
          return;
        }

        const xhr =
          new XMLHttpRequest();

        const encodedPath = path
          .split("/")
          .map((part) =>
            encodeURIComponent(part)
          )
          .join("/");

        const uploadUrl =
          `${supabaseUrl}/storage/v1/object/website-media/${encodedPath}`;

        xhr.open(
          "POST",
          uploadUrl,
          true
        );

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
          file.type ||
            "application/octet-stream"
        );

        xhr.upload.onprogress = (
          event
        ) => {
          if (
            !event.lengthComputable
          ) {
            return;
          }

          const progress =
            Math.round(
              (event.loaded /
                event.total) *
                100
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

          let errorMessage =
            "Upload thất bại.";

          try {
            const response =
              JSON.parse(
                xhr.responseText
              );

            if (response?.message) {
              errorMessage =
                response.message;
            } else if (
              response?.error
            ) {
              errorMessage =
                response.error;
            }
          } catch {
            if (xhr.responseText) {
              errorMessage =
                xhr.responseText;
            }
          }

          updateUploadProgress(
            uploadItemId,
            0,
            "error",
            errorMessage
          );

          reject(
            new Error(errorMessage)
          );
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

          reject(
            new Error(errorMessage)
          );
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

          reject(
            new Error(errorMessage)
          );
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

        reject(
          new Error(message)
        );
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
      setError(
        "Hãy chọn ít nhất một hình ảnh."
      );
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const bucket =
        "website-media";

      const entitySlug =
        entityType === "hotel"
          ? selectedHotel?.slug
          : `${selectedHotel?.slug}/${selectedRoom?.slug}`;

      if (!entitySlug) {
        throw new Error(
          "Không xác định được đối tượng hình ảnh."
        );
      }

      const existingMedia =
        currentMedia;

      const startingOrder =
        existingMedia.length > 0
          ? Math.max(
              ...existingMedia.map(
                (item) =>
                  item.sort_order
              )
            ) + 1
          : 0;

      let coverAlreadyExists =
        currentMedia.some(
          (item) =>
            item.is_cover &&
            item.status ===
              "active"
        );

      const uploadedRecords: Omit<
        Media,
        "id" | "created_at"
      >[] = [];

      let successfulUploads = 0;

      const failedUploads: string[] =
        [];

      for (
        let index = 0;
        index <
        uploadItems.length;
        index++
      ) {
        const item =
          uploadItems[index];

        const extension =
          item.file.name
            .split(".")
            .pop()
            ?.toLowerCase() ||
          "jpg";

        const safeName =
          item.file.name
            .replace(
              /\.[^/.]+$/,
              ""
            )
            .toLowerCase()
            .replace(
              /[^a-z0-9-_]+/g,
              "-"
            )
            .replace(
              /-+/g,
              "-"
            )
            .replace(
              /^-|-$/g,
              ""
            ) || "image";

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

          const {
            data: publicUrlData,
          } =
            supabase.storage
              .from(bucket)
              .getPublicUrl(path);

          const shouldBeCover =
            item.isCover &&
            !coverAlreadyExists;

          if (shouldBeCover) {
            coverAlreadyExists =
              true;
          }

          uploadedRecords.push({
            bucket,
            path,
            file_name:
              item.file.name,
            public_url:
              publicUrlData.publicUrl,
            entity_type:
              entityType,
            entity_id:
              currentEntityId,
            alt_vi:
              item.altVi || null,
            alt_en:
              item.altEn || null,
            is_cover:
              shouldBeCover,
            sort_order:
              startingOrder +
              index,
            status: "active",
          });

          successfulUploads++;
        } catch {
          failedUploads.push(
            item.file.name
          );
        }
      }

      if (
        uploadedRecords.length >
        0
      ) {
        const {
          error: insertError,
        } =
          await supabase
            .from("media")
            .insert(
              uploadedRecords
            );

        if (insertError) {
          for (const record of uploadedRecords) {
            await supabase.storage
              .from(bucket)
              .remove([
                record.path,
              ]);
          }

          throw new Error(
            `Không lưu được thông tin hình ảnh: ${insertError.message}`
          );
        }
      }

      if (
        successfulUploads ===
        uploadItems.length
      ) {
        setMessage(
          `Đã tải lên ${successfulUploads} hình ảnh thành công.`
        );
      } else if (
        successfulUploads > 0
      ) {
        setMessage(
          `Đã tải lên ${successfulUploads}/${uploadItems.length} hình ảnh.`
        );

        if (
          failedUploads.length >
          0
        ) {
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
        URL.revokeObjectURL(
          item.preview
        );
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

  async function setCover(
    mediaId: number
  ) {
    if (!currentEntityId) return;

    setError("");
    setMessage("");

    const { error: resetError } =
      await supabase
        .from("media")
        .update({
          is_cover: false,
        })
        .eq(
          "entity_type",
          entityType
        )
        .eq(
          "entity_id",
          currentEntityId
        );

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

    setMessage(
      "Đã cập nhật ảnh cover."
    );

    await loadData();
  }

  async function deleteMedia(
    item: Media
  ) {
    const confirmed =
      window.confirm(
        `Xóa hình ảnh "${item.file_name}"?\n\nHình ảnh sẽ bị xóa khỏi Storage và danh sách media.`
      );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const {
      error: storageError,
    } = await supabase.storage
      .from(item.bucket)
      .remove([item.path]);

    if (storageError) {
      setError(
        `Không xóa được file: ${storageError.message}`
      );
      return;
    }

    const {
      error: deleteError,
    } = await supabase
      .from("media")
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      setError(
        `Không xóa được dữ liệu media: ${deleteError.message}`
      );
      return;
    }

    setMessage(
      "Đã xóa hình ảnh."
    );

    await loadData();
  }

  async function toggleStatus(
    item: Media
  ) {
    const nextStatus =
      item.status === "active"
        ? "inactive"
        : "active";

    const { error } =
      await supabase
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
    const sortOrder =
      Number(value);

    if (
      !Number.isFinite(
        sortOrder
      )
    ) {
      return;
    }

    const { error } =
      await supabase
        .from("media")
        .update({
          sort_order:
            sortOrder,
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

    uploadItems.forEach(
      (item) => {
        URL.revokeObjectURL(
          item.preview
        );
      }
    );

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
          Quản lý Hero website, hình ảnh khách sạn và từng loại phòng.
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Quản lý Hero trang chủ
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tối đa 4 Hero. Chỉ nhận WebP, tối đa 300 KB và Max 1600 x 900.
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm">
            <span className="text-slate-500">
              Hero active:
            </span>{" "}
            <strong className="text-slate-900">
              {activeHeroCount}/{HERO_MAX_COUNT}
            </strong>
          </div>
        </div>

        {heroMessage && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {heroMessage}
          </div>
        )}

        {heroError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {heroError}
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <div className="grid gap-4 md:grid-cols-[180px_1fr_auto] md:items-end">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Vị trí
              </label>

              <select
                value={heroPosition}
                onChange={(event) =>
                  setHeroPosition(
                    event.target.value
                  )
                }
                disabled={heroUploading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
              >
                {[1, 2, 3, 4].map(
                  (position) => (
                    <option
                      key={position}
                      value={position}
                      disabled={heroSlides.some(
                        (slide) =>
                          slide.position ===
                          position
                      )}
                    >
                      Hero {position}
                      {heroSlides.some(
                        (slide) =>
                          slide.position ===
                          position
                      )
                        ? " — đã sử dụng"
                        : ""}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ảnh Hero mới
              </label>

              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border border-dashed px-4 py-3 text-sm ${
                  heroUploading
                    ? "cursor-not-allowed border-slate-200 bg-slate-100"
                    : "border-sky-300 bg-white hover:border-sky-500"
                }`}
              >
                <span className="min-w-0 truncate text-slate-600">
                  {heroFile
                    ? heroFile.name
                    : "Chọn file WebP — tối đa 300 KB"}
                </span>

                <span className="ml-3 shrink-0 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white">
                  Chọn ảnh
                </span>

                <input
                  type="file"
                  accept="image/webp,.webp"
                  disabled={heroUploading}
                  onChange={
                    handleHeroFileChange
                  }
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={uploadHero}
              disabled={
                heroUploading ||
                !heroFile ||
                heroSlides.length >= HERO_MAX_COUNT
              }
              className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {heroUploading
                ? "Đang tải..."
                : "Thêm Hero"}
            </button>
          </div>

          {heroPreview && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="relative aspect-video bg-slate-100">
                <img
                  src={heroPreview}
                  alt="Preview Hero"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="text-xs text-slate-500">
                  {heroFile
                    ? `${(
                        heroFile.size /
                        1024
                      ).toFixed(1)} KB`
                    : ""}
                </div>

                <button
                  type="button"
                  onClick={
                    clearHeroSelection
                  }
                  disabled={
                    heroUploading
                  }
                  className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Bỏ ảnh đã chọn
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Danh sách Hero
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Vị trí càng nhỏ sẽ được ưu tiên hiển thị trước.
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {sortedHeroSlides.length} / 4
            </span>
          </div>

          {heroLoading ? (
            <div className="rounded-xl bg-slate-50 py-12 text-center text-sm text-slate-500">
              Đang tải Hero...
            </div>
          ) : sortedHeroSlides.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
              <p className="text-sm font-medium text-slate-600">
                Chưa có Hero.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Thêm Hero đầu tiên ở khu vực phía trên.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedHeroSlides.map(
                (slide) => {
                  const draft =
                    heroDrafts[
                      slide.id
                    ] ?? {
                      titleVi: "",
                      titleEn: "",
                      descriptionVi:
                        "",
                      descriptionEn:
                        "",
                    };

                  const isSaving =
                    heroSavingId ===
                    slide.id;

                  const isDeleting =
                    heroDeletingId ===
                    slide.id;

                  return (
                    <div
                      key={slide.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    >
                      <div className="grid lg:grid-cols-[360px_1fr]">
                        <div className="relative aspect-video bg-slate-100 lg:aspect-auto">
                          <img
                            src={
                              slide.image_url
                            }
                            alt={
                              slide.title_vi ||
                              `Hero ${slide.position}`
                            }
                            className={`h-full w-full object-cover ${
                              slide.status ===
                              "inactive"
                                ? "opacity-40"
                                : ""
                            }`}
                          />

                          <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
                            HERO{" "}
                            {slide.position}
                          </div>

                          <div
                            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                              slide.status ===
                              "active"
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-700 text-white"
                            }`}
                          >
                            {slide.status ===
                            "active"
                              ? "ACTIVE"
                              : "INACTIVE"}
                          </div>
                        </div>

                        <div className="space-y-5 p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <h4 className="font-semibold text-slate-900">
                                Hero vị trí{" "}
                                {
                                  slide.position
                                }
                              </h4>

                              <p className="mt-1 text-xs text-slate-500">
                                {slide.storage_path}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <label className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                {isSaving
                                  ? "Đang xử lý..."
                                  : "Thay ảnh"}

                                <input
                                  type="file"
                                  accept="image/webp,.webp"
                                  disabled={
                                    isSaving ||
                                    isDeleting
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    handleHeroReplacement(
                                      slide,
                                      event
                                    )
                                  }
                                  className="hidden"
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() =>
                                  toggleHeroStatus(
                                    slide
                                  )
                                }
                                disabled={
                                  isSaving ||
                                  isDeleting
                                }
                                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                  slide.status ===
                                  "active"
                                    ? "bg-slate-100 text-slate-700"
                                    : "bg-emerald-50 text-emerald-700"
                                } disabled:opacity-50`}
                              >
                                {slide.status ===
                                "active"
                                  ? "Ẩn Hero"
                                  : "Hiện Hero"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteHero(
                                    slide
                                  )
                                }
                                disabled={
                                  isSaving ||
                                  isDeleting
                                }
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                {isDeleting
                                  ? "Đang xóa..."
                                  : "Xóa Hero"}
                              </button>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Vị trí
                              </label>

                              <select
                                value={
                                  slide.position
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateHeroPosition(
                                    slide,
                                    event
                                      .target
                                      .value
                                  )
                                }
                                disabled={
                                  isSaving ||
                                  isDeleting
                                }
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                              >
                                {[1, 2, 3, 4].map(
                                  (
                                    position
                                  ) => (
                                    <option
                                      key={
                                        position
                                      }
                                      value={
                                        position
                                      }
                                      disabled={
                                        heroSlides.some(
                                          (
                                            item
                                          ) =>
                                            item.id !==
                                              slide.id &&
                                            item.position ===
                                              position
                                        )
                                      }
                                    >
                                      {position}
                                      {heroSlides.some(
                                        (
                                          item
                                        ) =>
                                          item.id !==
                                            slide.id &&
                                          item.position ===
                                            position
                                      )
                                        ? " — đã dùng"
                                        : ""}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Trạng thái
                              </label>

                              <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                                {slide.status ===
                                "active"
                                  ? "Đang hiển thị trên website"
                                  : "Đang ẩn khỏi website"}
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Tiêu đề tiếng Việt
                              </label>

                              <input
                                value={
                                  draft.titleVi
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateHeroDraft(
                                    slide.id,
                                    "titleVi",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                disabled={
                                  isSaving ||
                                  isDeleting
                                }
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                                placeholder="Tiêu đề Hero"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Tiêu đề tiếng Anh
                              </label>

                              <input
                                value={
                                  draft.titleEn
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateHeroDraft(
                                    slide.id,
                                    "titleEn",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                disabled={
                                  isSaving ||
                                  isDeleting
                                }
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                                placeholder="Hero title"
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Mô tả tiếng Việt
                              </label>

                              <textarea
                                value={
                                  draft.descriptionVi
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateHeroDraft(
                                    slide.id,
                                    "descriptionVi",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                disabled={
                                  isSaving ||
                                  isDeleting
                                }
                                rows={4}
                                className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                                placeholder="Mô tả Hero"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Mô tả tiếng Anh
                              </label>

                              <textarea
                                value={
                                  draft.descriptionEn
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateHeroDraft(
                                    slide.id,
                                    "descriptionEn",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                disabled={
                                  isSaving ||
                                  isDeleting
                                }
                                rows={4}
                                className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                                placeholder="Hero description"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                            <div className="text-xs text-slate-500">
                              WebP · tối đa 300 KB · 16:9
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                saveHeroText(
                                  slide
                                )
                              }
                              disabled={
                                isSaving ||
                                isDeleting
                              }
                              className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              {isSaving
                                ? "Đang lưu..."
                                : "Lưu nội dung"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Đối tượng
            </label>

            <select
              value={entityType}
              onChange={(event) =>
                handleEntityTypeChange(
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
                handleHotelChange(
                  event.target.value
                )
              }
              disabled={uploading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
            >
              <option value="">
                -- Chọn khách sạn --
              </option>

              {hotels.map(
                (hotel) => (
                  <option
                    key={hotel.id}
                    value={hotel.id}
                  >
                    {hotel.name_vi}
                  </option>
                )
              )}
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
                  handleRoomChange(
                    event.target.value
                  )
                }
                disabled={
                  !hotelId ||
                  uploading
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none disabled:bg-slate-100 focus:border-sky-500"
              >
                <option value="">
                  {hotelId
                    ? "-- Chọn loại phòng --"
                    : "-- Chọn khách sạn trước --"}
                </option>

                {filteredRooms.map(
                  (room) => (
                    <option
                      key={room.id}
                      value={room.id}
                    >
                      {room.name_vi}
                    </option>
                  )
                )}
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

        {(selectedHotel ||
          selectedRoom) && (
          <div className="mt-4 rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
            Đang quản lý:{" "}
            <strong>
              {entityType ===
              "hotel"
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
              !currentEntityId ||
              uploading
                ? "cursor-not-allowed bg-slate-300"
                : "cursor-pointer bg-sky-600 hover:bg-sky-700"
            }`}
          >
            + Chọn hình ảnh

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              disabled={
                !currentEntityId ||
                uploading
              }
              onChange={
                handleFileChange
              }
              className="hidden"
            />
          </label>
        </div>

        {uploadItems.length > 0 && (
          <div className="mt-5 space-y-5">
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

                  {uploadingCount >
                    0 && (
                    <p className="text-xs text-sky-600">
                      {
                        uploadingCount
                      }{" "}
                      ảnh đang tải
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

            {uploadItems.map(
              (
                item,
                index
              ) => (
                <div
                  key={
                    item.id
                  }
                  className="overflow-hidden rounded-2xl border border-slate-200"
                >
                  <div className="grid md:grid-cols-[180px_1fr]">
                    <div className="relative h-44 bg-slate-100 md:h-full">
                      <img
                        src={
                          item.preview
                        }
                        alt={
                          item.file
                            .name
                        }
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
                            title={
                              item.file
                                .name
                            }
                          >
                            {
                              item.file
                                .name
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {(
                              item
                                .file
                                .size /
                              1024 /
                              1024
                            ).toFixed(
                              2
                            )}{" "}
                            MB
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getUploadStatusClass(
                            item.status
                          )}`}
                        >
                          {getUploadStatusText(
                            item
                          )}
                        </span>
                      </div>

                      <div>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-slate-500">
                            Tiến độ
                          </span>

                          <span className="font-semibold text-slate-700">
                            {
                              item.progress
                            }
                            %
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-200 ${
                              item.status ===
                              "error"
                                ? "bg-red-500"
                                : item.status ===
                                  "success"
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
                            {
                              item.error
                            }
                          </p>
                        )}
                      </div>

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
                            index ===
                              0 ||
                            uploading
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
                              uploadItems.length -
                                1 ||
                            uploading
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium disabled:opacity-40"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setUploadCover(
                              item.id
                            )
                          }
                          disabled={
                            uploading
                          }
                          className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                            item.isCover
                              ? "bg-amber-100 text-amber-700"
                              : "border border-slate-300 text-slate-700"
                          } disabled:opacity-50`}
                        >
                          {item.isCover
                            ? "Ảnh cover"
                            : "Đặt làm cover"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeUploadItem(
                              item.id
                            )
                          }
                          disabled={
                            uploading
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                        >
                          Xóa
                        </button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Alt tiếng Việt
                          </label>

                          <input
                            value={
                              item.altVi
                            }
                            onChange={(
                              event
                            ) =>
                              updateUploadItem(
                                item.id,
                                "altVi",
                                event
                                  .target
                                  .value
                              )
                            }
                            disabled={
                              uploading
                            }
                            placeholder="Mô tả hình ảnh"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Alt tiếng Anh
                          </label>

                          <input
                            value={
                              item.altEn
                            }
                            onChange={(
                              event
                            ) =>
                              updateUploadItem(
                                item.id,
                                "altEn",
                                event
                                  .target
                                  .value
                              )
                            }
                            disabled={
                              uploading
                            }
                            placeholder="Image description"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={
                  uploadImages
                }
                disabled={
                  uploading
                }
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
        ) : currentMedia.length ===
          0 ? (
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
            {currentMedia.map(
              (
                item,
                index
              ) => (
                <div
                  key={
                    item.id
                  }
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <img
                      src={
                        item.public_url
                      }
                      alt={
                        item.alt_vi ||
                        item.file_name
                      }
                      className={`h-full w-full object-cover ${
                        item.status ===
                        "inactive"
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
                        title={
                          item.file_name
                        }
                      >
                        {
                          item.file_name
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Thứ tự:{" "}
                        {
                          item.sort_order
                        }
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCover(
                            item.id
                          )
                        }
                        disabled={
                          item.is_cover
                        }
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        {item.is_cover
                          ? "Đang cover"
                          : "Đặt cover"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleStatus(
                            item
                          )
                        }
                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                          item.status ===
                          "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.status ===
                        "active"
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
                          onBlur={(
                            event
                          ) =>
                            updateSortOrder(
                              item,
                              event
                                .target
                                .value
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
                          {item.status ===
                          "active"
                            ? "Active"
                            : "Inactive"}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        deleteMedia(
                          item
                        )
                      }
                      className="w-full rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Xóa hình ảnh
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {(selectedHotel ||
        selectedRoom) && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={
              clearSelection
            }
            disabled={
              uploading
            }
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xóa lựa chọn
          </button>
        </div>
      )}
    </div>
  );
}
