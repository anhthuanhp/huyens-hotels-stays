"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type ContactMessage = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  language: "vi" | "en";
  status: "new" | "read" | "processing" | "completed";
  created_at: string;
};

type FilterStatus =
  | "all"
  | "new"
  | "read"
  | "processing"
  | "completed";

export default function AdminLienHePage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);

  const [filter, setFilter] =
    useState<FilterStatus>("all");

  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("contact_messages")
      .select(
        "id, name, phone, email, message, language, status, created_at"
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Lỗi tải liên hệ:",
        error
      );

      setMessages([]);
      setLoading(false);
      return;
    }

    setMessages(
      (data ?? []) as ContactMessage[]
    );

    setLoading(false);
  };

  const filteredMessages = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return messages.filter((item) => {
      const matchesStatus =
        filter === "all" ||
        item.status === filter;

      if (!matchesStatus) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        item.name.toLowerCase().includes(keyword) ||
        item.phone.toLowerCase().includes(keyword) ||
        (item.email ?? "")
          .toLowerCase()
          .includes(keyword) ||
        item.message.toLowerCase().includes(keyword)
      );
    });
  }, [messages, filter, search]);

  const newCount = messages.filter(
    (item) => item.status === "new"
  ).length;

  const readCount = messages.filter(
    (item) => item.status === "read"
  ).length;

  const processingCount = messages.filter(
    (item) => item.status === "processing"
  ).length;

  const completedCount = messages.filter(
    (item) => item.status === "completed"
  ).length;

  const formatDateTime = (value: string) => {
    return new Intl.DateTimeFormat(
      "vi-VN",
      {
        dateStyle: "short",
        timeStyle: "short",
      }
    ).format(new Date(value));
  };

  const updateStatus = async (
    id: number,
    status: ContactMessage["status"]
  ) => {
    setUpdating(true);

    const { error } = await supabase
      .from("contact_messages")
      .update({
        status,
      })
      .eq("id", id);

    if (error) {
      console.error(
        "Lỗi cập nhật trạng thái:",
        error
      );

      setUpdating(false);
      return;
    }

    setMessages((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
            }
          : item
      )
    );

    setSelectedMessage((current) =>
      current && current.id === id
        ? {
            ...current,
            status,
          }
        : current
    );

    setUpdating(false);
  };

  const openMessage = async (
    item: ContactMessage
  ) => {
    setSelectedMessage(item);

    if (item.status === "new") {
      await updateStatus(item.id, "read");
    }
  };

  const closeMessage = () => {
    setSelectedMessage(null);
  };

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Liên hệ
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Quản lý thông tin khách hàng gửi từ website.
            </p>
          </div>

          <button
            type="button"
            onClick={loadMessages}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading
              ? "Đang tải..."
              : "Làm mới"}
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Tin mới"
          value={newCount}
          active={filter === "new"}
          onClick={() => setFilter("new")}
          highlight
        />

        <SummaryCard
          label="Đã xem"
          value={readCount}
          active={filter === "read"}
          onClick={() => setFilter("read")}
        />

        <SummaryCard
          label="Đang xử lý"
          value={processingCount}
          active={filter === "processing"}
          onClick={() =>
            setFilter("processing")
          }
        />

        <SummaryCard
          label="Hoàn tất"
          value={completedCount}
          active={filter === "completed"}
          onClick={() =>
            setFilter("completed")
          }
        />
      </div>

      {/* LIST */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white">
        {/* TOOLBAR */}
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* FILTER */}
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={filter === "all"}
                onClick={() =>
                  setFilter("all")
                }
              >
                Tất cả
              </FilterButton>

              <FilterButton
                active={filter === "new"}
                onClick={() =>
                  setFilter("new")
                }
              >
                Mới
              </FilterButton>

              <FilterButton
                active={filter === "read"}
                onClick={() =>
                  setFilter("read")
                }
              >
                Đã xem
              </FilterButton>

              <FilterButton
                active={
                  filter === "processing"
                }
                onClick={() =>
                  setFilter("processing")
                }
              >
                Đang xử lý
              </FilterButton>

              <FilterButton
                active={
                  filter === "completed"
                }
                onClick={() =>
                  setFilter("completed")
                }
              >
                Hoàn tất
              </FilterButton>
            </div>

            {/* SEARCH */}
            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Tìm tên, điện thoại, email..."
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 lg:w-80"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">
                  Khách hàng
                </th>

                <th className="px-6 py-4">
                  Điện thoại
                </th>

                <th className="px-6 py-4">
                  Email
                </th>

                <th className="px-6 py-4">
                  Nội dung
                </th>

                <th className="px-6 py-4">
                  Thời gian
                </th>

                <th className="px-6 py-4">
                  Trạng thái
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Không có liên hệ nào.
                  </td>
                </tr>
              ) : (
                filteredMessages.map(
                  (item) => (
                    <tr
                      key={item.id}
                      onClick={() =>
                        openMessage(item)
                      }
                      className={`cursor-pointer transition hover:bg-slate-50 ${
                        item.status === "new"
                          ? "bg-sky-50/40"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {item.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          #{item.id}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <a
                          href={`tel:${item.phone}`}
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                          className="text-slate-700 hover:text-sky-600"
                        >
                          {item.phone}
                        </a>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {item.email || "—"}
                      </td>

                      <td className="max-w-[260px] px-6 py-4">
                        <div className="truncate text-slate-600">
                          {item.message}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                        {formatDateTime(
                          item.created_at
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={item.status}
                        />
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeMessage();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Thông tin liên hệ
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Mã liên hệ #{selectedMessage.id}
                </p>
              </div>

              <button
                type="button"
                onClick={closeMessage}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-6 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Họ và tên"
                  value={selectedMessage.name}
                />

                <InfoItem
                  label="Điện thoại"
                  value={selectedMessage.phone}
                  href={`tel:${selectedMessage.phone}`}
                />

                <InfoItem
                  label="Email"
                  value={
                    selectedMessage.email ||
                    "Không cung cấp"
                  }
                  href={
                    selectedMessage.email
                      ? `mailto:${selectedMessage.email}`
                      : undefined
                  }
                />

                <InfoItem
                  label="Ngôn ngữ"
                  value={
                    selectedMessage.language ===
                    "en"
                      ? "English"
                      : "Tiếng Việt"
                  }
                />

                <InfoItem
                  label="Thời gian"
                  value={formatDateTime(
                    selectedMessage.created_at
                  )}
                />
              </div>

              {/* MESSAGE */}
              <div>
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Nội dung liên hệ
                </div>

                <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                  {selectedMessage.message}
                </div>
              </div>

              {/* STATUS */}
              <div>
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Trạng thái
                </div>

                <select
                  value={selectedMessage.status}
                  onChange={(e) =>
                    updateStatus(
                      selectedMessage.id,
                      e.target.value as ContactMessage["status"]
                    )
                  }
                  disabled={updating}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="new">
                    Mới
                  </option>

                  <option value="read">
                    Đã xem
                  </option>

                  <option value="processing">
                    Đang xử lý
                  </option>

                  <option value="completed">
                    Hoàn tất
                  </option>
                </select>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={closeMessage}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Đóng
              </button>

              <a
                href={`tel:${selectedMessage.phone}`}
                className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Gọi khách
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  active,
  onClick,
  highlight = false,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border bg-white p-6 text-left transition hover:border-slate-300 hover:shadow-sm ${
        active
          ? "border-slate-900 ring-1 ring-slate-900"
          : "border-slate-200"
      }`}
    >
      <div
        className={`text-sm ${
          highlight && value > 0
            ? "font-medium text-sky-600"
            : "text-slate-500"
        }`}
      >
        {label}
      </div>

      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
    </button>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: ContactMessage["status"];
}) {
  const config: Record<
    ContactMessage["status"],
    {
      label: string;
      className: string;
    }
  > = {
    new: {
      label: "Mới",
      className:
        "bg-sky-50 text-sky-700",
    },

    read: {
      label: "Đã xem",
      className:
        "bg-slate-100 text-slate-600",
    },

    processing: {
      label: "Đang xử lý",
      className:
        "bg-amber-50 text-amber-700",
    },

    completed: {
      label: "Hoàn tất",
      className:
        "bg-emerald-50 text-emerald-700",
    },
  };

  const item = config[status];

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function InfoItem({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>

      {href ? (
        <a
          href={href}
          className="mt-1 block text-sm font-medium text-slate-800 hover:text-sky-600"
        >
          {value}
        </a>
      ) : (
        <div className="mt-1 text-sm font-medium text-slate-800">
          {value}
        </div>
      )}
    </div>
  );
}