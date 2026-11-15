"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../../lib/supabase";

type Source = {
  id: number;
  unit_code: string;
  feed_url: string;
  enabled: boolean;
  last_success_at: string | null;
  last_error: string | null;
};
type SourceList = { quantity: number; sources: Source[]; active: number; duplicate: boolean; complete: boolean };
type Draft = Pick<Source, "unit_code" | "feed_url" | "enabled">;
const emptyDraft = { unit_code: "", feed_url: "", enabled: true };
const button = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50";
const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
const dateTime = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

export async function goHostAdminRequest<T>(roomId: number, method = "GET", sourceId?: number, body?: object, signal?: AbortSignal): Promise<T> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("Cần đăng nhập lại.");
  const params = new URLSearchParams({ roomId: String(roomId) });
  if (sourceId) params.set("sourceId", String(sourceId));
  const response = await fetch("/api/admin/gohost-sources?" + params, {
    method,
    signal,
    cache: "no-store",
    headers: { Authorization: "Bearer " + data.session.access_token, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Không thể xử lý nguồn GoHost.");
  return result;
}

export function countGoHostSources(roomId: number) {
  return goHostAdminRequest<SourceList>(roomId).then((data) => data.sources.length);
}

export default function GoHostSources({ roomId, quantity, disabled }: { roomId?: number; quantity: number; disabled: boolean }) {
  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">Đồng bộ phòng GoHost</h3>
      {roomId
        ? <fieldset disabled={disabled} className="min-w-0"><SourceEditor key={roomId} roomId={roomId} quantity={quantity} /></fieldset>
        : <p className="mt-2 text-sm text-slate-600">Lưu loại phòng trước để khai báo từng phòng vật lý và URL iCal.</p>}
    </section>
  );
}

function SourceEditor({ roomId, quantity }: { roomId: number; quantity: number }) {
  const [list, setList] = useState<SourceList>();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editId, setEditId] = useState<number>();
  const [showDraft, setShowDraft] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    goHostAdminRequest<SourceList>(roomId, "GET", undefined, undefined, controller.signal)
      .then(setList).catch((e: Error) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [roomId]);

  async function run(action: () => Promise<string>, closeDraft = false) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const result = await action();
      if (closeDraft) setShowDraft(false);
      setMessage(result);
      setList(await goHostAdminRequest<SourceList>(roomId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể cập nhật nguồn GoHost.");
    } finally {
      setBusy(false);
    }
  }

  function open(source?: Source) {
    setEditId(source?.id);
    setDraft(source ? { unit_code: source.unit_code, feed_url: source.feed_url, enabled: source.enabled } : emptyDraft);
    setError("");
    setMessage("");
    setShowDraft(true);
  }

  function save(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      await goHostAdminRequest(roomId, editId ? "PATCH" : "POST", editId, draft);
      return "Đã lưu nguồn GoHost.";
    }, true);
  }

  return (
    <div className="mt-2 space-y-3">
      {list ? <>
        <p className="text-sm text-slate-700">Tổng phòng {quantity} · Đã khai báo {list.sources.length}/{quantity} · Đang bật {list.active}</p>
        {(!list.complete || list.sources.length !== quantity || list.sources.some((source) => !source.last_success_at || source.last_error)) && (
          <p className="text-xs font-medium text-amber-800" role="status">
            {list.duplicate ? "Có số phòng hoặc URL trùng. " : ""}
            {list.sources.length > quantity
              ? "Số nguồn vượt tổng số phòng. Hãy xử lý nguồn trước khi giảm số lượng."
              : !list.complete || list.sources.length !== quantity
                ? "Số URL hợp lệ đang bật phải bằng tổng số phòng để xác minh tồn phòng."
                : "Một số nguồn chưa kiểm tra thành công."}
          </p>
        )}
        <ul className="space-y-2">
          {list.sources.map((source) => (
            <li key={source.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm">
                  <strong>{source.unit_code}</strong> · GoHost iCal · {source.enabled
                    ? source.last_error ? "Lỗi kết nối" : source.last_success_at ? "Đã kết nối" : "Chưa kiểm tra"
                    : "Đã tắt"}
                  {source.last_success_at && <p className="text-xs text-slate-600">Lần thành công gần nhất {dateTime.format(new Date(source.last_success_at))}</p>}
                  {source.last_error && <p className="text-xs text-red-700">{source.last_error}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={button} disabled={busy} onClick={() => open(source)}>Sửa</button>
                  <button type="button" className={button} disabled={busy} onClick={() => void run(async () => {
                    await goHostAdminRequest(roomId, "PATCH", source.id, {
                      unit_code: source.unit_code, feed_url: source.feed_url, enabled: !source.enabled,
                    });
                    return source.enabled ? "Đã tắt nguồn." : "Đã bật nguồn.";
                  }, true)}>{source.enabled ? "Tắt" : "Bật"}</button>
                  <button type="button" className={button} disabled={busy} onClick={() => void run(async () => {
                    const result = await goHostAdminRequest<{ ok: boolean }>(roomId, "POST", source.id, { action: "test" });
                    return result.ok ? "GoHost trả lịch iCal hợp lệ." : "Kiểm tra kết nối thất bại.";
                  })}>Kiểm tra kết nối</button>
                  <button type="button" className={button} disabled={busy} onClick={() => {
                    if (!window.confirm("Xóa nguồn iCal phòng " + source.unit_code + "? Lịch đã lưu của nguồn này cũng sẽ bị xóa.")) return;
                    void run(async () => {
                      await goHostAdminRequest(roomId, "DELETE", source.id, { confirm: true });
                      return "Đã xóa nguồn GoHost.";
                    }, true);
                  }}>Xóa</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {!showDraft && <button type="button" className={button}
          disabled={busy || list.sources.length >= list.quantity} onClick={() => open()}>Thêm phòng vật lý</button>}
        {quantity > list.quantity && list.sources.length >= list.quantity &&
          <p className="text-xs text-slate-600">Lưu số lượng mới trước khi thêm nguồn.</p>}
      </> : !error && <p className="text-sm text-slate-600">Đang tải nguồn GoHost…</p>}
      {showDraft && <form onSubmit={save} className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
        <label className="block text-sm">Số phòng
          <input className={input} value={draft.unit_code} required maxLength={40} disabled={busy}
            onChange={(e) => setDraft({ ...draft, unit_code: e.target.value })} />
        </label>
        <label className="block text-sm">URL GoHost iCal
          <input className={input} type="url" value={draft.feed_url} required maxLength={400} disabled={busy}
            autoComplete="off" spellCheck={false} onChange={(e) => setDraft({ ...draft, feed_url: e.target.value })} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.enabled} disabled={busy}
            onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} /> Bật đồng bộ
        </label>
        <div className="flex gap-2">
          <button className={button} disabled={busy}>Lưu nguồn</button>
          <button type="button" className={button} disabled={busy} onClick={() => setShowDraft(false)}>Hủy</button>
        </div>
      </form>}
      {busy && <p className="text-xs text-slate-600" role="status">Đang xử lý…</p>}
      {message && <p className="text-xs text-slate-700" role="status">{message}</p>}
      {error && <p className="text-xs text-red-700" role="alert">{error}</p>}
    </div>
  );
}
