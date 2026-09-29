"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";

type HotelStatus = "active" | "inactive";
type BusinessModel = "daily" | "monthly";
type OtaStatus = "active" | "inactive";

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string | null;
  address_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  image: string | null;
  status: HotelStatus;
  business_model: BusinessModel;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
  google_business_url: string | null;
  nearby_vi: string | null;
  nearby_en: string | null;
  owner_name_vi: string | null;
  owner_name_en: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_messaging: string | null;
};

type HotelForm = {
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string;
  address_en: string;
  description_vi: string;
  description_en: string;
  image: string;
  latitude: string;
  longitude: string;
  map_url: string;
  google_business_url: string;
  nearby_vi: string;
  nearby_en: string;
  owner_name_vi: string;
  owner_name_en: string;
  contact_phone: string;
  contact_email: string;
  contact_messaging: string;
  status: HotelStatus;
  business_model: BusinessModel;
};

type HotelAmenity = {
  id: number;
  hotel_id: number;
  name_vi: string;
  name_en: string;
  description_vi: string | null;
  description_en: string | null;
  icon: string | null;
  sort_order: number | null;
  status: string | null;
};

type OtaPlatform = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  status: OtaStatus;
  sort_order: number;
  created_at: string;
};

type HotelOtaChannel = {
  id: number;
  hotel_id: number;
  ota_id: number;
  listing_url: string;
  external_hotel_id: string | null;
  status: OtaStatus;
  sort_order: number;
  created_at: string;
};

type OtaForm = {
  ota_id: string;
  listing_url: string;
  external_hotel_id: string;
  status: OtaStatus;
  sort_order: string;
};

type OtaPlatformForm = {
  name: string;
  slug: string;
  website: string;
  status: OtaStatus;
  sort_order: string;
  logo: string | null;
};

const EMPTY_FORM: HotelForm = {
  slug: "",
  name_vi: "",
  name_en: "",
  address_vi: "",
  address_en: "",
  description_vi: "",
  description_en: "",
  image: "",
  latitude: "",
  longitude: "",
  map_url: "",
  google_business_url: "",
  nearby_vi: "",
  nearby_en: "",
  owner_name_vi: "",
  owner_name_en: "",
  contact_phone: "",
  contact_email: "",
  contact_messaging: "",
  status: "active",
  business_model: "daily",
};

const EMPTY_OTA_FORM: OtaForm = {
  ota_id: "",
  listing_url: "",
  external_hotel_id: "",
  status: "active",
  sort_order: "0",
};

const EMPTY_OTA_PLATFORM_FORM: OtaPlatformForm = {
  name: "",
  slug: "",
  website: "",
  status: "active",
  sort_order: "0",
  logo: null,
};

export default function KhachSanPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingHotelId, setEditingHotelId] = useState<number | null>(null);
  const [form, setForm] = useState<HotelForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [amenities, setAmenities] = useState<HotelAmenity[]>([]);
  const [loadingAmenities, setLoadingAmenities] = useState(false);

  const [otaPlatforms, setOtaPlatforms] = useState<OtaPlatform[]>([]);
  const [hotelOtas, setHotelOtas] = useState<HotelOtaChannel[]>([]);
  const [loadingOtas, setLoadingOtas] = useState(false);
  const [savingOta, setSavingOta] = useState(false);
  const [editingOtaId, setEditingOtaId] = useState<number | null>(null);
  const [otaForm, setOtaForm] = useState<OtaForm>(EMPTY_OTA_FORM);

  const [
    showOtaPlatformModal,
    setShowOtaPlatformModal,
  ] = useState(false);

  const [
    editingOtaPlatformId,
    setEditingOtaPlatformId,
  ] = useState<number | null>(null);

  const [
    otaPlatformForm,
    setOtaPlatformForm,
  ] = useState<OtaPlatformForm>(EMPTY_OTA_PLATFORM_FORM);

  const [
    otaPlatformFile,
    setOtaPlatformFile,
  ] = useState<File | null>(null);

  const [
    otaPlatformPreview,
    setOtaPlatformPreview,
  ] = useState<string | null>(null);

  const [
    savingOtaPlatform,
    setSavingOtaPlatform,
  ] = useState(false);

  const otaLogoInputRef = useRef<HTMLInputElement | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadHotels();
    loadOtaPlatforms();
  }, []);

  async function loadHotels() {
    setLoading(true);
    setError("");

    try {
      const { data, error: loadError } = await supabase
        .from("hotels")
        .select("*")
        .order("id", { ascending: true });

      if (loadError) {
        throw loadError;
      }

      const normalized: Hotel[] = (data || []).map((item: any) => ({
        ...item,
        status: item.status === "inactive" ? "inactive" : "active",
        business_model:
          item.business_model === "monthly" ? "monthly" : "daily",
        google_business_url: item.google_business_url || null,
      }));

      setHotels(normalized);
    } catch (err) {
      console.error("Load hotels error:", err);
      setError("Không thể tải danh sách khách sạn.");
    } finally {
      setLoading(false);
    }
  }

  async function loadOtaPlatforms() {
    try {
      const { data, error: loadError } = await supabase
        .from("ota_platforms")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

      if (loadError) {
        throw loadError;
      }

      setOtaPlatforms((data || []) as OtaPlatform[]);
    } catch (err) {
      console.error("Load OTA platforms error:", err);
      setError("Không thể tải danh sách OTA.");
    }
  }

  async function loadAmenities(hotelId: number) {
    setLoadingAmenities(true);

    try {
      const { data, error: loadError } = await supabase
        .from("hotel_amenities")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

      if (loadError) {
        throw loadError;
      }

      setAmenities((data || []) as HotelAmenity[]);
    } catch (err) {
      console.error("Load hotel amenities error:", err);
      setAmenities([]);
    } finally {
      setLoadingAmenities(false);
    }
  }

  async function loadHotelOtas(hotelId: number) {
    setLoadingOtas(true);

    try {
      const { data, error: loadError } = await supabase
        .from("hotel_ota_channels")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

      if (loadError) {
        throw loadError;
      }

      setHotelOtas((data || []) as HotelOtaChannel[]);
    } catch (err) {
      console.error("Load hotel OTAs error:", err);
      setHotelOtas([]);
    } finally {
      setLoadingOtas(false);
    }
  }

  function openCreateModal() {
    setEditingHotelId(null);
    setForm(EMPTY_FORM);
    setAmenities([]);
    setHotelOtas([]);
    setOtaForm(EMPTY_OTA_FORM);
    setEditingOtaId(null);
    setMessage("");
    setError("");
    setShowModal(true);
  }

  async function openEditModal(hotel: Hotel) {
    setEditingHotelId(hotel.id);

    setForm({
      slug: hotel.slug || "",
      name_vi: hotel.name_vi || "",
      name_en: hotel.name_en || "",
      address_vi: hotel.address_vi || "",
      address_en: hotel.address_en || "",
      description_vi: hotel.description_vi || "",
      description_en: hotel.description_en || "",
      image: hotel.image || "",
      latitude:
        hotel.latitude === null || hotel.latitude === undefined
          ? ""
          : String(hotel.latitude),
      longitude:
        hotel.longitude === null || hotel.longitude === undefined
          ? ""
          : String(hotel.longitude),
      map_url: hotel.map_url || "",
      google_business_url: hotel.google_business_url || "",
      nearby_vi: hotel.nearby_vi || "",
      nearby_en: hotel.nearby_en || "",
      owner_name_vi: hotel.owner_name_vi || "",
      owner_name_en: hotel.owner_name_en || "",
      contact_phone: hotel.contact_phone || "",
      contact_email: hotel.contact_email || "",
      contact_messaging: hotel.contact_messaging || "",
      status: hotel.status === "inactive" ? "inactive" : "active",
      business_model:
        hotel.business_model === "monthly" ? "monthly" : "daily",
    });

    setAmenities([]);
    setHotelOtas([]);
    setOtaForm(EMPTY_OTA_FORM);
    setEditingOtaId(null);
    setMessage("");
    setError("");
    setShowModal(true);

    await Promise.all([
      loadAmenities(hotel.id),
      loadHotelOtas(hotel.id),
    ]);
  }

  function closeModal() {
    if (saving || savingOta || savingOtaPlatform) {
      return;
    }

    setShowModal(false);
    setEditingHotelId(null);
    setForm(EMPTY_FORM);
    setAmenities([]);
    setHotelOtas([]);
    setOtaForm(EMPTY_OTA_FORM);
    setEditingOtaId(null);
    setMessage("");
    setError("");
  }

  function updateField<K extends keyof HotelForm>(
    field: K,
    value: HotelForm[K]
  ) {
    setForm(function (previous) {
      return {
        ...previous,
        [field]: value,
      };
    });
  }

  function updateOtaField<K extends keyof OtaForm>(
    field: K,
    value: OtaForm[K]
  ) {
    setOtaForm(function (previous) {
      return {
        ...previous,
        [field]: value,
      };
    });
  }

  function updateOtaPlatformField<K extends keyof OtaPlatformForm>(
    field: K,
    value: OtaPlatformForm[K]
  ) {
    setOtaPlatformForm(function (previous) {
      return {
        ...previous,
        [field]: value,
      };
    });
  }

  function getOtaName(otaId: number) {
    const ota = otaPlatforms.find(function (item) {
      return item.id === otaId;
    });

    return ota ? ota.name : "OTA không xác định";
  }

  async function handleSave() {
    setMessage("");
    setError("");

    if (!form.name_vi.trim()) {
      setError("Vui lòng nhập tên khách sạn tiếng Việt.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Vui lòng nhập slug.");
      return;
    }

    if (!form.business_model) {
      setError("Vui lòng chọn mô hình kinh doanh.");
      return;
    }

    let latitude: number | null = null;
    let longitude: number | null = null;

    if (form.latitude.trim()) {
      const parsedLatitude = Number(form.latitude);

      if (!Number.isFinite(parsedLatitude)) {
        setError("Vĩ độ không hợp lệ.");
        return;
      }

      latitude = parsedLatitude;
    }

    if (form.longitude.trim()) {
      const parsedLongitude = Number(form.longitude);

      if (!Number.isFinite(parsedLongitude)) {
        setError("Kinh độ không hợp lệ.");
        return;
      }

      longitude = parsedLongitude;
    }

    if (form.google_business_url.trim()) {
      try {
        new URL(form.google_business_url.trim());
      } catch {
        setError("Đường dẫn Google Business Profile không hợp lệ.");
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        slug: form.slug.trim(),
        name_vi: form.name_vi.trim(),
        name_en: form.name_en.trim(),
        address_vi: form.address_vi.trim() || null,
        address_en: form.address_en.trim() || null,
        description_vi: form.description_vi.trim() || null,
        description_en: form.description_en.trim() || null,
        image: form.image.trim() || null,
        latitude: latitude,
        longitude: longitude,
        map_url: form.map_url.trim() || null,
        google_business_url:
          form.google_business_url.trim() || null,
        nearby_vi: form.nearby_vi.trim() || null,
        nearby_en: form.nearby_en.trim() || null,
        owner_name_vi: form.owner_name_vi.trim() || null,
        owner_name_en: form.owner_name_en.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
        contact_email: form.contact_email.trim() || null,
        contact_messaging: form.contact_messaging.trim() || null,
        status: form.status,
        business_model: form.business_model,
      };

      if (editingHotelId === null) {
        const { error: insertError } = await supabase
          .from("hotels")
          .insert(payload);

        if (insertError) {
          throw insertError;
        }

        setMessage("Đã thêm khách sạn.");
      } else {
        const { error: updateError } = await supabase
          .from("hotels")
          .update(payload)
          .eq("id", editingHotelId);

        if (updateError) {
          throw updateError;
        }

        setMessage("Đã cập nhật khách sạn.");
      }

      await loadHotels();

      window.setTimeout(function () {
        closeModal();
      }, 500);
    } catch (err: any) {
      console.error("Save hotel error:", err);

      if (err && err.code === "23505") {
        setError("Slug khách sạn đã tồn tại. Vui lòng chọn slug khác.");
      } else {
        setError(
          err && err.message
            ? err.message
            : "Không thể lưu thông tin khách sạn."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  function resetOtaForm() {
    setOtaForm(EMPTY_OTA_FORM);
    setEditingOtaId(null);
  }

  function startEditOta(ota: HotelOtaChannel) {
    setEditingOtaId(ota.id);

    setOtaForm({
      ota_id: String(ota.ota_id),
      listing_url: ota.listing_url || "",
      external_hotel_id: ota.external_hotel_id || "",
      status: ota.status === "inactive" ? "inactive" : "active",
      sort_order: String(ota.sort_order ?? 0),
    });
  }

  async function handleSaveOta() {
    setMessage("");
    setError("");

    if (editingHotelId === null) {
      setError("Vui lòng lưu khách sạn trước khi thêm OTA.");
      return;
    }

    const otaId = Number(otaForm.ota_id);

    if (!otaId || !Number.isFinite(otaId)) {
      setError("Vui lòng chọn OTA.");
      return;
    }

    if (!otaForm.listing_url.trim()) {
      setError("Vui lòng nhập đường dẫn trang khách sạn trên OTA.");
      return;
    }

    try {
      new URL(otaForm.listing_url.trim());
    } catch {
      setError("Đường dẫn OTA không hợp lệ.");
      return;
    }

    const sortOrder = Number(otaForm.sort_order);

    if (!Number.isFinite(sortOrder)) {
      setError("Thứ tự OTA không hợp lệ.");
      return;
    }

    const duplicate = hotelOtas.find(function (item) {
      return (
        item.ota_id === otaId &&
        item.id !== editingOtaId
      );
    });

    if (duplicate) {
      setError(
        getOtaName(otaId) +
          " đã có trong danh sách OTA đang bán của khách sạn này."
      );
      return;
    }

    setSavingOta(true);

    try {
      const payload = {
        hotel_id: editingHotelId,
        ota_id: otaId,
        listing_url: otaForm.listing_url.trim(),
        external_hotel_id:
          otaForm.external_hotel_id.trim() || null,
        status: otaForm.status,
        sort_order: sortOrder,
      };

      if (editingOtaId === null) {
        const { data, error: insertError } = await supabase
          .from("hotel_ota_channels")
          .insert(payload)
          .select("*")
          .single();

        if (insertError) {
          throw insertError;
        }

        setHotelOtas(function (previous) {
          return [...previous, data as HotelOtaChannel].sort(
            function (a, b) {
              if (a.sort_order !== b.sort_order) {
                return a.sort_order - b.sort_order;
              }

              return a.id - b.id;
            }
          );
        });

        setMessage(
          "Đã thêm " + getOtaName(otaId) + " vào OTA đang bán."
        );
      } else {
        const { data, error: updateError } = await supabase
          .from("hotel_ota_channels")
          .update(payload)
          .eq("id", editingOtaId)
          .select("*")
          .single();

        if (updateError) {
          throw updateError;
        }

        setHotelOtas(function (previous) {
          return previous
            .map(function (item) {
              return item.id === editingOtaId
                ? (data as HotelOtaChannel)
                : item;
            })
            .sort(function (a, b) {
              if (a.sort_order !== b.sort_order) {
                return a.sort_order - b.sort_order;
              }

              return a.id - b.id;
            });
        });

        setMessage("Đã cập nhật " + getOtaName(otaId) + ".");
      }

      resetOtaForm();
    } catch (err: any) {
      console.error("Save hotel OTA error:", err);

      if (err && err.code === "23505") {
        setError(
          getOtaName(otaId) +
            " đã được thêm vào khách sạn này."
        );
      } else {
        setError(
          err && err.message
            ? err.message
            : "Không thể lưu OTA cho khách sạn."
        );
      }
    } finally {
      setSavingOta(false);
    }
  }

  async function handleDeleteOta(ota: HotelOtaChannel) {
    const confirmed = window.confirm(
      'Bạn có chắc muốn xóa "' +
        getOtaName(ota.ota_id) +
        '" khỏi danh sách OTA đang bán không?'
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("hotel_ota_channels")
        .delete()
        .eq("id", ota.id);

      if (deleteError) {
        throw deleteError;
      }

      setHotelOtas(function (previous) {
        return previous.filter(function (item) {
          return item.id !== ota.id;
        });
      });

      if (editingOtaId === ota.id) {
        resetOtaForm();
      }

      setMessage("Đã xóa " + getOtaName(ota.ota_id) + ".");
    } catch (err: any) {
      console.error("Delete hotel OTA error:", err);

      setError(
        err && err.message
          ? err.message
          : "Không thể xóa OTA."
      );
    }
  }

  async function handleDelete(hotel: Hotel) {
    const confirmed = window.confirm(
      'Bạn có chắc muốn xóa khách sạn "' +
        hotel.name_vi +
        '" không?'
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("hotels")
        .delete()
        .eq("id", hotel.id);

      if (deleteError) {
        throw deleteError;
      }

      setHotels(function (previous) {
        return previous.filter(function (item) {
          return item.id !== hotel.id;
        });
      });

      setMessage("Đã xóa khách sạn " + hotel.name_vi + ".");
    } catch (err: any) {
      console.error("Delete hotel error:", err);

      setError(
        err && err.message
          ? err.message
          : "Không thể xóa khách sạn."
      );
    }
  }

  function openCreateOtaPlatformModal() {
    setEditingOtaPlatformId(null);
    setOtaPlatformForm(EMPTY_OTA_PLATFORM_FORM);
    setOtaPlatformFile(null);
    setOtaPlatformPreview(null);
    setMessage("");
    setError("");

    if (otaLogoInputRef.current) {
      otaLogoInputRef.current.value = "";
    }

    setShowOtaPlatformModal(true);
  }

  function openEditOtaPlatformModal(ota: OtaPlatform) {
    setEditingOtaPlatformId(ota.id);

    setOtaPlatformForm({
      name: ota.name || "",
      slug: ota.slug || "",
      website: ota.website || "",
      status: ota.status === "inactive" ? "inactive" : "active",
      sort_order: String(ota.sort_order ?? 0),
      logo: ota.logo || null,
    });

    setOtaPlatformFile(null);
    setOtaPlatformPreview(ota.logo || null);
    setMessage("");
    setError("");

    if (otaLogoInputRef.current) {
      otaLogoInputRef.current.value = "";
    }

    setShowOtaPlatformModal(true);
  }

  function closeOtaPlatformModal() {
    if (savingOtaPlatform) {
      return;
    }

    setShowOtaPlatformModal(false);
    setEditingOtaPlatformId(null);
    setOtaPlatformForm(EMPTY_OTA_PLATFORM_FORM);
    setOtaPlatformFile(null);
    setOtaPlatformPreview(null);

    if (otaLogoInputRef.current) {
      otaLogoInputRef.current.value = "";
    }
  }

  function slugify(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleOtaPlatformNameChange(value: string) {
    setOtaPlatformForm(function (previous) {
      return {
        ...previous,
        name: value,
        slug:
          editingOtaPlatformId === null
            ? slugify(value)
            : previous.slug,
      };
    });
  }

  function handleOtaLogoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Logo OTA phải là file hình ảnh.");
      event.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Logo OTA không được lớn hơn 2MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setOtaPlatformFile(file);

    const previewUrl = URL.createObjectURL(file);
    setOtaPlatformPreview(previewUrl);
  }

  function getStoragePathFromPublicUrl(url: string | null) {
    if (!url) {
      return null;
    }

    const marker = "/storage/v1/object/public/website-media/";

    const markerIndex = url.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(
      url.substring(markerIndex + marker.length)
    );
  }

  async function uploadOtaLogo(
    file: File,
    slug: string
  ) {
    const extensionFromName = file.name.includes(".")
      ? file.name.split(".").pop()?.toLowerCase()
      : "";

    const extension =
      extensionFromName ||
      (file.type === "image/svg+xml"
        ? "svg"
        : file.type === "image/webp"
        ? "webp"
        : file.type === "image/png"
        ? "png"
        : "jpg");

    const safeSlug = slugify(slug) || "ota";
    const fileName =
      safeSlug +
      "-" +
      Date.now() +
      "-" +
      Math.random().toString(36).slice(2, 8) +
      "." +
      extension;

    const storagePath = "ota/" + fileName;

    const { error: uploadError } = await supabase.storage
      .from("website-media")
      .upload(storagePath, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("website-media")
      .getPublicUrl(storagePath);

    if (!data.publicUrl) {
      throw new Error("Không lấy được Public URL của logo OTA.");
    }

    return data.publicUrl;
  }

  async function deleteOtaLogoByUrl(url: string | null) {
    const storagePath = getStoragePathFromPublicUrl(url);

    if (!storagePath) {
      return;
    }

    const { error: deleteError } = await supabase.storage
      .from("website-media")
      .remove([storagePath]);

    if (deleteError) {
      console.warn(
        "Không thể xóa logo cũ khỏi Storage:",
        deleteError
      );
    }
  }

  async function handleSaveOtaPlatform() {
    setMessage("");
    setError("");

    const name = otaPlatformForm.name.trim();
    const slug = slugify(otaPlatformForm.slug);

    if (!name) {
      setError("Vui lòng nhập tên OTA.");
      return;
    }

    if (!slug) {
      setError("Vui lòng nhập slug OTA.");
      return;
    }

    const sortOrder = Number(otaPlatformForm.sort_order);

    if (!Number.isFinite(sortOrder)) {
      setError("Thứ tự OTA không hợp lệ.");
      return;
    }

    const website = otaPlatformForm.website.trim();

    if (website) {
      try {
        new URL(website);
      } catch {
        setError("Website OTA không hợp lệ.");
        return;
      }
    }

    const duplicate = otaPlatforms.find(function (item) {
      return (
        item.slug.toLowerCase() === slug.toLowerCase() &&
        item.id !== editingOtaPlatformId
      );
    });

    if (duplicate) {
      setError("Slug OTA này đã tồn tại.");
      return;
    }

    setSavingOtaPlatform(true);

    try {
      let logoUrl = otaPlatformForm.logo;

      if (otaPlatformFile) {
        logoUrl = await uploadOtaLogo(
          otaPlatformFile,
          slug
        );
      }

      const payload = {
        name,
        slug,
        website: website || null,
        status: otaPlatformForm.status,
        sort_order: sortOrder,
        logo: logoUrl || null,
      };

      let savedPlatform: OtaPlatform;

      if (editingOtaPlatformId === null) {
        const { data, error: insertError } = await supabase
          .from("ota_platforms")
          .insert(payload)
          .select("*")
          .single();

        if (insertError) {
          throw insertError;
        }

        savedPlatform = data as OtaPlatform;

        setMessage("Đã thêm nền tảng " + name + ".");
      } else {
        const oldPlatform = otaPlatforms.find(function (item) {
          return item.id === editingOtaPlatformId;
        });

        const { data, error: updateError } = await supabase
          .from("ota_platforms")
          .update(payload)
          .eq("id", editingOtaPlatformId)
          .select("*")
          .single();

        if (updateError) {
          throw updateError;
        }

        savedPlatform = data as OtaPlatform;

        if (
          otaPlatformFile &&
          oldPlatform &&
          oldPlatform.logo &&
          oldPlatform.logo !== logoUrl
        ) {
          await deleteOtaLogoByUrl(oldPlatform.logo);
        }

        setMessage("Đã cập nhật nền tảng " + name + ".");
      }

      setOtaPlatforms(function (previous) {
        const withoutCurrent = previous.filter(function (item) {
          return item.id !== savedPlatform.id;
        });

        return [...withoutCurrent, savedPlatform].sort(
          function (a, b) {
            if (a.sort_order !== b.sort_order) {
              return a.sort_order - b.sort_order;
            }

            return a.id - b.id;
          }
        );
      });

      closeOtaPlatformModal();
    } catch (err: any) {
      console.error("Save OTA platform error:", err);

      if (err && err.code === "23505") {
        setError("Tên hoặc slug OTA đã tồn tại.");
      } else {
        setError(
          err && err.message
            ? err.message
            : "Không thể lưu nền tảng OTA."
        );
      }
    } finally {
      setSavingOtaPlatform(false);
    }
  }

  async function handleDeleteOtaPlatform(ota: OtaPlatform) {
    const usedChannels = await supabase
      .from("hotel_ota_channels")
      .select("id", { count: "exact", head: true })
      .eq("ota_id", ota.id);

    if (usedChannels.error) {
      setError(
        usedChannels.error.message ||
          "Không thể kiểm tra OTA đang được sử dụng."
      );
      return;
    }

    const usageCount = usedChannels.count || 0;

    if (usageCount > 0) {
      setError(
        ota.name +
          " đang được sử dụng bởi " +
          usageCount +
          " cấu hình OTA của khách sạn. Hãy xóa các liên kết đó trước khi xóa nền tảng."
      );
      return;
    }

    const confirmed = window.confirm(
      'Bạn có chắc muốn xóa nền tảng OTA "' +
        ota.name +
        '" không?'
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("ota_platforms")
        .delete()
        .eq("id", ota.id);

      if (deleteError) {
        throw deleteError;
      }

      await deleteOtaLogoByUrl(ota.logo);

      setOtaPlatforms(function (previous) {
        return previous.filter(function (item) {
          return item.id !== ota.id;
        });
      });

      setMessage("Đã xóa nền tảng " + ota.name + ".");
    } catch (err: any) {
      console.error("Delete OTA platform error:", err);

      setError(
        err && err.message
          ? err.message
          : "Không thể xóa nền tảng OTA."
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Danh sách khách sạn
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Quản lý thông tin khách sạn, tiện nghi và OTA đang bán.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Thêm khách sạn
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full">
              <thead className="bg-slate-100">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Khách sạn
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Slug
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Địa chỉ
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Mô hình
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Trạng thái
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      Đang tải danh sách khách sạn...
                    </td>
                  </tr>
                ) : hotels.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      Chưa có khách sạn nào.
                    </td>
                  </tr>
                ) : (
                  hotels.map(function (hotel) {
                    return (
                      <tr
                        key={hotel.id}
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900">
                            {hotel.name_vi}
                          </div>

                          {hotel.name_en && (
                            <div className="mt-1 text-sm text-slate-500">
                              {hotel.name_en}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                            {hotel.slug}
                          </span>
                        </td>

                        <td className="max-w-[280px] px-4 py-4 text-sm text-slate-600">
                          {hotel.address_vi || "—"}
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {hotel.business_model === "monthly"
                              ? "Theo tháng"
                              : "Theo ngày"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {hotel.status === "active" ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              Đang hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              Tạm ngưng
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={function () {
                                openEditModal(hotel);
                              }}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Sửa
                            </button>

                            <button
                              type="button"
                              onClick={function () {
                                handleDelete(hotel);
                              }}
                              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Quản lý nền tảng OTA
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Quản lý logo, tên, website và trạng thái các nền tảng OTA dùng chung cho toàn hệ thống.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateOtaPlatformModal}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              + Thêm nền tảng OTA
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Logo
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    OTA
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Website
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Trạng thái
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Thứ tự
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {otaPlatforms.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      Chưa có nền tảng OTA nào.
                    </td>
                  </tr>
                ) : (
                  otaPlatforms.map(function (ota) {
                    return (
                      <tr
                        key={ota.id}
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          {ota.logo ? (
                            <div className="flex h-12 w-20 items-center justify-center rounded-lg border border-slate-200 bg-white p-2">
                              <img
                                src={ota.logo}
                                alt={ota.name}
                                className="max-h-8 max-w-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-20 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                              Chưa có logo
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {ota.name}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {ota.slug}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {ota.website ? (
                            <a
                              href={ota.website}
                              target="_blank"
                              rel="noreferrer"
                              className="break-all text-sm text-blue-600 hover:underline"
                            >
                              {ota.website}
                            </a>
                          ) : (
                            <span className="text-sm text-slate-400">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {ota.status === "active" ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              Đang hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              Tạm ngưng
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {ota.sort_order}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={function () {
                                openEditOtaPlatformModal(ota);
                              }}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Sửa
                            </button>

                            <button
                              type="button"
                              onClick={function () {
                                handleDeleteOtaPlatform(ota);
                              }}
                              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 md:p-6">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingHotelId === null
                    ? "Thêm khách sạn"
                    : "Chỉnh sửa khách sạn"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingHotelId === null
                    ? "Nhập thông tin khách sạn mới."
                    : "Cập nhật thông tin khách sạn."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving || savingOta}
                className="rounded-lg p-2 text-xl text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              {message && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <section>
                  <h3 className="mb-4 text-base font-bold text-slate-900">
                    1. Thông tin cơ bản
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Tên khách sạn tiếng Việt *
                      </label>

                      <input
                        value={form.name_vi}
                        onChange={function (event) {
                          updateField("name_vi", event.target.value);
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Khách sạn Anh Kim"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Tên khách sạn tiếng Anh
                      </label>

                      <input
                        value={form.name_en}
                        onChange={function (event) {
                          updateField("name_en", event.target.value);
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Anh Kim Hotel"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Slug *
                      </label>

                      <input
                        value={form.slug}
                        onChange={function (event) {
                          updateField("slug", event.target.value);
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="anh-kim-hotel"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Mô hình kinh doanh *
                      </label>

                      <select
                        value={form.business_model}
                        onChange={function (event) {
                          updateField(
                            "business_model",
                            event.target.value as BusinessModel
                          );
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="daily">Theo ngày</option>
                        <option value="monthly">Theo tháng</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Trạng thái
                      </label>

                      <select
                        value={form.status}
                        onChange={function (event) {
                          updateField(
                            "status",
                            event.target.value as HotelStatus
                          );
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="active">
                          Đang hoạt động
                        </option>

                        <option value="inactive">
                          Tạm ngưng
                        </option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="border-t border-slate-200 pt-6">
                  <h3 className="mb-4 text-base font-bold text-slate-900">
                    2. Thông tin liên hệ
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Tên chủ khách sạn tiếng Việt
                      </label>

                      <input
                        value={form.owner_name_vi}
                        onChange={function (event) {
                          updateField(
                            "owner_name_vi",
                            event.target.value
                          );
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Tên chủ khách sạn tiếng Anh
                      </label>

                      <input
                        value={form.owner_name_en}
                        onChange={function (event) {
                          updateField(
                            "owner_name_en",
                            event.target.value
                          );
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Số điện thoại
                      </label>

                      <input
                        value={form.contact_phone}
                        onChange={function (event) {
                          updateField(
                            "contact_phone",
                            event.target.value
                          );
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Email
                      </label>

                      <input
                        type="email"
                        value={form.contact_email}
                        onChange={function (event) {
                          updateField(
                            "contact_email",
                            event.target.value
                          );
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Kênh liên lạc khác
                      </label>

                      <input
                        value={form.contact_messaging}
                        onChange={function (event) {
                          updateField(
                            "contact_messaging",
                            event.target.value
                          );
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Zalo, Messenger..."
                      />
                    </div>
                  </div>
                </section>

                <section className="border-t border-slate-200 pt-6">
                  <h3 className="mb-4 text-base font-bold text-slate-900">
                    3. Địa chỉ & vị trí
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Địa chỉ tiếng Việt
                      </label>

                      <textarea
                        value={form.address_vi}
                        onChange={function (event) {
                          updateField(
                            "address_vi",
                            event.target.value
                          );
                        }}
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Địa chỉ tiếng Anh
                      </label>

                      <textarea
                        value={form.address_en}
                        onChange={function (event) {
                          updateField(
                            "address_en",
                            event.target.value
                          );
                        }}
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Vĩ độ
                      </label>

                      <input
                        value={form.latitude}
                        onChange={function (event) {
                          updateField(
                            "latitude",
                            event.target.value
                          );
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="10.759"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Kinh độ
                      </label>

                      <input
                        value={form.longitude}
                        onChange={function (event) {
                          updateField(
                            "longitude",
                            event.target.value
                          );
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="106.695"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Google Maps URL
                      </label>

                      <input
                        value={form.map_url}
                        onChange={function (event) {
                          updateField(
                            "map_url",
                            event.target.value
                          );
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="https://maps.google.com/..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Google Business Profile
                      </label>

                      <input
                        type="url"
                        value={form.google_business_url}
                        onChange={function (event) {
                          updateField(
                            "google_business_url",
                            event.target.value
                          );
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="https://www.google.com/maps/place/..."
                      />

                      <p className="mt-1.5 text-xs text-slate-500">
                        Nhập đường dẫn Google Business Profile của đúng khách sạn. Khách sẽ được chuyển sang Google để xem thông tin và đánh giá.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="border-t border-slate-200 pt-6">
                  <h3 className="mb-4 text-base font-bold text-slate-900">
                    4. Mô tả
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Mô tả tiếng Việt
                      </label>

                      <textarea
                        value={form.description_vi}
                        onChange={function (event) {
                          updateField(
                            "description_vi",
                            event.target.value
                          );
                        }}
                        rows={5}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Mô tả tiếng Anh
                      </label>

                      <textarea
                        value={form.description_en}
                        onChange={function (event) {
                          updateField(
                            "description_en",
                            event.target.value
                          );
                        }}
                        rows={5}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </section>

                <section className="border-t border-slate-200 pt-6">
                  <h3 className="mb-4 text-base font-bold text-slate-900">
                    5. Địa điểm lân cận
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Tiếng Việt
                      </label>

                      <textarea
                        value={form.nearby_vi}
                        onChange={function (event) {
                          updateField(
                            "nearby_vi",
                            event.target.value
                          );
                        }}
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Chợ Bến Thành, phố đi bộ Nguyễn Huệ..."
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Tiếng Anh
                      </label>

                      <textarea
                        value={form.nearby_en}
                        onChange={function (event) {
                          updateField(
                            "nearby_en",
                            event.target.value
                          );
                        }}
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Ben Thanh Market, Nguyen Hue Walking Street..."
                      />
                    </div>
                  </div>
                </section>

                <section className="border-t border-slate-200 pt-6">
                  <h3 className="mb-4 text-base font-bold text-slate-900">
                    6. Hình ảnh
                  </h3>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      URL hình ảnh đại diện
                    </label>

                    <input
                      value={form.image}
                      onChange={function (event) {
                        updateField(
                          "image",
                          event.target.value
                        );
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="https://..."
                    />
                  </div>
                </section>

                <section className="border-t border-slate-200 pt-6">
                  <h3 className="mb-4 text-base font-bold text-slate-900">
                    7. Tiện nghi khách sạn
                  </h3>

                  {editingHotelId === null ? (
                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                      Sau khi tạo khách sạn, các tiện nghi được gắn riêng cho từng khách sạn sẽ hiển thị tại đây.
                    </div>
                  ) : loadingAmenities ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                      Đang tải tiện nghi...
                    </div>
                  ) : amenities.length === 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                      Khách sạn này chưa được gắn tiện nghi nào.
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {amenities.map(function (amenity) {
                        return (
                          <div
                            key={amenity.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="flex items-start gap-3">
                              {amenity.icon && (
                                <span className="text-xl">
                                  {amenity.icon}
                                </span>
                              )}

                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800">
                                  {amenity.name_vi}
                                </div>

                                {amenity.name_en && (
                                  <div className="mt-0.5 text-xs text-slate-500">
                                    {amenity.name_en}
                                  </div>
                                )}

                                {amenity.description_vi && (
                                  <div className="mt-2 text-sm text-slate-600">
                                    {amenity.description_vi}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="border-t border-slate-200 pt-6">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        8. OTA đang bán
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Các nền tảng OTA mà khách sạn này đang bán phòng.
                      </p>
                    </div>
                  </div>

                  {editingHotelId === null ? (
                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                      Hãy lưu khách sạn trước. Sau đó mở lại khách sạn để thêm các OTA đang bán.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                              OTA
                            </label>

                            <select
                              value={otaForm.ota_id}
                              onChange={function (event) {
                                updateOtaField(
                                  "ota_id",
                                  event.target.value
                                );
                              }}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="">
                                Chọn OTA
                              </option>

                              {otaPlatforms
                                .filter(function (ota) {
                                  return ota.status === "active";
                                })
                                .map(function (ota) {
                                  return (
                                    <option
                                      key={ota.id}
                                      value={String(ota.id)}
                                    >
                                      {ota.name}
                                    </option>
                                  );
                                })}
                            </select>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                              Trạng thái
                            </label>

                            <select
                              value={otaForm.status}
                              onChange={function (event) {
                                updateOtaField(
                                  "status",
                                  event.target.value as OtaStatus
                                );
                              }}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="active">
                                Đang bán
                              </option>

                              <option value="inactive">
                                Tạm ngưng
                              </option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                              Link trang khách sạn trên OTA *
                            </label>

                            <input
                              value={otaForm.listing_url}
                              onChange={function (event) {
                                updateOtaField(
                                  "listing_url",
                                  event.target.value
                                );
                              }}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              placeholder="https://www.booking.com/hotel/..."
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                              Hotel ID trên OTA
                            </label>

                            <input
                              value={otaForm.external_hotel_id}
                              onChange={function (event) {
                                updateOtaField(
                                  "external_hotel_id",
                                  event.target.value
                                );
                              }}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              placeholder="Nếu OTA có mã khách sạn"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                              Thứ tự
                            </label>

                            <input
                              type="number"
                              value={otaForm.sort_order}
                              onChange={function (event) {
                                updateOtaField(
                                  "sort_order",
                                  event.target.value
                                );
                              }}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={handleSaveOta}
                            disabled={savingOta}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingOta
                              ? "Đang lưu..."
                              : editingOtaId === null
                              ? "Thêm OTA"
                              : "Lưu thay đổi"}
                          </button>

                          {editingOtaId !== null && (
                            <button
                              type="button"
                              onClick={resetOtaForm}
                              disabled={savingOta}
                              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Hủy sửa
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        {loadingOtas ? (
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                            Đang tải OTA đang bán...
                          </div>
                        ) : hotelOtas.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                            Khách sạn này chưa có OTA đang bán.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {hotelOtas.map(function (ota) {
                              return (
                                <div
                                  key={ota.id}
                                  className="rounded-xl border border-slate-200 bg-white p-4"
                                >
                                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        {otaPlatforms.find(
                                          function (platform) {
                                            return (
                                              platform.id ===
                                              ota.ota_id
                                            );
                                          }
                                        )?.logo && (
                                          <img
                                            src={
                                              otaPlatforms.find(
                                                function (platform) {
                                                  return (
                                                    platform.id ===
                                                    ota.ota_id
                                                  );
                                                }
                                              )?.logo || ""
                                            }
                                            alt=""
                                            className="h-6 w-auto max-w-20 object-contain"
                                          />
                                        )}

                                        <h4 className="font-semibold text-slate-900">
                                          {getOtaName(ota.ota_id)}
                                        </h4>

                                        {ota.status === "active" ? (
                                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                                            Đang bán
                                          </span>
                                        ) : (
                                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                            Tạm ngưng
                                          </span>
                                        )}
                                      </div>

                                      <div className="mt-2 break-all text-sm text-blue-600">
                                        {ota.listing_url}
                                      </div>

                                      {ota.external_hotel_id && (
                                        <div className="mt-2 text-xs text-slate-500">
                                          Hotel ID:{" "}
                                          {ota.external_hotel_id}
                                        </div>
                                      )}

                                      <div className="mt-1 text-xs text-slate-400">
                                        Thứ tự: {ota.sort_order}
                                      </div>
                                    </div>

                                    <div className="flex shrink-0 gap-2">
                                      <button
                                        type="button"
                                        onClick={function () {
                                          startEditOta(ota);
                                        }}
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                      >
                                        Sửa
                                      </button>

                                      <button
                                        type="button"
                                        onClick={function () {
                                          handleDeleteOta(ota);
                                        }}
                                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                      >
                                        Xóa
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving || savingOta}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || savingOta}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Đang lưu..."
                  : editingHotelId === null
                  ? "Thêm khách sạn"
                  : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showOtaPlatformModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 md:p-6">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingOtaPlatformId === null
                    ? "Thêm nền tảng OTA"
                    : "Chỉnh sửa nền tảng OTA"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Logo được lưu trong Supabase Storage →
                  website-media/ota/
                </p>
              </div>

              <button
                type="button"
                onClick={closeOtaPlatformModal}
                disabled={savingOtaPlatform}
                className="rounded-lg p-2 text-xl text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Tên OTA *
                  </label>

                  <input
                    value={otaPlatformForm.name}
                    onChange={function (event) {
                      handleOtaPlatformNameChange(
                        event.target.value
                      );
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Booking.com"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Slug *
                    </label>

                    <input
                      value={otaPlatformForm.slug}
                      onChange={function (event) {
                        updateOtaPlatformField(
                          "slug",
                          event.target.value
                        );
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="booking"
                    />

                    <p className="mt-1.5 text-xs text-slate-500">
                      Dùng để nhận diện OTA trong hệ thống.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Thứ tự
                    </label>

                    <input
                      type="number"
                      value={otaPlatformForm.sort_order}
                      onChange={function (event) {
                        updateOtaPlatformField(
                          "sort_order",
                          event.target.value
                        );
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Website OTA
                  </label>

                  <input
                    type="url"
                    value={otaPlatformForm.website}
                    onChange={function (event) {
                      updateOtaPlatformField(
                        "website",
                        event.target.value
                      );
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="https://www.booking.com/"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Trạng thái
                  </label>

                  <select
                    value={otaPlatformForm.status}
                    onChange={function (event) {
                      updateOtaPlatformField(
                        "status",
                        event.target.value as OtaStatus
                      );
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="active">
                      Đang hoạt động
                    </option>

                    <option value="inactive">
                      Tạm ngưng
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Logo OTA
                  </label>

                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-3">
                        {otaPlatformPreview ? (
                          <img
                            src={otaPlatformPreview}
                            alt="Preview logo OTA"
                            className="max-h-16 max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">
                            Chưa có logo
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <input
                          ref={otaLogoInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={handleOtaLogoChange}
                          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                        />

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          PNG, JPG, WEBP hoặc SVG. Tối đa 2MB.
                          <br />
                          File sẽ được lưu tại:
                          <span className="font-medium text-slate-700">
                            {" "}
                            website-media/ota/
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {otaPlatformForm.logo && !otaPlatformFile && (
                  <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <div className="text-xs font-medium text-slate-500">
                      Logo hiện tại
                    </div>

                    <div className="mt-1 break-all text-xs text-blue-600">
                      {otaPlatformForm.logo}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeOtaPlatformModal}
                disabled={savingOtaPlatform}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleSaveOtaPlatform}
                disabled={savingOtaPlatform}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingOtaPlatform
                  ? "Đang lưu..."
                  : editingOtaPlatformId === null
                  ? "Thêm nền tảng"
                  : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}