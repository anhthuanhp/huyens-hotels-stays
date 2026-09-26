"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Footer from "../components/Footer";

type Language = "vi" | "en";

type Activity = {
  id: number;
  title_vi: string;
  title_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  activity_date: string | null;
  hotel_id: number | null;
  status: "active" | "inactive";
  sort_order: number;
  created_at: string;
};

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string | null;
  address_en: string | null;
};

type Media = {
  id: number;
  bucket: string;
  path: string;
  file_name: string;
  public_url: string;
  entity_type: string;
  entity_id: number | null;
  alt_vi: string | null;
  alt_en: string | null;
  is_cover: boolean;
  sort_order: number;
  status: "active" | "inactive";
  created_at: string;
};

const MEDIA_ENTITY_TYPE = "experience";
const FALLBACK_IMAGE = "/images/experience/experience.jpg";

declare global {
  interface WindowEventMap {
    "language-change": CustomEvent<Language>;
  }
}

export default function TraiNghiemPage() {
  const [language, setLanguage] = useState<Language>("vi");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isVi = language === "vi";

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;

    const date = new Date(dateStr);

    if (isVi) {
      return date.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem("huyen-language");

    if (saved === "vi" || saved === "en") {
      setLanguage(saved);
    }

    const handleChange = (e: CustomEvent<Language>) => {
      if (e.detail === "vi" || e.detail === "en") {
        setLanguage(e.detail);
      }
    };

    window.addEventListener("language-change", handleChange);

    return () => {
      window.removeEventListener("language-change", handleChange);
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const [actRes, hotelRes, mediaRes] = await Promise.all([
        supabase
          .from("activities")
          .select(
            "id, title_vi, title_en, description_vi, description_en, activity_date, hotel_id, status, sort_order, created_at"
          )
          .eq("status", "active")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),

        supabase
          .from("hotels")
          .select(
            "id, slug, name_vi, name_en, address_vi, address_en"
          )
          .eq("status", "active")
          .order("id", { ascending: true }),

        supabase
          .from("media")
          .select(
            "id, bucket, path, file_name, public_url, entity_type, entity_id, alt_vi, alt_en, is_cover, sort_order, status, created_at"
          )
          .eq("entity_type", MEDIA_ENTITY_TYPE)
          .eq("status", "active")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
      ]);

      if (actRes.error) {
        console.error("activities:", actRes.error);

        setError(
          isVi
            ? "Không thể tải danh sách hoạt động."
            : "Failed to load experiences."
        );

        setLoading(false);
        return;
      }

      if (hotelRes.error) {
        console.error("hotels:", hotelRes.error);
      }

      if (mediaRes.error) {
        console.error("media:", mediaRes.error);
      }

      setActivities((actRes.data || []) as Activity[]);
      setHotels((hotelRes.data || []) as Hotel[]);
      setMedia((mediaRes.data || []) as Media[]);
      setLoading(false);
    }

    loadData();
  }, []);

  const getActivityMedia = (activityId: number) => {
    const items = media.filter(
      (m) => m.entity_id === activityId
    );

    items.sort((a, b) => {
      if (a.is_cover && !b.is_cover) return -1;
      if (!a.is_cover && b.is_cover) return 1;

      return a.sort_order - b.sort_order;
    });

    return items;
  };

  const getHotel = (hotelId: number | null) => {
    if (!hotelId) return null;

    return hotels.find((h) => h.id === hotelId) || null;
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* BACK LINK */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center px-6 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-sky-600"
          >
            <span aria-hidden="true">←</span>

            <span>
              {isVi ? "Quay về trang chính" : "Back to Main"}
            </span>
          </Link>
        </div>
      </div>

      {/* INTRO */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
              {isVi
                ? "Những trải nghiệm đáng nhớ bắt đầu từ nơi bạn ở."
                : "Memorable experiences begin with where you stay."}
            </h1>

            <p className="mt-6 text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
              {isVi
                ? "Khám phá những hoạt động thú vị, những góc phố đặc trưng và những trải nghiệm đáng nhớ trong hành trình của bạn."
                : "Discover engaging activities, local corners and memorable experiences throughout your journey."}
            </p>
          </div>
        </div>
      </section>

      {/* LIST */}
      <section className="bg-neutral-50 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="py-16 text-center">
              <p className="text-sm text-neutral-500">
                {isVi
                  ? "Đang tải trải nghiệm..."
                  : "Loading experiences..."}
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
              <p className="text-base text-neutral-500">
                {isVi
                  ? "Hiện chưa có hoạt động nào."
                  : "There are currently no experiences available."}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {activities.map((activity) => {
                const actMedia = getActivityMedia(activity.id);
                const cover = actMedia[0];
                const hotel = getHotel(activity.hotel_id);

                const title = isVi
                  ? activity.title_vi
                  : activity.title_en || activity.title_vi;

                const description = isVi
                  ? activity.description_vi
                  : activity.description_en || activity.description_vi;

                const hotelName = hotel
                  ? isVi
                    ? hotel.name_vi
                    : hotel.name_en
                  : null;

                const hotelAddress = hotel
                  ? isVi
                    ? hotel.address_vi
                    : hotel.address_en
                  : null;

                return (
                  <article
                    key={activity.id}
                    className="overflow-hidden rounded-3xl bg-white shadow-sm"
                  >
                    <div className="grid md:grid-cols-2">
                      {/* Ảnh chính */}
                      <div className="relative aspect-[4/3] min-h-[280px] overflow-hidden bg-neutral-200 md:aspect-auto">
                        <Image
                          src={cover?.public_url || FALLBACK_IMAGE}
                          alt={
                            isVi
                              ? cover?.alt_vi || title
                              : cover?.alt_en || title
                          }
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>

                      {/* Nội dung */}
                      <div className="flex flex-col justify-center p-7 sm:p-10">
                        {hotelName && (
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                            {hotelName}
                          </p>
                        )}

                        <h2 className="mt-3 text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl">
                          {title}
                        </h2>

                        {description && (
                          <p className="mt-5 text-base leading-7 text-neutral-600">
                            {description}
                          </p>
                        )}

                        {activity.activity_date && (
                          <p className="mt-5 text-sm text-neutral-400">
                            {formatDate(activity.activity_date)}
                          </p>
                        )}

                        {hotelAddress && (
                          <p className="mt-3 text-sm leading-6 text-neutral-500">
                            {hotelAddress}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Ảnh phụ */}
                    {actMedia.length > 1 && (
                      <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 bg-neutral-50 p-2 sm:grid-cols-3 md:grid-cols-4">
                        {actMedia.slice(1).map((img) => (
                          <div
                            key={img.id}
                            className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-200"
                          >
                            <Image
                              src={img.public_url}
                              alt={
                                isVi
                                  ? img.alt_vi || title
                                  : img.alt_en || title
                              }
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer language={language} />
    </main>
  );
}