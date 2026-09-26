"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { supabase } from "../../../lib/supabase";

type PolicyType = "booking" | "cancellation" | "privacy";

type Policy = {
  id: number;
  title_vi: string;
  title_en: string;
  content_vi: string;
  content_en: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
};

const policyConfig: Record<
  PolicyType,
  {
    table: string;
    label: string;
  }
> = {
  booking: {
    table: "booking_policy",
    label: "Chính sách đặt phòng",
  },
  cancellation: {
    table: "cancellation_policy",
    label: "Chính sách hủy phòng",
  },
  privacy: {
    table: "privacy_policy",
    label: "Chính sách bảo mật",
  },
};

const FONT_OPTIONS = [
  { label: "Mặc định", value: "" },
  { label: "Arial", value: "Arial" },
  { label: "Georgia", value: "Georgia" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Verdana", value: "Verdana" },
  { label: "Tahoma", value: "Tahoma" },
];

const SIZE_OPTIONS = [
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
];

function EditorToolbar({
  editor,
}: {
  editor: Editor | null;
}) {
  if (!editor) return null;

  const buttonClass = (active = false) =>
    `rounded-lg border px-3 py-2 text-sm transition ${
      active
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    }`;

  const setFontSize = (size: string) => {
    if (!size) {
      editor.chain().focus().unsetMark("textStyle").run();
      return;
    }

    editor
      .chain()
      .focus()
      .setMark("textStyle", { fontSize: size })
      .run();
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt(
      "Nhập đường dẫn:",
      previousUrl || "https://"
    );

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: "_blank" })
      .run();
  };

  return (
    <div className="border-b border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500"
          value={
            editor.getAttributes("textStyle").fontFamily || ""
          }
          onChange={(event) => {
            const value = event.target.value;

            if (!value) {
              editor.chain().focus().unsetFontFamily().run();
            } else {
              editor
                .chain()
                .focus()
                .setFontFamily(value)
                .run();
            }
          }}
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.label} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-500"
          defaultValue=""
          onChange={(event) => {
            setFontSize(event.target.value);
            event.target.value = "";
          }}
        >
          <option value="" disabled>
            Cỡ chữ
          </option>

          {SIZE_OPTIONS.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}px
            </option>
          ))}
        </select>

        <div className="h-8 w-px bg-slate-300" />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
          className={buttonClass(editor.isActive("bold"))}
          title="In đậm"
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
          className={buttonClass(editor.isActive("italic"))}
          title="In nghiêng"
        >
          <em>I</em>
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleUnderline().run()
          }
          className={buttonClass(editor.isActive("underline"))}
          title="Gạch chân"
        >
          <u>U</u>
        </button>

        <div className="h-8 w-px bg-slate-300" />

        <label
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          title="Màu chữ"
        >
          <span>A</span>

          <input
            type="color"
            defaultValue="#000000"
            onChange={(event) =>
              setColor(event.target.value)
            }
            className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>

        <div className="h-8 w-px bg-slate-300" />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().setTextAlign("left").run()
          }
          className={buttonClass(
            editor.isActive({ textAlign: "left" })
          )}
          title="Căn trái"
        >
          ≡←
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().setTextAlign("center").run()
          }
          className={buttonClass(
            editor.isActive({ textAlign: "center" })
          )}
          title="Căn giữa"
        >
          ≡
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().setTextAlign("right").run()
          }
          className={buttonClass(
            editor.isActive({ textAlign: "right" })
          )}
          title="Căn phải"
        >
          →≡
        </button>

        <div className="h-8 w-px bg-slate-300" />

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 1 })
              .run()
          }
          className={buttonClass(
            editor.isActive("heading", { level: 1 })
          )}
          title="Tiêu đề lớn"
        >
          H1
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 2 })
              .run()
          }
          className={buttonClass(
            editor.isActive("heading", { level: 2 })
          )}
          title="Tiêu đề"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 3 })
              .run()
          }
          className={buttonClass(
            editor.isActive("heading", { level: 3 })
          )}
          title="Tiêu đề nhỏ"
        >
          H3
        </button>

        <div className="h-8 w-px bg-slate-300" />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          className={buttonClass(
            editor.isActive("bulletList")
          )}
          title="Danh sách"
        >
          • Danh sách
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          className={buttonClass(
            editor.isActive("orderedList")
          )}
          title="Danh sách đánh số"
        >
          1. Danh sách
        </button>

        <button
          type="button"
          onClick={setLink}
          className={buttonClass(editor.isActive("link"))}
          title="Chèn liên kết"
        >
          🔗
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          className={buttonClass()}
          title="Xóa định dạng"
        >
          Xóa định dạng
        </button>
      </div>
    </div>
  );
}

function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[420px] px-5 py-4 outline-none text-[16px] leading-7 text-slate-800",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();

    if (value !== currentHtml) {
      editor.commands.setContent(value || "<p></p>", {
        emitUpdate: false,
      });
    }
  }, [value, editor]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
      <EditorToolbar editor={editor} />

      <EditorContent editor={editor} />

      <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-400">
        Có thể chọn font, cỡ chữ, màu chữ, căn lề, tiêu đề,
        danh sách và liên kết.
      </div>
    </div>
  );
}

export default function AdminChinhSachPage() {
  const [activeTab, setActiveTab] =
    useState<PolicyType>("booking");

  const [policies, setPolicies] = useState<
    Record<PolicyType, Policy | null>
  >({
    booking: null,
    cancellation: null,
    privacy: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const results = await Promise.all(
        (
          Object.entries(policyConfig) as [
            PolicyType,
            (typeof policyConfig)[PolicyType]
          ][]
        ).map(async ([type, config]) => {
          const { data, error } = await supabase
            .from(config.table)
            .select("*")
            .order("id", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (error) {
            throw new Error(
              `${config.label}: ${error.message}`
            );
          }

          return [type, data as Policy | null] as const;
        })
      );

      const loadedPolicies = {
        booking: null,
        cancellation: null,
        privacy: null,
      } as Record<PolicyType, Policy | null>;

      results.forEach(([type, data]) => {
        loadedPolicies[type] = data;
      });

      setPolicies(loadedPolicies);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu chính sách."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentPolicy = policies[activeTab];

  const updateCurrentPolicy = (
    field: keyof Policy,
    value: string | boolean
  ) => {
    if (!currentPolicy) return;

    setPolicies((previous) => ({
      ...previous,
      [activeTab]: {
        ...currentPolicy,
        [field]: value,
      },
    }));

    setMessage("");
    setErrorMessage("");
  };

  const handleSave = async () => {
    if (!currentPolicy) {
      setErrorMessage("Không tìm thấy dữ liệu chính sách.");
      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const table = policyConfig[activeTab].table;

      const { error } = await supabase
        .from(table)
        .update({
          title_vi: currentPolicy.title_vi,
          title_en: currentPolicy.title_en,
          content_vi: currentPolicy.content_vi,
          content_en: currentPolicy.content_en,
          status: currentPolicy.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentPolicy.id);

      if (error) {
        throw new Error(error.message);
      }

      setMessage("Đã lưu thay đổi thành công.");

      await loadPolicies();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể lưu thay đổi."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Quản lý chính sách
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Quản lý nội dung các chính sách hiển thị trên website
          Huyen&apos;s Hotels &amp; Stays.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200">
          <div className="flex overflow-x-auto">
            {(Object.keys(policyConfig) as PolicyType[]).map(
              (type) => {
                const active = activeTab === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setActiveTab(type);
                      setMessage("");
                      setErrorMessage("");
                    }}
                    className={`whitespace-nowrap px-6 py-4 text-sm font-medium transition ${
                      active
                        ? "border-b-2 border-sky-600 text-sky-700"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {policyConfig[type].label}
                  </button>
                );
              }
            )}
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Đang tải dữ liệu chính sách...
            </div>
          ) : !currentPolicy ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
              Chưa có dữ liệu cho chính sách này trong cơ sở
              dữ liệu.
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {policyConfig[activeTab].label}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Soạn thảo nội dung bằng trình chỉnh sửa văn
                    bản bên dưới.
                  </p>
                </div>

                <label className="flex cursor-pointer items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    Hiển thị trên website
                  </span>

                  <input
                    type="checkbox"
                    checked={currentPolicy.status}
                    onChange={(event) =>
                      updateCurrentPolicy(
                        "status",
                        event.target.checked
                      )
                    }
                    className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                </label>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tiêu đề tiếng Việt
                  </label>

                  <input
                    type="text"
                    value={currentPolicy.title_vi}
                    onChange={(event) =>
                      updateCurrentPolicy(
                        "title_vi",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    placeholder="Nhập tiêu đề tiếng Việt"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tiêu đề tiếng Anh
                  </label>

                  <input
                    type="text"
                    value={currentPolicy.title_en}
                    onChange={(event) =>
                      updateCurrentPolicy(
                        "title_en",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    placeholder="Enter English title"
                  />
                </div>
              </div>

              <div className="mt-8">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nội dung tiếng Việt
                </label>

                <RichTextEditor
                  value={currentPolicy.content_vi}
                  onChange={(html) =>
                    updateCurrentPolicy("content_vi", html)
                  }
                />
              </div>

              <div className="mt-8">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nội dung tiếng Anh
                </label>

                <RichTextEditor
                  value={currentPolicy.content_en}
                  onChange={(html) =>
                    updateCurrentPolicy("content_en", html)
                  }
                />
              </div>

              <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  {message && (
                    <span className="text-emerald-600">
                      {message}
                    </span>
                  )}

                  {errorMessage && (
                    <span className="text-red-600">
                      {errorMessage}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}