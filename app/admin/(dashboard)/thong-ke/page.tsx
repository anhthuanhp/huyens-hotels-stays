"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Visit = {
  id: number;
  session_id: string;
  page_path: string;
  hotel_slug: string | null;
  device_type: string;
  created_at: string;
};

type StatCardProps = {
  title: string;
  value: string | number;
};

export default function VisitorStatisticsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadVisits = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("website_visits")
        .select(
          "id, session_id, page_path, hotel_slug, device_type, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(10000);

      if (!mounted) return;

      if (error) {
        console.error("Lỗi tải thống kê truy cập:", error);
        setVisits([]);
        setLoading(false);
        return;
      }

      setVisits((data ?? []) as Visit[]);
      setLoading(false);
    };

    loadVisits();

    return () => {
      mounted = false;
    };
  }, []);

  const statistics = useMemo(() => {
    const now = new Date();

    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);

    const start7Days = new Date(now);
    start7Days.setDate(start7Days.getDate() - 6);
    start7Days.setHours(0, 0, 0, 0);

    const start30Days = new Date(now);
    start30Days.setDate(start30Days.getDate() - 29);
    start30Days.setHours(0, 0, 0, 0);

    const todayVisits = visits.filter(
      (visit) => new Date(visit.created_at) >= startToday
    );

    const sevenDayVisits = visits.filter(
      (visit) => new Date(visit.created_at) >= start7Days
    );

    const thirtyDayVisits = visits.filter(
      (visit) => new Date(visit.created_at) >= start30Days
    );

    const todayVisitors = new Set(
      todayVisits.map((visit) => visit.session_id)
    ).size;

    const sevenDayVisitors = new Set(
      sevenDayVisits.map((visit) => visit.session_id)
    ).size;

    const thirtyDayVisitors = new Set(
      thirtyDayVisits.map((visit) => visit.session_id)
    ).size;

    const mobile = thirtyDayVisits.filter(
      (visit) => visit.device_type === "mobile"
    ).length;

    const desktop = thirtyDayVisits.filter(
      (visit) => visit.device_type === "desktop"
    ).length;

    const pageCounts = new Map<string, number>();

    for (const visit of thirtyDayVisits) {
      pageCounts.set(
        visit.page_path,
        (pageCounts.get(visit.page_path) ?? 0) + 1
      );
    }

    const popularPages = Array.from(pageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const hotelCounts = new Map<string, number>();

    for (const visit of thirtyDayVisits) {
      if (!visit.hotel_slug) continue;

      hotelCounts.set(
        visit.hotel_slug,
        (hotelCounts.get(visit.hotel_slug) ?? 0) + 1
      );
    }

    const popularHotels = Array.from(hotelCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const daily = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start7Days);
      date.setDate(start7Days.getDate() + index);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dayVisits = sevenDayVisits.filter((visit) => {
        const visitDate = new Date(visit.created_at);

        return visitDate >= date && visitDate < nextDate;
      });

      const visitors = new Set(
        dayVisits.map((visit) => visit.session_id)
      ).size;

      return {
        date,
        views: dayVisits.length,
        visitors,
      };
    });

    return {
      todayViews: todayVisits.length,
      todayVisitors,
      sevenDayViews: sevenDayVisits.length,
      sevenDayVisitors,
      thirtyDayViews: thirtyDayVisits.length,
      thirtyDayVisitors,
      mobile,
      desktop,
      popularPages,
      popularHotels,
      daily,
    };
  }, [visits]);

  const maxDailyViews = Math.max(
    ...statistics.daily.map((item) => item.views),
    1
  );

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }).format(date);

  const formatPage = (path: string) => {
    if (path === "/") {
      return "Trang chủ";
    }

    return path;
  };

  const formatHotel = (slug: string) => {
    const hotelNames: Record<string, string> = {
      "anh-kim-hotel": "Anh Kim Hotel",
      "ae-guesthouse": "A&E Guesthouse",
      "huyen-house": "Huyen House",
      huyenhomestay: "Huyen Homestay",
    };

    return hotelNames[slug] ?? slug;
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Thống kê truy cập
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Theo dõi lượt xem và khách truy cập website.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          title="Lượt xem hôm nay"
          value={loading ? "—" : statistics.todayViews}
        />

        <StatCard
          title="Khách hôm nay"
          value={loading ? "—" : statistics.todayVisitors}
        />

        <StatCard
          title="Lượt xem 7 ngày"
          value={loading ? "—" : statistics.sevenDayViews}
        />

        <StatCard
          title="Khách 7 ngày"
          value={loading ? "—" : statistics.sevenDayVisitors}
        />

        <StatCard
          title="Lượt xem 30 ngày"
          value={loading ? "—" : statistics.thirtyDayViews}
        />

        <StatCard
          title="Khách 30 ngày"
          value={loading ? "—" : statistics.thirtyDayVisitors}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Mobile — 30 ngày"
          value={loading ? "—" : statistics.mobile}
        />

        <StatCard
          title="Desktop — 30 ngày"
          value={loading ? "—" : statistics.desktop}
        />
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">
          Lượt xem trong 7 ngày
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Lượt xem và khách truy cập theo từng ngày.
        </p>

        <div className="mt-8 flex h-64 items-end gap-2 sm:gap-4">
          {statistics.daily.map((item) => {
            const height =
              item.views === 0
                ? 4
                : Math.max(
                    12,
                    Math.round(
                      (item.views / maxDailyViews) * 200
                    )
                  );

            return (
              <div
                key={item.date.toISOString()}
                className="flex min-w-0 flex-1 flex-col items-center justify-end"
              >
                <div className="mb-2 text-xs font-medium text-slate-600">
                  {item.views}
                </div>

                <div
                  className="w-full max-w-12 rounded-t-lg bg-sky-500"
                  style={{ height: `${height}px` }}
                />

                <div className="mt-2 text-[10px] text-slate-400 sm:text-xs">
                  {formatDate(item.date)}
                </div>

                <div className="mt-1 text-[10px] text-slate-400">
                  {item.visitors} khách
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-semibold text-slate-900">
              Trang được xem nhiều
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Trong 30 ngày gần nhất.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {statistics.popularPages.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-400">
                Chưa có dữ liệu.
              </div>
            ) : (
              statistics.popularPages.map(([path, count]) => (
                <div
                  key={path}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="min-w-0 truncate text-sm text-slate-700">
                    {formatPage(path)}
                  </div>

                  <div className="shrink-0 text-sm font-semibold text-slate-900">
                    {count}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-semibold text-slate-900">
              Khách sạn được xem nhiều
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Trong 30 ngày gần nhất.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {statistics.popularHotels.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-400">
                Chưa có dữ liệu.
              </div>
            ) : (
              statistics.popularHotels.map(([slug, count]) => (
                <div
                  key={slug}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="min-w-0 truncate text-sm text-slate-700">
                    {formatHotel(slug)}
                  </div>

                  <div className="shrink-0 text-sm font-semibold text-slate-900">
                    {count}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm text-slate-500">{title}</div>

      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
    </div>
  );
}