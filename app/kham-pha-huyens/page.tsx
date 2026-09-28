
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type Language = "vi" | "en";

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string | null;
  address_vi: string | null;
  address_en: string | null;
};

type HeroSlide = {
  id: number;
  position: number;
  image_url: string | null;
  title_vi: string | null;
  title_en: string | null;
  description_vi: string | null;
  description_en: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;

export default function KhamPhaHuyensPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "vi";
    }

    const savedLanguage = localStorage.getItem("huyen-language");

    return savedLanguage === "vi" || savedLanguage === "en"
      ? savedLanguage
      : "vi";
  });

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  const isVi = language === "vi";

  // =========================================================
  // ĐỒNG BỘ NGÔN NGỮ
  // =========================================================

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<Language>;

      if (
        customEvent.detail === "vi" ||
        customEvent.detail === "en"
      ) {
        setLanguage(customEvent.detail);
      }
    };

    window.addEventListener(
      "language-change",
      handleLanguageChange
    );

    return () => {
      window.removeEventListener(
        "language-change",
        handleLanguageChange
      );
    };
  }, []);

  // =========================================================
  // THAY ĐỔI NGÔN NGỮ
  // =========================================================

  const handleSetLanguage = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem("huyen-language", newLang);

    window.dispatchEvent(
      new CustomEvent("language-change", {
        detail: newLang,
      })
    );
  };

  // =========================================================
  // TẢI HERO + DANH SÁCH KHÁCH SẠN
  // =========================================================

  useEffect(() => {
    async function loadData() {
      if (!supabase) {
        console.error(
          "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
        );
        setLoading(false);
        return;
      }

      try {
        // ---------------------------------------------------
        // HERO
        // Dùng đúng nguồn dữ liệu với trang chủ:
        // hero_slides → active → position ASC
        // ---------------------------------------------------

        const {
          data: heroData,
          error: heroError,
        } = await supabase
          .from("hero_slides")
          .select(
            `
              id,
              position,
              image_url,
              title_vi,
              title_en,
              description_vi,
              description_en
            `
          )
          .eq("status", "active")
          .order("position", {
            ascending: true,
          });

        if (heroError) {
          console.error(
            "Load Hero slides error:",
            heroError
          );
        }

        setHeroSlides(
          (heroData ?? []) as HeroSlide[]
        );

        // ---------------------------------------------------
        // KHÁCH SẠN
        // ---------------------------------------------------

        const {
          data: hotelData,
          error: hotelError,
        } = await supabase
          .from("hotels")
          .select(
            "id, slug, name_vi, name_en, address_vi, address_en"
          )
          .eq("status", "active")
          .order("created_at", {
            ascending: true,
          });

        if (hotelError) {
          console.error(
            "Load hotels error:",
            hotelError
          );
        }

        setHotels(
          (hotelData ?? []) as Hotel[]
        );
      } catch (error) {
        console.error(
          "Load Huyen's page error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* HEADER */}
      <header className="border-b border-neutral-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="block">
            <div
              className="text-xl font-semibold tracking-tight text-blue-900"
              style={{
                fontFamily:
                  'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
              }}
            >
              Huyen&apos;s
            </div>

            <div className="mt-0.5 text-[10px] tracking-[0.25em] text-neutral-400">
              HOTELS &amp; STAYS
            </div>
          </Link>

          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="text-sm font-medium text-neutral-600 transition hover:text-blue-900"
            >
              {isVi ? "Trang chủ" : "Home"}
            </Link>

            <div className="flex items-center text-sm">
              <button
                type="button"
                onClick={() => handleSetLanguage("vi")}
                className={`font-medium transition ${
                  isVi
                    ? "text-blue-900"
                    : "text-neutral-400 hover:text-blue-900"
                }`}
              >
                VI
              </button>

              <span className="mx-2 text-neutral-300">
                |
              </span>

              <button
                type="button"
                onClick={() => handleSetLanguage("en")}
                className={`font-medium transition ${
                  !isVi
                    ? "text-blue-900"
                    : "text-neutral-400 hover:text-blue-900"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="px-6 pb-16 pt-16 md:pb-20 md:pt-20">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-sky-600">
              Huyen&apos;s Hotels &amp; Stays
            </p>

            <h1
              className="mt-4 text-3xl font-medium leading-tight tracking-tight text-blue-900 md:text-5xl"
              style={{
                fontFamily:
                  'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
              }}
            >
              {isVi
                ? "Huyen's Hotels & Stays – Hệ thống lưu trú tại TP.HCM"
                : "Huyen's Hotels & Stays – Stays in Ho Chi Minh City"}
            </h1>
          </div>

          {/* ẢNH HERO - LẤY TRỰC TIẾP TỪ hero_slides */}
          <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-4">
            {heroSlides.length > 0 ? (
              heroSlides.slice(0, 4).map((slide, index) => {
                if (!slide.image_url) {
                  return null;
                }

                return (
                  <div
                    key={slide.id}
                    className="relative h-24 overflow-hidden rounded-sm md:h-32"
                  >
                    <Image
                      src={slide.image_url}
                      alt={
                        isVi
                          ? slide.title_vi ||
                            "Huyen's Hotels & Stays"
                          : slide.title_en ||
                            slide.title_vi ||
                            "Huyen's Hotels & Stays"
                      }
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      priority={index === 0}
                      unoptimized
                    />
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 flex h-24 items-center justify-center bg-neutral-50 text-sm text-neutral-400 md:col-span-4 md:h-32">
                {isVi
                  ? "Đang tải hình ảnh..."
                  : "Loading images..."}
              </div>
            )}
          </div>

          <p className="mt-8 text-lg leading-8 text-neutral-600 md:text-xl">
            {isVi
              ? "Nơi mỗi hành trình bắt đầu, và mỗi không gian mang một dấu ấn riêng."
              : "Where every journey begins, and every space has its own character."}
          </p>

          <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-500">
            {isVi
              ? "Huyen's Hotels & Stays phát triển hệ thống khách sạn, guesthouse và homestay với định hướng tạo nên những không gian lưu trú tiện nghi, riêng tư và thuận tiện cho mỗi hành trình."
              : "Huyen's Hotels & Stays develops a collection of hotels, guesthouses and homestays, creating comfortable, private and convenient spaces for every journey."}
          </p>
        </div>
      </section>

      {/* GIỚI THIỆU */}
      <section className="border-t border-neutral-100 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-[3fr_7fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-sky-600">
                {isVi ? "Về Huyen's" : "About Huyen's"}
              </p>

              <h2
                className="mt-3 text-2xl font-medium leading-snug tracking-tight text-blue-900 md:text-3xl"
                style={{
                  fontFamily:
                    'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
                }}
              >
                {isVi
                  ? "Những nơi rất riêng"
                  : "Places with their own character"}
              </h2>
            </div>

            <div className="space-y-5 text-base leading-7 text-neutral-600">
              <p>
                {isVi
                  ? "Huyen's Hotels & Stays là hệ thống lưu trú được phát triển với mong muốn mang đến những không gian phù hợp cho nhiều nhu cầu khác nhau của khách hàng."
                  : "Huyen's Hotels & Stays is a growing hospitality collection created to provide spaces that suit different needs and journeys."}
              </p>

              <p>
                {isVi
                  ? "Từ khách sạn, guesthouse đến homestay, mỗi cơ sở được xây dựng với một phong cách và dấu ấn riêng, nhưng cùng hướng đến sự tiện nghi, riêng tư và thuận tiện trong suốt thời gian lưu trú."
                  : "From hotels and guesthouses to homestays, each property has its own style and character while sharing the same focus on comfort, privacy and convenience."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CÂU CHUYỆN */}
      <section className="bg-neutral-50 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-[3fr_7fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-sky-600">
                {isVi ? "Câu chuyện" : "Our Story"}
              </p>

              <h2
                className="mt-3 text-2xl font-medium leading-snug tracking-tight text-blue-900 md:text-3xl"
                style={{
                  fontFamily:
                    'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
                }}
              >
                {isVi ? (
                  <>
                    Từ những nơi
                    <br />
                    để ở
                  </>
                ) : (
                  <>
                    From places
                    <br />
                    to stay
                  </>
                )}
              </h2>
            </div>

            <div className="space-y-5 text-base leading-7 text-neutral-600">
              <p>
                {isVi
                  ? "Huyen's bắt đầu từ mong muốn xây dựng những nơi lưu trú gần gũi, thuận tiện và phù hợp với nhịp sống của từng thành phố."
                  : "Huyen's began with a simple desire to create stays that feel welcoming, convenient and connected to the rhythm of each city."}
              </p>

              <p>
                {isVi
                  ? "Mỗi cơ sở là một câu chuyện riêng, một không gian riêng và một cách riêng để khách hàng cảm nhận về chuyến đi của mình."
                  : "Each property has its own story, its own space and its own way of becoming part of a guest's journey."}
              </p>

              <p>
                {isVi
                  ? "Từ đó, Huyen's từng bước phát triển thành một hệ thống lưu trú có nhiều loại hình, nhiều không gian và nhiều lựa chọn hơn cho khách hàng."
                  : "From there, Huyen's continues to grow into a hospitality collection with different property types, spaces and choices for our guests."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRIẾT LÝ */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-[3fr_7fr] md:gap-16">
            <div className="md:pr-8">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-sky-600">
                {isVi
                  ? "Điều chúng tôi hướng đến"
                  : "What We Believe In"}
              </p>

              <h2
                className="mt-4 text-3xl font-medium leading-tight tracking-tight text-blue-900 md:text-4xl"
                style={{
                  fontFamily:
                    'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
                }}
              >
                {isVi
                  ? "Không gian có dấu ấn"
                  : "Spaces with character"}
              </h2>
            </div>

            <div className="border-t border-neutral-200">
              {/* Value 1 */}
              <div className="grid gap-5 border-b border-neutral-200 py-7 md:grid-cols-[48px_220px_1fr] md:items-center">
                <div className="flex h-10 w-10 items-center justify-center text-sky-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.5 10.5 12 3l8.5 7.5"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.5 9.5V20h13V9.5M9.5 20v-6h5v6"
                    />
                  </svg>
                </div>

                <p
                  className="text-xl font-medium text-blue-900 md:text-2xl"
                  style={{
                    fontFamily:
                      'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
                  }}
                >
                  {isVi
                    ? "Không gian có dấu ấn"
                    : "Spaces with character"}
                </p>

                <p className="text-sm leading-7 text-neutral-500 md:text-base">
                  {isVi
                    ? "Mỗi nơi lưu trú mang một cá tính riêng, từ cách bố trí không gian đến những chi tiết tạo nên cảm giác khác biệt."
                    : "Every property has its own personality, from its layout to the details that make the experience feel distinctive."}
                </p>
              </div>

              {/* Value 2 */}
              <div className="grid gap-5 border-b border-neutral-200 py-7 md:grid-cols-[48px_220px_1fr] md:items-center">
                <div className="flex h-10 w-10 items-center justify-center text-sky-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 4.5C13 4.5 6.5 6.5 5 12c-.9 3.3 1.2 6.5 4.8 6.5 4.9 0 8.9-4.9 9.7-14Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.5 18.5c2.2-3 4.7-5.1 8-6.8"
                    />
                  </svg>
                </div>

                <h3
                  className="text-xl font-medium text-blue-900 md:text-2xl"
                  style={{
                    fontFamily:
                      'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
                  }}
                >
                  {isVi
                    ? "Trải nghiệm tự nhiên"
                    : "A natural experience"}
                </h3>

                <p className="text-sm leading-7 text-neutral-500 md:text-base">
                  {isVi
                    ? "Sự thoải mái đến từ những điều vừa đủ: tiện nghi cần thiết, sự riêng tư và một không gian dễ dàng để tận hưởng."
                    : "Comfort comes from having just what is needed: essential amenities, privacy and a space that feels easy to enjoy."}
                </p>
              </div>

              {/* Value 3 */}
              <div className="grid gap-5 border-b border-neutral-200 py-7 md:grid-cols-[48px_220px_1fr] md:items-center">
                <div className="flex h-10 w-10 items-center justify-center text-sky-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-6 w-6"
                  >
                    <circle cx="7.5" cy="12" r="3.5" />
                    <circle cx="16.5" cy="12" r="3.5" />
                    <path
                      strokeLinecap="round"
                      d="M10.5 12h3"
                    />
                  </svg>
                </div>

                <h3
                  className="text-xl font-medium text-blue-900 md:text-2xl"
                  style={{
                    fontFamily:
                      'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
                  }}
                >
                  {isVi ? "Sự kết nối" : "Connection"}
                </h3>

                <p className="text-sm leading-7 text-neutral-500 md:text-base">
                  {isVi
                    ? "Giữa con người, không gian và hành trình — để mỗi kỳ lưu trú trở thành một phần tự nhiên của chuyến đi."
                    : "Between people, spaces and journeys — allowing every stay to become a natural part of the trip."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HỆ THỐNG */}
      <section className="border-t border-neutral-100 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-[3fr_7fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-sky-600">
                {isVi ? "Hệ thống" : "Our Collection"}
              </p>

              <h2
                className="mt-3 text-2xl font-medium leading-snug tracking-tight text-blue-900 md:text-3xl"
                style={{
                  fontFamily:
                    'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
                }}
              >
                {isVi
                  ? "Hệ thống Huyen's"
                  : "Huyen's Collection"}
              </h2>
            </div>

            <div className="divide-y divide-neutral-200">
              {loading ? (
                <p className="py-5 text-sm text-neutral-500">
                  {isVi ? "Đang tải..." : "Loading..."}
                </p>
              ) : hotels.length > 0 ? (
                hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="py-5 first:pt-0 last:pb-0"
                  >
                    <h3
                      className="cursor-pointer text-lg font-medium text-neutral-900 transition hover:text-sky-600"
                      style={{
                        fontFamily:
                          'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
                      }}
                      onClick={() =>
                        router.push(
                          `/khach-san/${hotel.slug}`
                        )
                      }
                    >
                      {isVi
                        ? hotel.name_vi
                        : hotel.name_en ||
                          hotel.name_vi}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-neutral-500">
                      {isVi
                        ? hotel.address_vi ||
                          "Đang cập nhật"
                        : hotel.address_en ||
                          hotel.address_vi ||
                          "Coming soon"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-5 text-sm text-neutral-500">
                  {isVi
                    ? "Hệ thống khách sạn đang được cập nhật."
                    : "Our hotel collection is being updated."}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TRẢI NGHIỆM */}
      <section className="bg-neutral-50 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-[3fr_7fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-sky-600">
                {isVi ? "Trải nghiệm" : "Experience"}
              </p>

              <h2
                className="mt-3 text-2xl font-medium leading-snug tracking-tight text-blue-900 md:text-3xl"
                style={{
                  fontFamily:
                    'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
                }}
              >
                {isVi ? (
                  <>
                    Một nơi để
                    <br />
                    cảm thấy thoải mái
                  </>
                ) : (
                  <>
                    A place to
                    <br />
                    feel comfortable
                  </>
                )}
              </h2>
            </div>

            <div className="space-y-5 text-base leading-7 text-neutral-600">
              <p>
                {isVi
                  ? "Chúng tôi chú trọng những điều tạo nên một kỳ lưu trú dễ chịu: vị trí thuận tiện, không gian phù hợp, sự riêng tư và những tiện nghi cần thiết."
                  : "We focus on the things that make a stay comfortable: convenient locations, suitable spaces, privacy and the essential amenities guests need."}
              </p>

              <p>
                {isVi
                  ? "Dù là một chuyến công tác, một kỳ nghỉ ngắn ngày hay một hành trình khám phá thành phố, Huyen's hướng đến việc mang lại một nơi ở thoải mái để khách hàng có thể tận hưởng hành trình của mình."
                  : "Whether it is a business trip, a short getaway or a city adventure, Huyen's aims to provide a comfortable place where guests can enjoy their journey."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TẦM NHÌN & SỨ MỆNH */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="border-t border-neutral-200 pt-6">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-sky-600">
                {isVi ? "Tầm nhìn" : "Vision"}
              </p>

              <h2
                className="mt-3 text-2xl font-medium text-blue-900"
                style={{
                  fontFamily:
                    'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
                }}
              >
                {isVi
                  ? "Trở thành hệ thống lưu trú được tin chọn"
                  : "To become a trusted hospitality collection"}
              </h2>

              <p className="mt-4 text-sm leading-7 text-neutral-600">
                {isVi
                  ? "Huyen's hướng đến việc xây dựng một hệ thống lưu trú có mặt tại nhiều địa điểm, với nhiều loại hình và phong cách khác nhau, nhưng luôn giữ được sự nhất quán trong trải nghiệm khách hàng."
                  : "Huyen's aims to build a hospitality collection across different locations, property types and styles while maintaining consistency in the guest experience."}
              </p>
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-sky-600">
                {isVi ? "Sứ mệnh" : "Mission"}
              </p>

              <h2
                className="mt-3 text-2xl font-medium text-blue-900"
                style={{
                  fontFamily:
                    'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
                }}
              >
                {isVi
                  ? "Tạo nên những nơi ở đáng nhớ"
                  : "Creating memorable places to stay"}
              </h2>

              <p className="mt-4 text-sm leading-7 text-neutral-600">
                {isVi
                  ? "Mang đến những không gian lưu trú tiện nghi, riêng tư và thuận tiện, giúp mỗi khách hàng có một trải nghiệm phù hợp với hành trình của mình."
                  : "To create comfortable, private and convenient stays that fit each guest's journey and create memorable experiences."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PHÁT TRIỂN */}
      <section className="bg-neutral-50 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-[3fr_7fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-sky-600">
                {isVi
                  ? "Hành trình phía trước"
                  : "Looking Ahead"}
              </p>

              <h2
                className="mt-3 text-2xl font-medium leading-snug tracking-tight text-blue-900 md:text-3xl"
                style={{
                  fontFamily:
                    'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
                }}
              >
                {isVi
                  ? "Tiếp tục mở rộng"
                  : "Continuing to grow"}
              </h2>
            </div>

            <div className="text-base leading-7 text-neutral-600">
              <p>
                {isVi
                  ? "Huyen's tiếp tục tìm kiếm những địa điểm và mô hình lưu trú phù hợp để mở rộng hệ thống trong tương lai."
                  : "Huyen's continues to explore suitable locations and hospitality models as the collection grows in the future."}
              </p>

              <p className="mt-5">
                {isVi
                  ? "Mục tiêu là xây dựng một hệ thống đa dạng nhưng nhất quán, nơi mỗi cơ sở đều có cá tính riêng và cùng tạo nên một trải nghiệm Huyen's."
                  : "The goal is to build a diverse yet consistent collection, where every property has its own personality while contributing to one Huyen's experience."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-200 bg-white px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div
                className="text-lg font-semibold text-blue-900"
                style={{
                  fontFamily:
                    'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
                }}
              >
                Huyen&apos;s
              </div>

              <p className="mt-1 text-xs tracking-[0.2em] text-neutral-400">
                HOTELS &amp; STAYS
              </p>

              <div className="mt-5 text-sm leading-6 text-neutral-500">
                {isVi ? (
                  <>
                    <p>Công ty TNHH Huyen Group</p>
                    <p>
                      Địa chỉ: 18A/139 Nguyễn Thị Minh Khai,
                      <br />
                      Sài Gòn, Hồ Chí Minh
                    </p>
                  </>
                ) : (
                  <>
                    <p>Huyen Group Service Co.,Ltd</p>
                    <p>
                      Address: 18A/139 Nguyen Thi Minh Khai,
                      <br />
                      Sai Gon, Ho Chi Minh
                    </p>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                {isVi ? "Chính sách" : "Policies"}
              </h3>

              <div className="mt-4 space-y-2 text-sm text-neutral-500">
                <a
                  href="/chinh-sach-thanh-toan"
                  className="block transition hover:text-blue-900"
                >
                  {isVi
                    ? "Chính sách thanh toán"
                    : "Payment Policy"}
                </a>

                <a
                  href="/chinh-sach-hoan-huy"
                  className="block transition hover:text-blue-900"
                >
                  {isVi
                    ? "Chính sách hoàn hủy"
                    : "Cancellation & Refund Policy"}
                </a>

                <a
                  href="/chinh-sach-bao-mat"
                  className="block transition hover:text-blue-900"
                >
                  {isVi
                    ? "Chính sách bảo mật"
                    : "Privacy Policy"}
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                {isVi ? "Liên hệ" : "Contact"}
              </h3>

              <div className="mt-4 space-y-2 text-sm text-neutral-500">
                <p>
                  Hotline:{" "}
                  <a
                    href="tel:+84902095669"
                    className="transition hover:text-blue-900"
                  >
                    +84 902095669
                  </a>
                </p>

                <p>
                  WhatsApp:{" "}
                  <a
                    href="https://wa.me/84902095669"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-blue-900"
                  >
                    +84 902095669
                  </a>
                </p>

                <p>
                  Zalo:{" "}
                  <a
                    href="https://zalo.me/84902095669"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-blue-900"
                  >
                    +84 902095669
                  </a>
                </p>

                <p>
                  Email:{" "}
                  <a
                    href="mailto:buihongnhung83@gmail.com"
                    className="transition hover:text-blue-900"
                  >
                    buihongnhung83@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-neutral-100 pt-6">
            <div className="text-xs text-neutral-400">
              {isVi
                ? "Đã thông báo Bộ Công Thương"
                : "Notified to the Ministry of Industry and Trade"}
            </div>
          </div>

          <div className="mt-6 text-xs text-neutral-400">
            © {new Date().getFullYear()} Huyen Group. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
