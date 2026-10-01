
"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  BrushCleaning,
  ChevronRight,
  ShowerHead,
  Snowflake,
  Tv,
  Wifi,
} from "lucide-react";
import BookingSearch from "./components/BookingSearch";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { HOME_FAQ_GROUPS } from "./data/home-faq";

type Language = "vi" | "en";

type Hotel = {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  address_vi: string | null;
  address_en: string | null;
  description_vi: string | null;
  description_en: string | null;
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

type HotelOTA = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  listing_url: string | null;
  external_hotel_id: string | null;
};

type CustomerReview = {
  id: number;
  guest_name: string;
  rating: number;
  review_vi: string;
  review_en: string | null;
  guest_country: string | null;
};

type HomeClientProps = {
  heroSlides: HeroSlide[];
  hotels: Hotel[];
  hotelCovers: Record<number, string>;
  hotelOTAs: Record<number, HotelOTA[]>;
  customerReviews: CustomerReview[];
};

declare global {
  interface WindowEventMap {
    "language-change": CustomEvent<Language>;
  }
}

const LANGUAGE_KEY = "huyen-language";
const SLIDE_DURATION = 20;

const amenities = [
  {
    titleVi: "Wi-Fi miễn phí",
    titleEn: "Free Wi-Fi",
    icon: Wifi,
  },
  {
    titleVi: "Máy lạnh",
    titleEn: "Air Conditioning",
    icon: Snowflake,
  },
  {
    titleVi: "TV",
    titleEn: "TV",
    icon: Tv,
  },
  {
    titleVi: "Phòng tắm riêng",
    titleEn: "Private Bathroom",
    icon: ShowerHead,
  },
  {
    titleVi: "Thang máy",
    titleEn: "Elevator",
    icon: ArrowUpDown,
  },
  {
    titleVi: "Dọn phòng",
    titleEn: "Housekeeping",
    icon: BrushCleaning,
  },
] as const;

const heroFallbackTexts = [
  {
    titleVi: "Khách sạn, guesthouse & homestay Quận 1 TP.HCM",
    titleEn:
      "Hotels, Guesthouses & Homestays in District 1, Ho Chi Minh City",
    descriptionVi: "Thoải mái theo cách của bạn.",
    descriptionEn: "Comfortable, your way.",
  },
  {
    titleVi: "Một nơi để nghỉ ngơi thật trọn vẹn.",
    titleEn: "A place to truly unwind.",
    descriptionVi:
      "Tận hưởng sự thoải mái theo cách riêng của bạn.",
    descriptionEn: "Enjoy comfort in your own way.",
  },
  {
    titleVi: "Ở gần hơn với những điều bạn yêu thích.",
    titleEn: "Closer to what you love.",
    descriptionVi:
      "Các điểm lưu trú thuận tiện tại TP. Hồ Chí Minh.",
    descriptionEn: "Convenient stays in Ho Chi Minh City.",
  },
  {
    titleVi: "Hành trình của bạn, lựa chọn của bạn.",
    titleEn: "Your journey, your choice.",
    descriptionVi:
      "Khám phá những không gian lưu trú mang dấu ấn Huyen’s.",
    descriptionEn: "Discover stays with the Huyen’s touch.",
  },
];

function buildHeroCss(count: number) {
  if (count <= 1) {
    return "";
  }

  const visible = 100 / count;
  const fade = Math.min(4, visible / 5);

  const pct = (value: number) =>
    `${Math.max(0, Math.min(100, value)).toFixed(2)}%`;

  return `
    @keyframes huyenHeroFade {
      0% {
        opacity: 0;
      }

      ${pct(fade)} {
        opacity: 1;
      }

      ${pct(visible - fade)} {
        opacity: 1;
      }

      ${pct(visible)} {
        opacity: 0;
      }

      100% {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .huyen-hero-slide {
        animation: none !important;
      }

      .huyen-hero-slide:not([data-first="true"]) {
        opacity: 0 !important;
      }
    }
  `;
}

export default function HomeClient({
  heroSlides,
  hotels,
  hotelCovers,
  hotelOTAs,
  customerReviews,
}: HomeClientProps) {
  /*
   * Luôn render "vi" ở lần render đầu tiên để server và client
   * có cùng HTML, tránh hydration mismatch.
   */
  const [language, setLanguage] = useState<Language>("vi");

  const [pickedHotelId, setPickedHotelId] =
    useState<number | null>(null);

  const isVi = language === "vi";

  /*
   * Đồng bộ ngôn ngữ với Header và <html lang>.
   */
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);

      if (saved === "vi" || saved === "en") {
        setLanguage(saved);
      }
    } catch {
      // Giữ mặc định "vi" nếu localStorage không khả dụng.
    }

    const handleLanguageChange = (
      event: CustomEvent<Language>
    ) => {
      if (
        event.detail === "vi" ||
        event.detail === "en"
      ) {
        setLanguage(event.detail);
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

  const t = useCallback(
    <T,>(
      viValue: T | null | undefined,
      enValue: T | null | undefined,
      fallback = ""
    ): T | string => {
      return (isVi ? viValue : enValue) ?? fallback;
    },
    [isVi]
  );

  /*
   * Dữ liệu khách sạn cho BookingSearch.
   */
  const bookingHotels = useMemo(
    () =>
      hotels.map((hotel) => ({
        id: hotel.id,
        slug: hotel.slug,
        name: t(
          hotel.name_vi,
          hotel.name_en
        ) as string,
      })),
    [hotels, t]
  );

  /*
   * Chuẩn hóa OTA một lần.
   * Dữ liệu server đã được sắp xếp theo sort_order.
   */
  const otaByHotel = useMemo(() => {
    const map: Record<number, HotelOTA[]> = {};

    for (const hotel of hotels) {
      map[hotel.id] = (
        hotelOTAs[hotel.id] ?? []
      ).filter(
        (ota) =>
          typeof ota.name === "string" &&
          ota.name.trim().length > 0
      );
    }

    return map;
  }, [hotels, hotelOTAs]);

  const hasAnyOTA = useMemo(
    () =>
      Object.values(otaByHotel).some(
        (list) => list.length > 0
      ),
    [otaByHotel]
  );

  /*
   * Mặc định chọn khách sạn đầu tiên có OTA.
   * Nếu chưa có OTA nào thì chọn khách sạn đầu tiên.
   */
  const selectedHotelId = useMemo(() => {
    if (
      pickedHotelId !== null &&
      hotels.some(
        (hotel) =>
          hotel.id === pickedHotelId
      ) &&
      (otaByHotel[pickedHotelId]?.length ?? 0) >
        0
    ) {
      return pickedHotelId;
    }

    return (
      hotels.find(
        (hotel) =>
          (otaByHotel[hotel.id]?.length ?? 0) >
          0
      )?.id ??
      hotels[0]?.id ??
      null
    );
  }, [
    pickedHotelId,
    hotels,
    otaByHotel,
  ]);

  const selectedHotel = useMemo(
    () =>
      hotels.find(
        (hotel) =>
          hotel.id === selectedHotelId
      ) ?? null,
    [hotels, selectedHotelId]
  );

  const selectedOTAs = useMemo(
    () =>
      selectedHotelId !== null
        ? otaByHotel[selectedHotelId] ?? []
        : [],
    [otaByHotel, selectedHotelId]
  );

  const hotelGridClass = useMemo(() => {
    if (hotels.length >= 4) {
      return "sm:grid-cols-2 lg:grid-cols-4";
    }

    if (hotels.length === 3) {
      return "sm:grid-cols-2 lg:grid-cols-3";
    }

    if (hotels.length === 2) {
      return "sm:grid-cols-2";
    }

    return "sm:grid-cols-1";
  }, [hotels.length]);

  const slideCount = heroSlides.length;

  const perSlide =
    slideCount > 0
      ? SLIDE_DURATION / slideCount
      : SLIDE_DURATION;

  const heroCss = useMemo(
    () => buildHeroCss(slideCount),
    [slideCount]
  );

  return (
    <>
      <div className="bg-white text-neutral-900">
        {/* =====================================================
            HERO
        ====================================================== */}
        <section
          className="px-4 pt-4 sm:px-6 sm:pt-6"
          aria-labelledby="hero-heading"
        >
          <div className="mx-auto max-w-7xl">
            <div
              className="relative h-[320px] overflow-hidden rounded-2xl bg-neutral-900 sm:h-[360px] lg:h-[420px]"
            >
              <Header />

              {heroSlides.length > 0 ? (
                heroSlides.map(
                  (slide, index) => {
                    const fallback =
                      heroFallbackTexts[
                        index %
                          heroFallbackTexts.length
                      ];

                    const title = isVi
                      ? slide.title_vi?.trim() ||
                        fallback.titleVi
                      : slide.title_en?.trim() ||
                        fallback.titleEn;

                    const description =
                      isVi
                        ? slide.description_vi?.trim() ||
                          fallback.descriptionVi
                        : slide.description_en?.trim() ||
                          fallback.descriptionEn;

                    const isFirst =
                      index === 0;

                    /*
                     * Slide đầu chạy ngay.
                     * Các slide sau dùng delay âm để animation
                     * bắt đầu đúng vị trí ngay khi trang mở.
                     */
                    const animationDelay =
                      isFirst
                        ? "0s"
                        : `${index * perSlide - SLIDE_DURATION}s`;

                    return (
                      <div
                        key={slide.id}
                        data-first={
                          isFirst
                            ? "true"
                            : "false"
                        }
                        aria-hidden={
                          isFirst
                            ? undefined
                            : true
                        }
                        className="huyen-hero-slide absolute inset-0"
                        style={
                          slideCount > 1
                            ? {
                                opacity:
                                  isFirst
                                    ? 1
                                    : 0,
                                animation: `huyenHeroFade ${SLIDE_DURATION}s linear ${animationDelay} infinite`,
                              }
                            : {
                                opacity: 1,
                              }
                        }
                      >
                        {slide.image_url && (
                          <Image
                            src={
                              slide.image_url
                            }
                            alt={
                              isFirst
                                ? title ||
                                  "Huyen's Hotels & Stays"
                                : ""
                            }
                            fill
                            preload={isFirst}
                            quality={80}
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) calc(100vw - 32px), 1280px"
                            className="object-cover"
                          />
                        )}

                        <div className="absolute inset-0 z-10 bg-black/25" />

                        <div className="absolute inset-0 z-20 flex items-end px-4 pb-6 sm:px-8 sm:pb-8">
                          <div className="max-w-2xl text-white">
                            {isFirst ? (
                              <h1
                                id="hero-heading"
                                className="text-xl font-bold leading-tight drop-shadow-md sm:text-3xl lg:text-4xl"
                              >
                                {title}
                              </h1>
                            ) : (
                              <p className="text-xl font-bold leading-tight drop-shadow-md sm:text-3xl lg:text-4xl">
                                {title}
                              </p>
                            )}

                            {description && (
                              <p className="mt-2 max-w-xl text-sm drop-shadow-sm sm:mt-3 sm:text-lg">
                                {
                                  description
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )
              ) : (
                <div className="absolute inset-0 flex items-end bg-neutral-800 px-4 pb-6 sm:px-8 sm:pb-8">
                  <div className="max-w-2xl text-white">
                    <h1
                      id="hero-heading"
                      className="text-xl font-bold leading-tight sm:text-3xl lg:text-4xl"
                    >
                      {isVi
                        ? "Huyen's Hotels & Stays"
                        : "Huyen's Hotels & Stays"}
                    </h1>

                    <p className="mt-2 text-sm sm:text-lg">
                      {isVi
                        ? "Thoải mái theo cách của bạn."
                        : "Comfortable, your way."}
                    </p>
                  </div>
                </div>
              )}

              {heroCss && (
                <style
                  dangerouslySetInnerHTML={{
                    __html: heroCss,
                  }}
                />
              )}
            </div>

            <div className="mt-4 w-full">
              <BookingSearch
                hotels={bookingHotels}
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            GIỚI THIỆU
        ====================================================== */}
        <section
          className="px-4 py-12 sm:px-6"
          aria-labelledby="about-heading"
        >
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-[3fr_7fr]">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-sky-600">
                  Huyen&apos;s Hotels &amp;
                  Stays
                </p>

                <h2
                  id="about-heading"
                  className="mt-3 text-2xl font-medium text-sky-800 md:text-3xl"
                >
                  {isVi
                    ? "Mỗi nơi ở, một trải nghiệm riêng"
                    : "Every stay, a unique experience"}
                </h2>
              </div>

              <div>
                <p className="text-base leading-7 text-neutral-600">
                  {isVi ? (
                    <>
                      Chúng tôi phát triển hệ
                      thống khách sạn,
                      homestay &amp; căn hộ
                      dịch vụ tại TP.HCM.
                      <br />
                      Luôn mang đến không
                      gian sạch sẽ, tiện nghi,
                      riêng tư và thuận tiện
                      cho mọi chuyến đi.
                    </>
                  ) : (
                    <>
                      We specialize in
                      operating hotels,
                      homestays, and serviced
                      apartments in Ho Chi Minh
                      City.
                      <br />
                      We are committed to
                      providing clean,
                      comfortable, and private
                      spaces that are
                      convenient for every trip.
                    </>
                  )}
                </p>

                <Link
                  href="/kham-pha-huyens"
                  className="mt-6 flex w-full items-center justify-end font-semibold text-sky-700 hover:text-sky-900"
                >
                  {isVi
                    ? "Tìm hiểu thêm"
                    : "Discover Huyen's"}

                  <span
                    className="ml-2"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            DANH SÁCH LƯU TRÚ
        ====================================================== */}
        <section
          id="hotels"
          className="bg-neutral-50 px-4 py-16 sm:px-6"
          aria-labelledby="stays-heading"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-sky-500">
                {isVi
                  ? "Lưu trú"
                  : "Our Stays"}
              </p>

              <h2
                id="stays-heading"
                className="mt-2 text-2xl font-bold md:text-3xl"
              >
                {isVi
                  ? "Các khách sạn, homestay & căn hộ dịch vụ tại TP.HCM"
                  : "Hotels, Homestays & Serviced Apartments in Ho Chi Minh City"}
              </h2>
            </div>

            {hotels.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
                <p className="text-neutral-500">
                  {isVi
                    ? "Chưa có nơi lưu trú nào hoạt động."
                    : "No active stays yet."}
                </p>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${hotelGridClass}`}
              >
                {hotels.map(
                  (hotel) => {
                    const image =
                      hotelCovers[
                        hotel.id
                      ];

                    const name = t(
                      hotel.name_vi,
                      hotel.name_en
                    ) as string;

                    const address = t(
                      hotel.address_vi,
                      hotel.address_en
                    ) as string;

                    const description =
                      t(
                        hotel.description_vi,
                        hotel.description_en
                      ) as string;

                    const href = `/khach-san/${hotel.slug}`;

                    return (
                      <article
                        key={hotel.id}
                        className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg"
                      >
                        <Link
                          href={href}
                          className="block"
                          aria-label={
                            isVi
                              ? `Xem ${name}`
                              : `View ${name}`
                          }
                        >
                          <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                            {image ? (
                              <Image
                                src={image}
                                alt={name}
                                width={800}
                                height={600}
                                loading="lazy"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                                {isVi
                                  ? "Chưa có ảnh"
                                  : "No image"}
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="flex flex-1 flex-col p-5">
                          {address && (
                            <p className="text-xs uppercase text-neutral-400">
                              {address}
                            </p>
                          )}

                          <Link href={href}>
                            <h3 className="mt-2 text-xl font-semibold transition-colors hover:text-sky-500">
                              {name}
                            </h3>
                          </Link>

                          {description && (
                            <p className="mt-3 line-clamp-3 text-sm text-neutral-500">
                              {description}
                            </p>
                          )}

                          <Link
                            href={href}
                            className="mt-auto pt-4 text-sm font-semibold text-sky-600 hover:text-sky-800"
                          >
                            {isVi
                              ? "Xem chi tiết & đặt phòng →"
                              : "View & Book →"}
                          </Link>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            OTA BOOKING
            GIỮ NGUYÊN OTA TRÊN TRANG HOME
        ====================================================== */}
        {hasAnyOTA && (
          <section
            id="ota-booking"
            className="px-4 py-16 sm:px-6"
            aria-labelledby="ota-heading"
          >
            <div className="mx-auto max-w-7xl">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold tracking-widest text-sky-500">
                  {isVi
                    ? "KÊNH ONLINE - OTAs"
                    : "On OTAs"}
                </p>

                <h2
                  id="ota-heading"
                  className="mt-2 text-2xl font-bold md:text-3xl"
                >
                  {isVi
                    ? "Đặt phòng online"
                    : "Book through our platforms"}
                </h2>

                <p className="mt-3 text-neutral-500">
                  {isVi
                    ? "Chọn nơi lưu trú và đặt phòng qua các kênh online tin cậy."
                    : "Choose your stay and book through your preferred platform."}
                </p>
              </div>

              <div
                className="mt-8 flex gap-2 overflow-x-auto pb-2"
                role="tablist"
                aria-label={
                  isVi
                    ? "Chọn nơi lưu trú"
                    : "Choose a stay"
                }
              >
                {hotels.map(
                  (hotel) => {
                    const isSelected =
                      hotel.id ===
                      selectedHotelId;

                    const otaCount =
                      otaByHotel[
                        hotel.id
                      ]?.length ?? 0;

                    return (
                      <button
                        key={hotel.id}
                        type="button"
                        role="tab"
                        id={`ota-tab-${hotel.id}`}
                        aria-selected={
                          isSelected
                        }
                        aria-controls="ota-panel"
                        disabled={
                          otaCount === 0
                        }
                        onClick={() =>
                          setPickedHotelId(
                            hotel.id
                          )
                        }
                        className={[
                          "shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition",
                          isSelected
                            ? "border-sky-600 bg-sky-600 text-white"
                            : otaCount === 0
                              ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                              : "border-neutral-200 bg-white text-neutral-700 hover:border-sky-300 hover:text-sky-700",
                        ].join(" ")}
                      >
                        {t(
                          hotel.name_vi,
                          hotel.name_en
                        ) as string}
                      </button>
                    );
                  }
                )}
              </div>

              <div
                id="ota-panel"
                className="mt-6"
                role="tabpanel"
                aria-labelledby={
                  selectedHotelId !==
                  null
                    ? `ota-tab-${selectedHotelId}`
                    : undefined
                }
              >
                {selectedHotel && (
                  <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                    {t(
                      selectedHotel.name_vi,
                      selectedHotel.name_en
                    ) as string}
                  </h3>
                )}

                {selectedOTAs.length ===
                0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
                    <p className="text-sm text-neutral-500">
                      {isVi
                        ? "Hiện chưa có nền tảng đặt phòng cho nơi lưu trú này."
                        : "No booking platforms are currently available for this stay."}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {selectedOTAs.map(
                      (ota) => {
                        const href =
                          ota.listing_url ||
                          ota.website ||
                          null;

                        const content = (
                          <>
                            <div className="flex min-w-0 items-center gap-3">
                              {ota.logo ? (
                                <div className="relative h-5 w-12 shrink-0">
                                  <Image
                                    src={
                                      ota.logo
                                    }
                                    alt={
                                      ota.name
                                    }
                                    fill
                                    sizes="48px"
                                    className="object-contain object-left"
                                  />
                                </div>
                              ) : (
                                <div className="h-5 w-12 shrink-0" />
                              )}

                              <span className="truncate text-sm font-semibold text-neutral-800">
                                {ota.name}
                              </span>
                            </div>

                            <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-neutral-400" />
                          </>
                        );

                        if (!href) {
                          return (
                            <div
                              key={
                                ota.id
                              }
                              className="flex items-center rounded-xl border border-neutral-200 bg-white p-4"
                            >
                              {content}
                            </div>
                          );
                        }

                        return (
                          <a
                            key={
                              ota.id
                            }
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-sky-300 hover:shadow-sm"
                          >
                            {content}
                          </a>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            TIỆN NGHI
        ====================================================== */}
        <section
          className="px-4 py-16 sm:px-6"
          aria-labelledby="amenities-heading"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <h2
                id="amenities-heading"
                className="text-2xl font-bold md:text-3xl"
              >
                {isVi
                  ? "Tiện nghi"
                  : "Amenities"}
              </h2>

              <p className="mt-4 text-neutral-500">
                {isVi
                  ? "Phòng đầy đủ tiện nghi, không gian sạch sẽ, vị trí trung tâm dễ di chuyển."
                  : "Fully equipped rooms, clean spaces, central easy-to-reach locations."}
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
              {amenities.map(
                (item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={
                        item.titleVi
                      }
                      className="rounded-xl border border-neutral-100 p-5 transition-colors hover:border-sky-100 hover:bg-sky-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                        <Icon
                          size={20}
                          strokeWidth={
                            1.8
                          }
                        />
                      </div>

                      <h3 className="mt-3 font-medium text-neutral-900">
                        {isVi
                          ? item.titleVi
                          : item.titleEn}
                      </h3>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            ĐÁNH GIÁ
        ====================================================== */}
        <section
          className="bg-neutral-50 px-4 py-16 sm:px-6"
          aria-labelledby="reviews-heading"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-sky-500">
                {isVi
                  ? "Khách hàng"
                  : "Guests"}
              </p>

              <h2
                id="reviews-heading"
                className="mt-2 text-2xl font-bold md:text-3xl"
              >
                {isVi
                  ? "Khách nói về chúng tôi"
                  : "What Guests Say"}
              </h2>
            </div>

            {customerReviews.length === 0 ? (
              <div className="mt-10 rounded-xl border border-dashed border-neutral-200 bg-white p-8 text-center">
                <p className="text-sm text-neutral-500">
                  {isVi
                    ? "Chưa có nhận xét nào."
                    : "No reviews yet."}
                </p>
              </div>
            ) : (
              <div className="relative mt-10">
                <div
                  className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent"
                  aria-label={
                    isVi
                      ? "Danh sách đánh giá của khách hàng"
                      : "Customer reviews"
                  }
                >
                  {customerReviews.map(
                    (review) => {
                      const reviewText = isVi
                        ? review.review_vi
                        : review.review_en?.trim() ||
                          review.review_vi;

                      const rating = Math.max(
                        1,
                        Math.min(
                          5,
                          Number(review.rating) || 5
                        )
                      );

                      return (
                        <article
                          key={
                            review.id
                          }
                          className="w-[85%] shrink-0 snap-start rounded-xl bg-white p-6 shadow-sm sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-48px)/4)]"
                        >
                          <div
                            className="text-amber-400"
                            role="img"
                            aria-label={
                              isVi
                                ? `${rating} trên 5 sao`
                                : `${rating} out of 5 stars`
                            }
                          >
                            {"★".repeat(
                              rating
                            )}
                          </div>

                          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                            &quot;
                            {
                              reviewText
                            }
                            &quot;
                          </p>

                          <div className="mt-4 border-t border-neutral-50 pt-4">
                            <p className="text-sm font-semibold text-neutral-900">
                              {
                                review.guest_name
                              }
                            </p>

                            {review.guest_country && (
                              <p className="mt-1 text-xs text-neutral-400">
                                {
                                  review.guest_country
                                }
                              </p>
                            )}
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>

                {customerReviews.length > 4 && (
                  <p className="mt-2 text-center text-xs text-neutral-400">
                    {isVi
                      ? "Kéo sang để xem thêm đánh giá →"
                      : "Scroll horizontally to see more reviews →"}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
        {/* HỎI ĐÁP TRƯỚC KHI ĐẶT PHÒNG */}
        <section
          id="cau-hoi-thuong-gap"
          className="bg-white px-4 py-16 sm:px-6"
          aria-labelledby="home-faq-heading"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
                {isVi ? "Thông tin dành cho khách lưu trú" : "Guest information"}
              </p>
              <h2
                id="home-faq-heading"
                className="mt-2 text-2xl font-bold text-neutral-900 md:text-3xl"
              >
                {isVi
                  ? "Câu hỏi thường gặp trước khi đặt phòng"
                  : "Frequently asked questions before booking"}
              </h2>
              <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                {isVi
                  ? "Thông tin về đặt phòng, giờ lưu trú, loại phòng, thanh toán, vị trí, tiện nghi và lưu trú dài ngày tại Huyen’s Hotels & Stays."
                  : "Information about booking, stay times, room types, payment, location, amenities, and long stays at Huyen’s Hotels & Stays."}
              </p>
            </div>

            <div className="space-y-3">
              {HOME_FAQ_GROUPS.map((group, groupIndex) => (
                <details
                  key={group.titleEn}
                  className="group overflow-hidden rounded-xl border border-neutral-200 bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-neutral-900 marker:hidden hover:bg-sky-50">
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-800">
                        {groupIndex + 1}
                      </span>
                      <span>{isVi ? group.titleVi : group.titleEn}</span>
                      <span className="text-xs font-normal text-neutral-500">
                        ({group.items.length})
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-xl text-sky-700 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="border-t border-neutral-200 px-2 sm:px-4">
                    {group.items.map((item) => (
                      <details key={item.questionEn} className="group/item border-b border-neutral-100 px-3 py-4 last:border-b-0">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium leading-6 text-neutral-900 marker:hidden">
                          <span>{isVi ? item.questionVi : item.questionEn}</span>
                          <span
                            aria-hidden="true"
                            className="shrink-0 text-lg text-sky-700 transition-transform group-open/item:rotate-45"
                          >
                            +
                          </span>
                        </summary>
                        <p className="mt-3 pr-7 text-sm leading-6 text-neutral-600">
                          {isVi ? item.answerVi : item.answerEn}
                        </p>
                        {group.titleEn === "Location & transport" &&
                          item.questionEn === "Where are Huyen’s hotels located?" && (
                            <ul className="mt-3 space-y-2 pr-7 text-sm leading-6 text-neutral-600">
                              {hotels.map((hotel) => {
                                const address = isVi ? hotel.address_vi : hotel.address_en;
                                if (!address) return null;
                                return (
                                  <li key={hotel.id}>
                                    <Link
                                      href={`/khach-san/${hotel.slug}`}
                                      className="font-medium text-sky-800 hover:underline"
                                    >
                                      {t(hotel.name_vi, hotel.name_en) as string}
                                    </Link>
                                    {`: ${address}`}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                      </details>
                    ))}
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-8 rounded-xl bg-sky-50 p-5 text-sm leading-6 text-neutral-700">
              <p>
                {isVi
                  ? "Cần xác nhận thông tin theo khách sạn hoặc kênh đặt phòng? Gọi "
                  : "Need to confirm details for a hotel or booking channel? Call "}
                <a className="font-semibold text-sky-800 hover:underline" href="tel:+84902095669">
                  +84 902 095 669
                </a>
                {isVi ? " hoặc " : " or "}
                <a className="font-semibold text-sky-800 hover:underline" href="mailto:buihongnhung83@gmail.com">
                  buihongnhung83@gmail.com
                </a>.
              </p>
              <p className="mt-2">
                <Link href="#hotels" className="font-semibold text-sky-800 hover:underline">
                  {isVi ? "Xem các khách sạn và địa chỉ →" : "View hotels and addresses →"}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
