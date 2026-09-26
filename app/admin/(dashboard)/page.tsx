
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Booking = {
  id: number;
  booking_code: string;
  full_name: string;
  check_in: string;
  check_out: string;
  status: string;
};

type Visit = {
  session_id: string;
  device_type: string;
  created_at: string;
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);

  const [bookingCount, setBookingCount] = useState(0);
  const [todayCheckIn, setTodayCheckIn] = useState(0);
  const [todayCheckOut, setTodayCheckOut] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  const [visitLoading, setVisitLoading] = useState(true);
  const [todayViews, setTodayViews] = useState(0);
  const [todayVisitors, setTodayVisitors] = useState(0);
  const [sevenDayViews, setSevenDayViews] = useState(0);
  const [sevenDayMobile, setSevenDayMobile] = useState(0);
  const [sevenDayDesktop, setSevenDayDesktop] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      const today = new Date().toISOString().slice(0, 10);

      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(
          "id, booking_code, full_name, check_in, check_out, status"
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const allBookings = bookings ?? [];

      setBookingCount(allBookings.length);

      setTodayCheckIn(
        allBookings.filter(
          (booking) =>
            booking.check_in === today && booking.status !== "cancelled"
        ).length
      );

      setTodayCheckOut(
        allBookings.filter(
          (booking) =>
            booking.check_out === today && booking.status !== "cancelled"
        ).length
      );

      setConfirmedCount(
        allBookings.filter((booking) => booking.status === "confirmed")
          .length
      );

      setRecentBookings(allBookings.slice(0, 5));

      setLoading(false);
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    const loadVisitorStatistics = async () => {
      setVisitLoading(true);

      const now = new Date();

      const startToday = new Date(now);
      startToday.setHours(0, 0, 0, 0);

      const startSevenDays = new Date(startToday);
      startSevenDays.setDate(startSevenDays.getDate() - 6);

      const { data, error } = await supabase
        .from("website_visits")
        .select("session_id, device_type, created_at")
        .gte("created_at", startSevenDays.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Lỗi tải thống kê truy cập:", error);
        setVisitLoading(false);
        return;
      }

      const visits = (data ?? []) as Visit[];

      const todayVisits = visits.filter((visit) => {
        const visitDate = new Date(visit.created_at);
        return visitDate >= startToday;
      });

      const todayVisitorIds = new Set(
        todayVisits.map((visit) => visit.session_id)
      );

      setTodayViews(todayVisits.length);
      setTodayVisitors(todayVisitorIds.size);

      setSevenDayViews(visits.length);

      setSevenDayMobile(
        visits.filter((visit) => visit.device_type === "mobile").length
      );

      setSevenDayDesktop(
        visits.filter((visit) => visit.device_type === "desktop").length
      );

      setVisitLoading(false);
    };

    loadVisitorStatistics();
  }, []);

  const formatDate = (date: string) => {
    if (!date) return "";

    return new Intl.DateTimeFormat("vi-VN").format(
      new Date(`${date}T00:00:00`)
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Tổng quan
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Theo dõi hoạt động đặt phòng của Huyen&apos;s Hotels &amp; Stays.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Tổng đặt phòng"
          value={loading ? "—" : bookingCount}
        />

        <DashboardCard
          title="Check-in hôm nay"
          value={loading ? "—" : todayCheckIn}
        />

        <DashboardCard
          title="Check-out hôm nay"
          value={loading ? "—" : todayCheckOut}
        />

        <DashboardCard
          title="Đã xác nhận"
          value={loading ? "—" : confirmedCount}
        />
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Thống kê truy cập website
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Tổng quan lượt xem và khách truy cập.
            </p>
          </div>

          <Link
            href="/admin/thong-ke"
            className="w-fit rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Xem chi tiết
          </Link>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-5">
          <VisitorCard
            title="Lượt xem hôm nay"
            value={visitLoading ? "—" : todayViews}
            description="Hôm nay"
          />

          <VisitorCard
            title="Khách hôm nay"
            value={visitLoading ? "—" : todayVisitors}
            description="Phiên truy cập duy nhất"
          />

          <VisitorCard
            title="Lượt xem 7 ngày"
            value={visitLoading ? "—" : sevenDayViews}
            description="7 ngày gần nhất"
          />

          <VisitorCard
            title="Mobile"
            value={visitLoading ? "—" : sevenDayMobile}
            description="Lượt xem · 7 ngày"
          />

          <VisitorCard
            title="Desktop"
            value={visitLoading ? "—" : sevenDayDesktop}
            description="Lượt xem · 7 ngày"
          />
        </div>
      </section>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Đặt phòng gần đây
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              5 booking mới nhất
            </p>
          </div>

          <Link
            href="/admin/dat-phong"
            className="text-sm font-medium text-sky-600 hover:text-sky-700"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Mã đặt phòng</th>
                <th className="px-6 py-4">Khách</th>
                <th className="px-6 py-4">Check-in</th>
                <th className="px-6 py-4">Check-out</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {recentBookings.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    Chưa có đặt phòng.
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {booking.booking_code}
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      {booking.full_name}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(booking.check_in)}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(booking.check_out)}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="text-sm text-slate-500">{title}</div>

      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
    </div>
  );
}

function VisitorCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="text-sm text-slate-500">{title}</div>

      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-400">
        {description}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; className: string }
  > = {
    confirmed: {
      label: "Đã xác nhận",
      className: "bg-emerald-50 text-emerald-700",
    },
    pending: {
      label: "Chờ xử lý",
      className: "bg-amber-50 text-amber-700",
    },
    cancelled: {
      label: "Đã hủy",
      className: "bg-red-50 text-red-700",
    },
  };

  const item = config[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}
