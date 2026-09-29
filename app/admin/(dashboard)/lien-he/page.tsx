
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type ContactStatus = "new" | "read";

type ContactMessage = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  language: "vi" | "en";
  status: string;
  created_at: string;
};

type FilterType = "all" | "new" | "read";

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatus(status: string): ContactStatus {
  return status === "new" ? "new" : "read";
}

function StatusBadge({ status }: { status: string }) {
  const currentStatus = getStatus(status);

  if (currentStatus === "new") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        Chưa đọc
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
      Đã đọc
    </span>
  );
}

export default function LienHePage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadMessages = useCallback(async () => {
    setError("");

    const { data, error: queryError } = await supabase
      .from("contact_messages")
      .select(
        "id, name, phone, email, message, language, status, created_at"
      )
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Load contact messages error:", queryError);
      setError("Không thể tải danh sách tin nhắn.");
      setMessages([]);
      return;
    }

    setMessages((data ?? []) as ContactMessage[]);
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      if (mounted) {
        await loadMessages();
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [loadMessages]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const markAsRead = async (message: ContactMessage) => {
    if (getStatus(message.status) === "read") {
      return;
    }

    setUpdatingId(message.id);

    const { error: updateError } = await supabase
      .from("contact_messages")
      .update({ status: "read" })
      .eq("id", message.id);

    if (updateError) {
      console.error("Mark contact message as read error:", updateError);
      setError("Không thể cập nhật trạng thái tin nhắn.");
      setUpdatingId(null);
      return;
    }

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id
          ? {
              ...item,
              status: "read",
            }
          : item
      )
    );

    setSelectedMessage((current) =>
      current && current.id === message.id
        ? {
            ...current,
            status: "read",
          }
        : current
    );

    setUpdatingId(null);
  };

  const openMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);

    if (getStatus(message.status) === "new") {
      await markAsRead(message);
    }
  };

  const deleteMessage = async (message: ContactMessage) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa tin nhắn của "${message.name}" không?\n\nThao tác này không thể hoàn tác.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(message.id);
    setError("");

    const { error: deleteError } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", message.id);

    if (deleteError) {
      console.error("Delete contact message error:", deleteError);
      setError(
        `Không thể xóa tin nhắn: ${deleteError.message || "Lỗi không xác định."}`
      );
      setDeletingId(null);
      return;
    }

    setMessages((current) =>
      current.filter((item) => item.id !== message.id)
    );

    setSelectedMessage((current) =>
      current?.id === message.id ? null : current
    );

    setDeletingId(null);
  };

  const filteredMessages = useMemo(() => {
    if (filter === "new") {
      return messages.filter((message) => getStatus(message.status) === "new");
    }

    if (filter === "read") {
      return messages.filter(
        (message) => getStatus(message.status) === "read"
      );
    }

    return messages;
  }, [messages, filter]);

  const unreadCount = useMemo(
    () =>
      messages.filter((message) => getStatus(message.status) === "new").length,
    [messages]
  );

  const readCount = messages.length - unreadCount;

  return (
    <div className="min-h-full bg-neutral-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Liên hệ
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Danh sách tin nhắn khách gửi từ trang website.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? "Đang tải..." : "↻ Tải lại"}
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-neutral-500">
              Tổng tin nhắn
            </div>

            <div className="mt-2 text-3xl font-bold text-neutral-900">
              {messages.length}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="text-sm font-medium text-amber-700">
              Chưa đọc
            </div>

            <div className="mt-2 text-3xl font-bold text-amber-800">
              {unreadCount}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="text-sm font-medium text-emerald-700">
              Đã đọc
            </div>

            <div className="mt-2 text-3xl font-bold text-emerald-800">
              {readCount}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === "all"
                ? "bg-sky-500 text-white"
                : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Tất cả ({messages.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter("new")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === "new"
                ? "bg-amber-500 text-white"
                : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter("read")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === "read"
                ? "bg-emerald-500 text-white"
                : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            Đã đọc ({readCount})
          </button>
        </div>

        {/* Message list */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-neutral-500">
              Đang tải tin nhắn...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl">✉</div>

              <h2 className="mt-4 text-lg font-semibold text-neutral-900">
                Không có tin nhắn
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                {filter === "new"
                  ? "Hiện không có tin nhắn chưa đọc."
                  : filter === "read"
                    ? "Hiện không có tin nhắn đã đọc."
                    : "Chưa có khách gửi tin nhắn."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Khách hàng
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Liên hệ
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Nội dung
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Thời gian
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Trạng thái
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMessages.map((message) => {
                      const isNew = getStatus(message.status) === "new";

                      return (
                        <tr
                          key={message.id}
                          className={`border-b border-neutral-100 transition hover:bg-neutral-50 ${
                            isNew ? "bg-amber-50/30" : "bg-white"
                          }`}
                        >
                          <td className="px-5 py-4 align-top">
                            <button
                              type="button"
                              onClick={() => openMessage(message)}
                              className="text-left"
                            >
                              <div className="font-semibold text-neutral-900 hover:text-sky-600">
                                {message.name}
                              </div>

                              <div className="mt-1 text-xs text-neutral-500">
                                {message.language === "en"
                                  ? "English"
                                  : "Tiếng Việt"}
                              </div>
                            </button>
                          </td>

                          <td className="px-5 py-4 align-top">
                            <div className="text-sm font-medium text-neutral-800">
                              {message.phone}
                            </div>

                            {message.email && (
                              <div className="mt-1 max-w-[220px] truncate text-xs text-neutral-500">
                                {message.email}
                              </div>
                            )}
                          </td>

                          <td className="max-w-[360px] px-5 py-4 align-top">
                            <button
                              type="button"
                              onClick={() => openMessage(message)}
                              className="block w-full text-left"
                            >
                              <div
                                className={`line-clamp-2 text-sm leading-6 ${
                                  isNew
                                    ? "font-semibold text-neutral-900"
                                    : "text-neutral-600"
                                }`}
                              >
                                {message.message}
                              </div>

                              <span className="mt-1 inline-block text-xs font-semibold text-sky-600">
                                Xem chi tiết →
                              </span>
                            </button>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-neutral-500">
                            {formatDate(message.created_at)}
                          </td>

                          <td className="px-5 py-4 align-top">
                            <StatusBadge status={message.status} />
                          </td>

                          <td className="px-5 py-4 align-top">
                            <div className="flex justify-end gap-2">
                              {isNew && (
                                <button
                                  type="button"
                                  onClick={() => markAsRead(message)}
                                  disabled={updatingId === message.id}
                                  className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {updatingId === message.id
                                    ? "Đang cập nhật..."
                                    : "Đã đọc"}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => deleteMessage(message)}
                                disabled={deletingId === message.id}
                                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId === message.id
                                  ? "Đang xóa..."
                                  : "Xóa"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-neutral-100 lg:hidden">
                {filteredMessages.map((message) => {
                  const isNew = getStatus(message.status) === "new";

                  return (
                    <div
                      key={message.id}
                      className={`p-4 sm:p-5 ${
                        isNew ? "bg-amber-50/40" : "bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => openMessage(message)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-neutral-900">
                              {message.name}
                            </div>

                            <div className="mt-1 text-sm text-neutral-600">
                              {message.phone}
                            </div>
                          </div>

                          <StatusBadge status={message.status} />
                        </div>

                        <div className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">
                          {message.message}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-xs text-neutral-400">
                            {formatDate(message.created_at)}
                          </span>

                          <span className="text-xs font-semibold text-sky-600">
                            Xem chi tiết →
                          </span>
                        </div>
                      </button>

                      <div className="mt-4 flex gap-2">
                        {isNew && (
                          <button
                            type="button"
                            onClick={() => markAsRead(message)}
                            disabled={updatingId === message.id}
                            className="flex-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingId === message.id
                              ? "Đang cập nhật..."
                              : "Đánh dấu đã đọc"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteMessage(message)}
                          disabled={deletingId === message.id}
                          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === message.id ? "Đang xóa..." : "Xóa"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedMessage(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  Chi tiết tin nhắn
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  {formatDate(selectedMessage.created_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="rounded-lg px-3 py-2 text-xl text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-neutral-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Họ tên
                  </div>

                  <div className="mt-1 font-semibold text-neutral-900">
                    {selectedMessage.name}
                  </div>
                </div>

                <div className="rounded-xl bg-neutral-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Trạng thái
                  </div>

                  <div className="mt-2">
                    <StatusBadge status={selectedMessage.status} />
                  </div>
                </div>

                <div className="rounded-xl bg-neutral-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Số điện thoại
                  </div>

                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="mt-1 block font-semibold text-sky-600 hover:underline"
                  >
                    {selectedMessage.phone}
                  </a>
                </div>

                <div className="rounded-xl bg-neutral-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Email
                  </div>

                  {selectedMessage.email ? (
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="mt-1 block break-all font-semibold text-sky-600 hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  ) : (
                    <div className="mt-1 text-neutral-400">
                      Không cung cấp
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Nội dung
                </div>

                <div className="whitespace-pre-wrap rounded-xl border border-neutral-200 bg-white p-5 text-sm leading-7 text-neutral-700">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 bg-neutral-50 px-6 py-4 sm:flex-row sm:justify-end">
              {getStatus(selectedMessage.status) === "new" && (
                <button
                  type="button"
                  onClick={() => markAsRead(selectedMessage)}
                  disabled={updatingId === selectedMessage.id}
                  className="rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingId === selectedMessage.id
                    ? "Đang cập nhật..."
                    : "Đánh dấu đã đọc"}
                </button>
              )}

              <button
                type="button"
                onClick={() => deleteMessage(selectedMessage)}
                disabled={deletingId === selectedMessage.id}
                className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId === selectedMessage.id
                  ? "Đang xóa..."
                  : "Xóa tin nhắn"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
