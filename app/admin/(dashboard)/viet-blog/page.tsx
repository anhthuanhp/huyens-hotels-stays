"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";

type BlogPost = {
  id: number;
  slug: string;
  title_vi: string;
  title_en: string;
  excerpt_vi: string | null;
  excerpt_en: string | null;
  content_vi: string | null;
  content_en: string | null;
  category_vi: string | null;
  category_en: string | null;
  image: string | null;
  date: string;
  read_time: number;
  featured: boolean;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

type BlogForm = {
  slug: string;
  title_vi: string;
  title_en: string;
  excerpt_vi: string;
  excerpt_en: string;
  content_vi: string;
  content_en: string;
  category_vi: string;
  category_en: string;
  image: string;
  date: string;
  read_time: number;
  featured: boolean;
  status: "active" | "inactive";
};

const categories = [
  {
    vi: "Ẩm thực",
    en: "Food & Dining",
  },
  {
    vi: "Cuộc sống địa phương",
    en: "Local Life",
  },
  {
    vi: "Kinh nghiệm lưu trú",
    en: "Stay Tips",
  },
  {
    vi: "Huyen's Stories",
    en: "Huyen's Stories",
  },
];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyForm(): BlogForm {
  return {
    slug: "",
    title_vi: "",
    title_en: "",
    excerpt_vi: "",
    excerpt_en: "",
    content_vi: "",
    content_en: "",
    category_vi: categories[0].vi,
    category_en: categories[0].en,
    image: "",
    date: getToday(),
    read_time: 5,
    featured: false,
    status: "active",
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(value: string) {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status: BlogPost["status"]) {
  return status === "active" ? "Đang hiển thị" : "Ẩn";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Đã xảy ra lỗi không xác định.";
}

function isStorageBlogImage(url: string | null | undefined) {
  if (!url) return false;

  return (
    url.includes("/storage/v1/object/public/blog-images/") ||
    url.includes("/storage/v1/object/sign/blog-images/")
  );
}

function getStoragePathFromPublicUrl(url: string | null | undefined) {
  if (!url) return null;

  const marker = "/storage/v1/object/public/blog-images/";
  const index = url.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(url.slice(index + marker.length));
}

function getFileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && /^[a-z0-9]+$/.test(extension)) {
    return extension;
  }

  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";

  return "jpg";
}

export default function VietBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<BlogForm>(createEmptyForm());

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(
    null
  );

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const modalErrorRef = useRef<HTMLDivElement | null>(null);

  const editingPost = useMemo(() => {
    if (editingId === null) return null;

    return posts.find((post) => post.id === editingId) ?? null;
  }, [editingId, posts]);

  useEffect(() => {
    void loadPosts();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedFilePreview) {
        URL.revokeObjectURL(selectedFilePreview);
      }
    };
  }, [selectedFilePreview]);

  useEffect(() => {
    if (modalOpen && errorMessage && modalErrorRef.current) {
      requestAnimationFrame(() => {
        modalErrorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }, [modalOpen, errorMessage]);

  async function loadPosts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        `
        id,
        slug,
        title_vi,
        title_en,
        excerpt_vi,
        excerpt_en,
        content_vi,
        content_en,
        category_vi,
        category_en,
        image,
        date,
        read_time,
        featured,
        status,
        created_at,
        updated_at
      `
      )
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(`Không tải được danh sách bài viết: ${error.message}`);
      setPosts([]);
    } else {
      setPosts((data ?? []) as BlogPost[]);
    }

    setLoading(false);
  }

  function clearSelectedFile() {
    if (selectedFilePreview) {
      URL.revokeObjectURL(selectedFilePreview);
    }

    setSelectedFile(null);
    setSelectedFilePreview(null);
  }

  function openCreateModal() {
    clearSelectedFile();

    setEditingId(null);
    setForm(createEmptyForm());
    setMessage("");
    setErrorMessage("");
    setModalOpen(true);
  }

  function openEditModal(post: BlogPost) {
    clearSelectedFile();

    setEditingId(post.id);

    setForm({
      slug: post.slug,
      title_vi: post.title_vi,
      title_en: post.title_en,
      excerpt_vi: post.excerpt_vi ?? "",
      excerpt_en: post.excerpt_en ?? "",
      content_vi: post.content_vi ?? "",
      content_en: post.content_en ?? "",
      category_vi: post.category_vi ?? categories[0].vi,
      category_en: post.category_en ?? categories[0].en,
      image: post.image ?? "",
      date: post.date,
      read_time: post.read_time ?? 5,
      featured: post.featured,
      status: post.status,
    });

    setMessage("");
    setErrorMessage("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving || uploadingImage) return;

    clearSelectedFile();
    setModalOpen(false);
    setEditingId(null);
    setForm(createEmptyForm());
    setErrorMessage("");
  }

  function updateField<K extends keyof BlogForm>(
    field: K,
    value: BlogForm[K]
  ) {
    setErrorMessage("");

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleTitleViChange(value: string) {
    setErrorMessage("");

    setForm((current) => ({
      ...current,
      title_vi: value,
      slug:
        editingId === null || !current.slug
          ? slugify(value)
          : current.slug,
    }));
  }

  function handleCategoryChange(value: string) {
    setErrorMessage("");

    const category = categories.find((item) => item.vi === value);

    setForm((current) => ({
      ...current,
      category_vi: value,
      category_en: category?.en ?? "",
    }));
  }

  function handleImageSelect(file: File | null) {
    if (!file) {
      clearSelectedFile();
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Vui lòng chọn đúng file hình ảnh.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setErrorMessage("Ảnh không được lớn hơn 10MB.");
      return;
    }

    setErrorMessage("");

    if (selectedFilePreview) {
      URL.revokeObjectURL(selectedFilePreview);
    }

    setSelectedFile(file);
    setSelectedFilePreview(URL.createObjectURL(file));
  }

  async function uploadBlogImage(file: File, slug: string) {
    setUploadingImage(true);

    try {
      const extension = getFileExtension(file);
      const safeSlug = slugify(slug) || "blog";
      const uniqueName = `${safeSlug}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const storagePath = `blog/${uniqueName}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(storagePath, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("blog-images")
        .getPublicUrl(storagePath);

      if (!data.publicUrl) {
        throw new Error("Không lấy được URL công khai của ảnh.");
      }

      return {
        publicUrl: data.publicUrl,
        storagePath,
      };
    } finally {
      setUploadingImage(false);
    }
  }

  async function deleteStorageImage(url: string | null | undefined) {
    const path = getStoragePathFromPublicUrl(url);

    if (!path) {
      return;
    }

    const { error } = await supabase.storage
      .from("blog-images")
      .remove([path]);

    if (error) {
      throw error;
    }
  }

  async function handleSave() {
    if (saving || uploadingImage) {
      return;
    }

    setMessage("");
    setErrorMessage("");

    const titleVi = form.title_vi.trim();
    const titleEn = form.title_en.trim();
    const slug = slugify(form.slug);
    const contentVi = form.content_vi.trim();
    const contentEn = form.content_en.trim();

    if (!titleVi) {
      setErrorMessage("Vui lòng nhập tiêu đề tiếng Việt.");
      return;
    }

    if (!titleEn) {
      setErrorMessage("Vui lòng nhập tiêu đề tiếng Anh.");
      return;
    }

    if (!slug) {
      setErrorMessage("Vui lòng nhập slug.");
      return;
    }

    if (!contentVi) {
      setErrorMessage("Vui lòng nhập nội dung tiếng Việt.");
      return;
    }

    if (!contentEn) {
      setErrorMessage("Vui lòng nhập nội dung tiếng Anh.");
      return;
    }

    if (!form.date) {
      setErrorMessage("Vui lòng chọn ngày.");
      return;
    }

    if (!Number.isFinite(Number(form.read_time)) || Number(form.read_time) < 1) {
      setErrorMessage("Thời gian đọc phải lớn hơn 0 phút.");
      return;
    }

    setSaving(true);

    let uploadedImageUrl: string | null = null;

    try {
      /*
       * Kiểm tra phiên đăng nhập Supabase.
       * Nếu admin không có Supabase Auth session thì RLS
       * sẽ không cho phép INSERT/UPDATE.
       */
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(
          `Không kiểm tra được phiên đăng nhập Supabase: ${authError.message}`
        );
      }

      if (!user) {
        throw new Error(
          "Phiên đăng nhập quản trị chưa được xác thực bằng Supabase Auth. Hãy đăng nhập lại trang quản trị rồi thử lại."
        );
      }

      let imageUrl = form.image.trim() || null;

      /*
       * Nếu chọn ảnh mới:
       * 1. Upload ảnh.
       * 2. Lấy public URL.
       * 3. Lưu URL vào blog_posts.
       */
      if (selectedFile) {
        const uploaded = await uploadBlogImage(selectedFile, slug);

        imageUrl = uploaded.publicUrl;
        uploadedImageUrl = uploaded.publicUrl;
      }

      /*
       * Chỉ cho phép một bài featured.
       */
      if (form.featured) {
        const { error: featuredError } = await supabase
          .from("blog_posts")
          .update({ featured: false })
          .neq("id", editingId ?? -1);

        if (featuredError) {
          throw featuredError;
        }
      }

      const payload = {
        slug,
        title_vi: titleVi,
        title_en: titleEn,
        excerpt_vi: form.excerpt_vi.trim() || null,
        excerpt_en: form.excerpt_en.trim() || null,
        content_vi: contentVi,
        content_en: contentEn,
        category_vi: form.category_vi,
        category_en: form.category_en,
        image: imageUrl,
        date: form.date,
        read_time: Number(form.read_time),
        featured: form.featured,
        status: form.status,
      };

      if (editingId === null) {
        const { error } = await supabase
          .from("blog_posts")
          .insert(payload);

        if (error) {
          throw error;
        }

        setMessage("Đã tạo bài viết.");
      } else {
        const oldImage = editingPost?.image ?? null;

        const { error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        /*
         * Xóa ảnh cũ sau khi DB đã cập nhật thành công.
         */
        if (
          selectedFile &&
          oldImage &&
          oldImage !== imageUrl &&
          isStorageBlogImage(oldImage)
        ) {
          try {
            await deleteStorageImage(oldImage);
          } catch {
            // Không làm thất bại việc lưu bài nếu xóa ảnh cũ lỗi.
          }
        }

        setMessage("Đã cập nhật bài viết.");
      }

      clearSelectedFile();

      /*
       * Tải lại danh sách sau khi DB đã lưu thành công.
       */
      const { data: refreshedPosts, error: refreshError } = await supabase
        .from("blog_posts")
        .select(
          `
          id,
          slug,
          title_vi,
          title_en,
          excerpt_vi,
          excerpt_en,
          content_vi,
          content_en,
          category_vi,
          category_en,
          image,
          date,
          read_time,
          featured,
          status,
          created_at,
          updated_at
        `
        )
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (refreshError) {
        throw refreshError;
      }

      setPosts((refreshedPosts ?? []) as BlogPost[]);

      setModalOpen(false);
      setEditingId(null);
      setForm(createEmptyForm());
      setErrorMessage("");
    } catch (error) {
      /*
       * Nếu upload ảnh thành công nhưng DB lưu thất bại,
       * xóa ảnh mới để tránh file rác.
       */
      if (uploadedImageUrl) {
        try {
          await deleteStorageImage(uploadedImageUrl);
        } catch {
          // Không che mất lỗi chính.
        }
      }

      const readableError = getErrorMessage(error);

      setErrorMessage(`Không thể lưu bài viết: ${readableError}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(post: BlogPost) {
    setMessage("");
    setErrorMessage("");
    setTogglingId(post.id);

    const nextStatus =
      post.status === "active" ? "inactive" : "active";

    const { error } = await supabase
      .from("blog_posts")
      .update({ status: nextStatus })
      .eq("id", post.id);

    if (error) {
      setErrorMessage(`Không thể đổi trạng thái: ${error.message}`);
    } else {
      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                status: nextStatus,
              }
            : item
        )
      );

      setMessage(
        nextStatus === "active"
          ? "Bài viết đã được hiển thị."
          : "Bài viết đã được ẩn."
      );
    }

    setTogglingId(null);
  }

  async function handleDelete(post: BlogPost) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa bài "${post.title_vi}" không?`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setErrorMessage("");
    setDeletingId(post.id);

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", post.id);

      if (error) {
        throw error;
      }

      if (post.image && isStorageBlogImage(post.image)) {
        try {
          await deleteStorageImage(post.image);
        } catch {
          // DB đã xóa thành công.
        }
      }

      setPosts((current) =>
        current.filter((item) => item.id !== post.id)
      );

      setMessage("Đã xóa bài viết.");
    } catch (error) {
      setErrorMessage(
        `Không thể xóa bài viết: ${getErrorMessage(error)}`
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Viết Blog
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Quản lý bài viết, nội dung SEO và hình ảnh Blog.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            + Thêm bài viết
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {errorMessage && !modalOpen && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Bài viết</th>
                  <th className="px-5 py-4">Danh mục</th>
                  <th className="px-5 py-4">Ngày</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Nổi bật</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      Chưa có bài viết nào.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr
                      key={post.id}
                      className="align-middle hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            {post.image ? (
                              <img
                                src={post.image}
                                alt={post.title_vi}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                Không ảnh
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900">
                              {post.title_vi}
                            </div>

                            <div className="mt-1 max-w-xl truncate text-xs text-slate-500">
                              {post.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700">
                          {post.category_vi || "—"}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {post.category_en || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(post.date)}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          disabled={togglingId === post.id}
                          onClick={() =>
                            void handleToggleStatus(post)
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            post.status === "active"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {togglingId === post.id
                            ? "..."
                            : getStatusLabel(post.status)}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        {post.featured ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                            Nổi bật
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(post)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            disabled={deletingId === post.id}
                            onClick={() => void handleDelete(post)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === post.id ? "..." : "Xóa"}
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
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto my-6 max-w-5xl rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId === null
                    ? "Thêm bài viết"
                    : "Chỉnh sửa bài viết"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Hình ảnh được upload trực tiếp lên Supabase Storage.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving || uploadingImage}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500 hover:bg-slate-200 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="max-h-[calc(100vh-120px)] overflow-y-auto p-5">
              {errorMessage && (
                <div
                  ref={modalErrorRef}
                  role="alert"
                  className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <div className="font-bold">
                    Không thể lưu bài viết
                  </div>

                  <div className="mt-1 whitespace-pre-wrap break-words">
                    {errorMessage}
                  </div>
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Tiêu đề tiếng Việt *
                    </label>

                    <input
                      type="text"
                      value={form.title_vi}
                      onChange={(event) =>
                        handleTitleViChange(event.target.value)
                      }
                      placeholder="Nhập tiêu đề tiếng Việt"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Tiêu đề tiếng Anh *
                    </label>

                    <input
                      type="text"
                      value={form.title_en}
                      onChange={(event) =>
                        updateField("title_en", event.target.value)
                      }
                      placeholder="Enter English title"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Slug *
                    </label>

                    <input
                      type="text"
                      value={form.slug}
                      onChange={(event) =>
                        updateField(
                          "slug",
                          slugify(event.target.value)
                        )
                      }
                      placeholder="slug-bai-viet"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />

                    <p className="mt-1 text-xs text-slate-400">
                      URL: /blog/{form.slug || "..."}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Danh mục
                      </label>

                      <select
                        value={form.category_vi}
                        onChange={(event) =>
                          handleCategoryChange(event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      >
                        {categories.map((category) => (
                          <option
                            key={category.vi}
                            value={category.vi}
                          >
                            {category.vi} / {category.en}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Ngày
                      </label>

                      <input
                        type="date"
                        value={form.date}
                        onChange={(event) =>
                          updateField("date", event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Thời gian đọc
                    </label>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={form.read_time}
                        onChange={(event) =>
                          updateField(
                            "read_time",
                            Number(event.target.value)
                          )
                        }
                        className="w-32 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />

                      <span className="text-sm text-slate-500">
                        phút
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Ảnh đại diện
                    </label>

                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-100 sm:w-56">
                          {selectedFilePreview ? (
                            <img
                              src={selectedFilePreview}
                              alt="Ảnh mới"
                              className="h-full w-full object-cover"
                            />
                          ) : form.image ? (
                            <img
                              src={form.image}
                              alt={form.title_vi || "Ảnh bài viết"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-400">
                              Chưa có ảnh
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <input
                            id="blog-image-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={(event) => {
                              handleImageSelect(
                                event.target.files?.[0] ?? null
                              );

                              event.currentTarget.value = "";
                            }}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                          />

                          <p className="mt-3 text-xs leading-5 text-slate-500">
                            Chọn ảnh từ máy tính. Ảnh sẽ được upload
                            vào Supabase Storage bucket{" "}
                            <strong>blog-images</strong>.
                            <br />
                            Dung lượng tối đa: 10MB.
                          </p>

                          {selectedFile && (
                            <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                              Ảnh mới:{" "}
                              <strong>{selectedFile.name}</strong>
                              <br />
                              Ảnh chỉ được lưu vào Storage khi bấm
                              &quot;Tạo bài viết&quot;.
                            </div>
                          )}

                          {selectedFile && (
                            <button
                              type="button"
                              onClick={clearSelectedFile}
                              className="mt-3 text-xs font-semibold text-red-600 hover:underline"
                            >
                              Bỏ ảnh mới đã chọn
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Mô tả ngắn tiếng Việt
                    </label>

                    <textarea
                      value={form.excerpt_vi}
                      onChange={(event) =>
                        updateField("excerpt_vi", event.target.value)
                      }
                      rows={4}
                      placeholder="Mô tả ngắn dùng cho Blog và SEO"
                      className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Mô tả ngắn tiếng Anh
                    </label>

                    <textarea
                      value={form.excerpt_en}
                      onChange={(event) =>
                        updateField("excerpt_en", event.target.value)
                      }
                      rows={4}
                      placeholder="Short English description"
                      className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Nội dung tiếng Việt *
                    </label>

                    <textarea
                      value={form.content_vi}
                      onChange={(event) =>
                        updateField("content_vi", event.target.value)
                      }
                      rows={16}
                      placeholder="Nhập nội dung bài viết tiếng Việt..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />

                    <p className="mt-1 text-xs text-slate-400">
                      Có thể dùng xuống dòng để chia đoạn.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Nội dung tiếng Anh *
                    </label>

                    <textarea
                      value={form.content_en}
                      onChange={(event) =>
                        updateField("content_en", event.target.value)
                      }
                      rows={16}
                      placeholder="Enter English article content..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="mb-4 text-sm font-bold text-slate-800">
                      Trạng thái bài viết
                    </h3>

                    <div className="space-y-3">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={form.status === "active"}
                          onChange={(event) =>
                            updateField(
                              "status",
                              event.target.checked
                                ? "active"
                                : "inactive"
                            )
                          }
                          className="h-4 w-4 rounded border-slate-300"
                        />

                        <span className="text-sm text-slate-700">
                          Hiển thị bài viết trên website
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={form.featured}
                          onChange={(event) =>
                            updateField(
                              "featured",
                              event.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-slate-300"
                        />

                        <span className="text-sm text-slate-700">
                          Đặt làm bài viết nổi bật
                        </span>
                      </label>
                    </div>

                    {form.featured && (
                      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        Khi bài này được đặt nổi bật, các bài viết
                        khác sẽ tự động bỏ trạng thái nổi bật.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving || uploadingImage}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving || uploadingImage}
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadingImage
                    ? "Đang tải ảnh lên..."
                    : saving
                      ? "Đang lưu..."
                      : editingId === null
                        ? "Tạo bài viết"
                        : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}