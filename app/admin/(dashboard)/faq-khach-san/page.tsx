"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

type Hotel = {
id: number;
name_vi: string | null;
name_en: string | null;
};

type Faq = {
id: string;
hotel_id: number;
question_vi: string;
answer_vi: string;
question_en: string | null;
answer_en: string | null;
sort_order: number;
is_active: boolean;
};

type Form = {
question_vi: string;
answer_vi: string;
question_en: string;
answer_en: string;
sort_order: number;
is_active: boolean;
};

const blank: Form = {
question_vi: "",
answer_vi: "",
question_en: "",
answer_en: "",
sort_order: 0,
is_active: true,
};

const cols =
"id,hotel_id,question_vi,answer_vi,question_en,answer_en,sort_order,is_active";

export default function HotelFaqAdminPage() {
const [hotels, setHotels] = useState<Hotel[]>([]);
const [hotelId, setHotelId] = useState<number | null>(null);
const [faqs, setFaqs] = useState<Faq[]>([]);
const [editing, setEditing] = useState<string | null>(null);
const [form, setForm] = useState<Form>(blank);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [notice, setNotice] = useState("");
const [authDebug, setAuthDebug] = useState<{
hasSession: boolean;
userId: string | null;
email: string | null;
appMetadata: Record<string, unknown> | null;
userRole: string | null;
} | null>(null);

useEffect(() => {
void (async () => {
const { data, error: e } = await supabase
.from("hotels")
.select("id,name_vi,name_en")
.order("name_vi");

  if (e) {
    setError(e.message);
  }

  const rows = (data ?? []) as Hotel[];
  setHotels(rows);
  setHotelId(rows[0]?.id ?? null);

  if (!rows.length) {
    setLoading(false);
  }
})();

}, []);

useEffect(() => {
void (async () => {
const {
data: { session },
} = await supabase.auth.getSession();

  const debug = {
    hasSession: !!session,
    userId: session?.user?.id ?? null,
    email: session?.user?.email ?? null,
    appMetadata:
      (session?.user?.app_metadata as Record<string, unknown> | undefined) ??
      null,
    userRole: session?.user?.role ?? null,
  };

  console.log("FAQ DEBUG SESSION:", debug);
  setAuthDebug(debug);
})();

}, []);

useEffect(() => {
if (hotelId === null) return;

let live = true;

void (async () => {
  setLoading(true);
  setError("");

  const { data, error: e } = await supabase
    .from("hotel_faqs")
    .select(cols)
    .eq("hotel_id", hotelId)
    .order("sort_order")
    .order("id");

  if (!live) return;

  if (e) {
    setError(
      `Không tải được FAQ. Áp dụng migration và kiểm tra quyền admin: ${e.message}`,
    );
  }

  setFaqs((data ?? []) as Faq[]);
  setLoading(false);
})();

return () => {
  live = false;
};

}, [hotelId]);

const clear = () => {
setEditing(null);
setForm(blank);
};

const edit = (f: Faq) => {
setEditing(f.id);
setForm({
question_vi: f.question_vi,
answer_vi: f.answer_vi,
question_en: f.question_en ?? "",
answer_en: f.answer_en ?? "",
sort_order: f.sort_order,
is_active: f.is_active,
});
setNotice("");
};

const save = async (e: FormEvent<HTMLFormElement>) => {
e.preventDefault();

if (hotelId === null) return;

setSaving(true);
setError("");

const {
  data: { session },
} = await supabase.auth.getSession();

const debug = {
  hasSession: !!session,
  userId: session?.user?.id ?? null,
  email: session?.user?.email ?? null,
  appMetadata:
    (session?.user?.app_metadata as Record<string, unknown> | undefined) ??
    null,
  userRole: session?.user?.role ?? null,
};

console.log("FAQ DEBUG BEFORE SAVE:", debug);
setAuthDebug(debug);

const row = {
  hotel_id: hotelId,
  question_vi: form.question_vi.trim(),
  answer_vi: form.answer_vi.trim(),
  question_en: form.question_en.trim() || null,
  answer_en: form.answer_en.trim() || null,
  sort_order: Math.max(0, Number(form.sort_order) || 0),
  is_active: form.is_active,
};

const res = editing
  ? await supabase.from("hotel_faqs").update(row).eq("id", editing)
  : await supabase.from("hotel_faqs").insert(row);

setSaving(false);

if (res.error) {
  console.error("FAQ SAVE ERROR:", res.error);

  setError(
    res.error.code === "23505"
      ? "Câu hỏi tiếng Việt đã tồn tại ở khách sạn."
      : res.error.message,
  );

  return;
}

setNotice(editing ? "Đã cập nhật câu hỏi." : "Đã thêm câu hỏi.");
clear();

const { data } = await supabase
  .from("hotel_faqs")
  .select(cols)
  .eq("hotel_id", hotelId)
  .order("sort_order")
  .order("id");

setFaqs((data ?? []) as Faq[]);

};

const toggle = async (f: Faq) => {
const { error: e } = await supabase
.from("hotel_faqs")
.update({ is_active: !f.is_active })
.eq("id", f.id);

if (e) {
  setError(e.message);
  return;
}

setFaqs((a) =>
  a.map((x) =>
    x.id === f.id ? { ...x, is_active: !x.is_active } : x,
  ),
);

};

const remove = async (f: Faq) => {
if (!window.confirm(`Xóa câu hỏi “${f.question_vi}”?`)) return;

const { error: e } = await supabase
  .from("hotel_faqs")
  .delete()
  .eq("id", f.id);

if (e) {
  setError(e.message);
  return;
}

setFaqs((a) => a.filter((x) => x.id !== f.id));

if (editing === f.id) clear();

setNotice("Đã xóa câu hỏi.");

};

const selected = hotels.find((h) => h.id === hotelId);

const input =
"mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm";

return (
<main className="mx-auto max-w-5xl p-4 sm:p-8">
<header className="mb-6">
<h1 className="text-2xl font-semibold">FAQ khách sạn</h1>

    <p className="mt-1 text-sm text-neutral-600">
      Quản lý câu hỏi và câu trả lời riêng theo từng khách sạn. FAQ đang
      bật sẽ hiển thị trên trang và schema SEO.
    </p>
  </header>

  {authDebug && (
    <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm">
      <div className="mb-2 font-semibold">Kiểm tra Supabase Auth</div>

      <div>
        Session:{" "}
        <strong>{authDebug.hasSession ? "CÓ" : "KHÔNG"}</strong>
      </div>

      <div>User ID: {authDebug.userId ?? "—"}</div>

      <div>Email: {authDebug.email ?? "—"}</div>

      <div>
        Role:{" "}
        <strong>
          {authDebug.appMetadata?.role
            ? String(authDebug.appMetadata.role)
            : "Không có"}
        </strong>
      </div>
    </div>
  )}

  <label className="mb-6 block max-w-xl text-sm font-medium">
    Chọn khách sạn

    <select
      className={input}
      value={hotelId ?? ""}
      onChange={(e) => {
        setHotelId(Number(e.target.value));
        clear();
        setNotice("");
      }}
    >
      {hotels.map((h) => (
        <option key={h.id} value={h.id}>
          {h.name_vi || h.name_en || `Khách sạn #${h.id}`}
        </option>
      ))}
    </select>
  </label>

  {error && (
    <p
      role="alert"
      className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
    >
      {error}
    </p>
  )}

  {notice && (
    <p
      role="status"
      className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800"
    >
      {notice}
    </p>
  )}

  {selected && (
    <form
      onSubmit={save}
      className="mb-8 rounded-xl border bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        {editing ? <Pencil size={18} /> : <Plus size={19} />}
        {editing
          ? "Sửa câu hỏi"
          : `Thêm FAQ cho ${selected.name_vi || selected.name_en}`}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">
          Câu hỏi (Tiếng Việt) *
          <input
            required
            maxLength={300}
            className={input}
            value={form.question_vi}
            onChange={(e) =>
              setForm({ ...form, question_vi: e.target.value })
            }
          />
        </label>

        <label className="text-sm font-medium">
          Question (English)
          <input
            maxLength={300}
            className={input}
            value={form.question_en}
            onChange={(e) =>
              setForm({ ...form, question_en: e.target.value })
            }
          />
        </label>

        <label className="text-sm font-medium md:col-span-2">
          Câu trả lời (Tiếng Việt) *
          <textarea
            required
            maxLength={5000}
            rows={4}
            className={input}
            value={form.answer_vi}
            onChange={(e) =>
              setForm({ ...form, answer_vi: e.target.value })
            }
          />
        </label>

        <label className="text-sm font-medium md:col-span-2">
          Answer (English)
          <textarea
            maxLength={5000}
            rows={3}
            className={input}
            value={form.answer_en}
            onChange={(e) =>
              setForm({ ...form, answer_en: e.target.value })
            }
          />
        </label>

        <label className="text-sm font-medium">
          Thứ tự
          <input
            type="number"
            min={0}
            className={input}
            value={form.sort_order}
            onChange={(e) =>
              setForm({
                ...form,
                sort_order: Number(e.target.value),
              })
            }
          />
        </label>

        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm({
                ...form,
                is_active: e.target.checked,
              })
            }
          />
          Hiển thị trên website/schema SEO
        </label>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          <Save size={16} />
          {saving
            ? "Đang lưu…"
            : editing
              ? "Lưu thay đổi"
              : "Thêm câu hỏi"}
        </button>

        {editing && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"
          >
            <X size={16} />
            Hủy
          </button>
        )}
      </div>
    </form>
  )}

  <section>
    <h2 className="mb-3 text-lg font-semibold">
      Danh sách FAQ{" "}
      {selected ? `· ${selected.name_vi || selected.name_en}` : ""}
    </h2>

    {loading ? (
      <p className="text-sm text-neutral-500">Đang tải…</p>
    ) : !faqs.length ? (
      <p className="rounded-lg border border-dashed p-5 text-sm text-neutral-600">
        Chưa có FAQ. Nhập câu trả lời đã xác minh từ thông tin thực tế của
        khách sạn.
      </p>
    ) : (
      <div className="space-y-3">
        {faqs.map((f) => (
          <article
            key={f.id}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              <div className="min-w-0">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    f.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {f.is_active ? "Đang hiển thị" : "Đã ẩn"}
                </span>

                <span className="ml-2 text-xs text-neutral-500">
                  Thứ tự {f.sort_order}
                </span>

                <h3 className="mt-2 font-semibold">
                  {f.question_vi}
                </h3>

                <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">
                  {f.answer_vi}
                </p>

                {f.question_en && (
                  <p className="mt-3 text-sm font-medium">
                    {f.question_en}
                  </p>
                )}

                {f.answer_en && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600">
                    {f.answer_en}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-start gap-2">
                <button
                  type="button"
                  onClick={() => edit(f)}
                  aria-label="Sửa FAQ"
                  className="rounded-md border p-2"
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => void toggle(f)}
                  className="rounded-md border px-3 py-2 text-xs"
                >
                  {f.is_active ? "Ẩn" : "Hiện"}
                </button>

                <button
                  type="button"
                  onClick={() => void remove(f)}
                  aria-label="Xóa FAQ"
                  className="rounded-md border border-red-200 p-2 text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
</main>

);
}