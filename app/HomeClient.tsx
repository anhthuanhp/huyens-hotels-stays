"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  ArrowUpDown,
  BrushCleaning,
  Snowflake,
  ShowerHead,
  Tv,
  Wifi,
  ChevronRight,
} from "lucide-react";
import BookingSearch from "./components/BookingSearch";
import Header from "./components/Header";
import Footer from "./components/Footer";

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
  sort_order: number;
};

type HomeClientProps = {
  heroSlides: HeroSlide[];
  hotels: Hotel[];
  hotelCovers: Record<number, string>;
  hotelOTAs: Record<number, HotelOTA[]>;
};

declare global {
  interface WindowEventMap {
    "language-change": CustomEvent<Language>;
  }
}

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

const customerReviews = [
  {
    id: 1,
    nameVi: "Khách hàng",
    nameEn: "Guest",
    reviewVi:
      "Không gian sạch sẽ, vị trí thuận tiện và quá trình nhận phòng rất nhanh chóng.",
    reviewEn:
      "The room was clean, the location was convenient and check-in was very smooth.",
    rating: 5,
  },
  {
    id: 2,
    nameVi: "Khách hàng",
    nameEn: "Guest",
    reviewVi:
      "Phòng thoải mái, riêng tư và phù hợp cho chuyến đi ngắn ngày.",
    reviewEn:
      "The room was comfortable and private, perfect for a short stay.",
    rating: 5,
  },
  {
    id: 3,
    nameVi: "Khách hàng",
    nameEn: "Guest",
    reviewVi:
      "Nhân viên hỗ trợ nhiệt tình. Tôi sẽ cân nhắc quay lại trong những chuyến đi tiếp theo.",
    reviewEn:
      "The support was friendly and helpful. I would consider staying again on my next trip.",
    rating: 5,
  },
  {
    id: 4,
    nameVi: "Khách hàng",
    nameEn: "Guest",
    reviewVi:
      "Không gian yên tĩnh, phòng đầy đủ tiện nghi và mọi thứ đều rất thuận tiện.",
    reviewEn:
      "The space was quiet, the room had everything we needed and the stay was very convenient.",
    rating: 5,
  },
] as const;

const SLIDE_DURATION = 20;

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
    descriptionEn:
      "Enjoy comfort in your own way.",
  },
  {
    titleVi: "Ở gần hơn với những điều bạn yêu thích.",
    titleEn: "Closer to what you love.",
    descriptionVi:
      "Các điểm lưu trú thuận tiện tại TP. Hồ Chí Minh.",
    descriptionEn:
      "Convenient stays in Ho Chi Minh City.",
  },
  {
    titleVi: "Hành trình của bạn, lựa chọn của bạn.",
    titleEn: "Your journey, your choice.",
    descriptionVi:
      "Khám phá những không gian lưu trú mang dấu ấn Huyen’s.",
    descriptionEn:
      "Discover stays with the Huyen’s touch.",
  },
] as const;

export default function HomeClient({
  heroSlides,
  hotels,
  hotelCovers,
  hotelOTAs,
}: HomeClientProps) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "vi";
    }

    const saved = localStorage.getItem("huyen-language");

    return saved === "vi" || saved === "en"
      ? saved
      : "vi";
  });

  const [selectedHotelId, setSelectedHotelId] =
    useState<number | null>(
      hotels.length > 0
        ? hotels[0].id
        : null
    );

  const isVi = language === "vi";

  const t = useCallback(
    <T,>(
      viVal: T | null | undefined,
      enVal: T | null | undefined,
      fallback = ""
    ) => (isVi ? viVal : enVal) ?? fallback,
    [isVi]
  );

  const bookingHotels = useMemo(
    () =>
      hotels.map((hotel) => ({
        id: hotel.id,
        slug: hotel.slug,
        name: t(
          hotel.name_vi,
          hotel.name_en
        ),
      })),
    [hotels, t]
  );

  const selectedHotel = useMemo(
    () =>
      hotels.find(
        (hotel) =>
          hotel.id === selectedHotelId
      ) ?? null,
    [hotels, selectedHotelId]
  );

  const selectedOTAs = useMemo(() => {
    if (selectedHotelId === null) {
      return [];
    }

    return (
      hotelOTAs[selectedHotelId] ?? []
    )
      .filter(
        (ota) =>
          typeof ota.name === "string" &&
          ota.name.trim().length > 0
      )
      .sort(
        (a, b) =>
          (a.sort_order ?? 0) -
          (b.sort_order ?? 0)
      );
  }, [hotelOTAs, selectedHotelId]);

  const hasAnyOTA = useMemo(
    () =>
      hotels.some(
        (hotel) =>
          Array.isArray(
            hotelOTAs[hotel.id]
          ) &&
          hotelOTAs[hotel.id].some(
            (ota) =>
              typeof ota.name === "string" &&
              ota.name.trim().length > 0
          )
      ),
    [hotels, hotelOTAs]
  );

  useEffect(() => {
    const handleLanguageChange = (
      e: CustomEvent<Language>
    ) => {
      if (
        e.detail === "vi" ||
        e.detail === "en"
      ) {
        setLanguage(e.detail);
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

  useEffect(() => {
    if (
      selectedHotelId !== null &&
      hotels.some(
        (hotel) =>
          hotel.id === selectedHotelId
      )
    ) {
      return;
    }

    setSelectedHotelId(
      hotels.length > 0
        ? hotels[0].id
        : null
    );
  }, [hotels, selectedHotelId]);

  const getHotelGridClass = () => {
    const count = hotels.length;

    if (count >= 4)
      return "sm:grid-cols-2 lg:grid-cols-4";

    if (count === 3)
      return "sm:grid-cols-2 lg:grid-cols-3";

    if (count === 2)
      return "sm:grid-cols-2";

    return "sm:grid-cols-1";
  };

  const perSlide =
    heroSlides.length > 0
      ? SLIDE_DURATION / heroSlides.length
      : SLIDE_DURATION;

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* =====================================================
          HERO
          ===================================================== */}
      <section
        className="px-4 pt-4 sm:px-6 sm:pt-6"
        aria-labelledby="hero-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div
            className="relative h-[320px] overflow-hidden rounded-2xl bg-neutral-900 sm:h-[360px] lg:h-[420px]"
            aria-live="polite"
          >
            {/* =================================================
                HEADER NẰM TRỰC TIẾP TRONG HERO
                ================================================= */}
            <Header />

            {/* =================================================
                HERO SLIDES
                ================================================= */}
            {heroSlides.map(
              (slide, index) => {
                const fallback =
                  heroFallbackTexts[
                    index %
                      heroFallbackTexts.length
                  ];

                const heroTitle = isVi
                  ? slide.title_vi?.trim() ||
                    fallback.titleVi
                  : slide.title_en?.trim() ||
                    fallback.titleEn;

                const heroDescription =
                  isVi
                    ? slide.description_vi?.trim() ||
                      fallback.descriptionVi
                    : slide.description_en?.trim() ||
                      fallback.descriptionEn;

                return (
                  <div
                    key={slide.id}
                    className="absolute inset-0"
                    style={{
                      opacity:
                        index === 0
                          ? 1
                          : 0,
                      animationName:
                        "heroFade",
                      animationDuration: `${SLIDE_DURATION}s`,
                      animationTimingFunction:
                        "linear",
                      animationIterationCount:
                        "infinite",
                      animationDelay: `${index * perSlide}s`,
                      animationFillMode:
                        "both",
                    }}
                  >
                    {slide.image_url && (
                      <Image
                        src={
                          slide.image_url
                        }
                        alt={
                          heroTitle ||
                          "Huyen's Hotels & Stays"
                        }
                        fill
                        priority={
                          index === 0
                        }
                        quality={95}
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) calc(100vw - 32px), 1280px"
                        className="object-cover"
                      />
                    )}

                    <div className="absolute inset-0 z-10 bg-black/15" />

                    <div className="absolute inset-0 z-20 flex items-end px-4 pb-6 sm:px-8 sm:pb-8">
                      <div className="max-w-2xl text-white">
                        {index === 0 ? (
                          <h1
                            id="hero-heading"
                            className="text-sm font-bold leading-tight text-white drop-shadow-md sm:text-3xl lg:text-4xl"
                          >
                            {heroTitle}
                          </h1>
                        ) : (
                          <p className="text-sm font-bold leading-tight text-white drop-shadow-md sm:text-3xl lg:text-4xl">
                            {heroTitle}
                          </p>
                        )}

                        {heroDescription && (
                          <p className="mt-2 max-w-xl text-xs text-white drop-shadow-sm sm:mt-3 sm:text-lg">
                            {
                              heroDescription
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )}

            <style>{`
              @keyframes heroFade {
                0% { opacity: 0; }
                5% { opacity: 1; }
                25% { opacity: 1; }
                30% { opacity: 0; }
                100% { opacity: 0; }
              }
            `}</style>
          </div>

          {/* ===================================================
              BOOKING SEARCH
              =================================================== */}
          <div className="mt-4 w-full">
            <BookingSearch
              hotels={bookingHotels}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          GIỚI THIỆU
          ===================================================== */}
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
                    Chúng tôi phát triển hệ thống
                    khách sạn, homestay &amp; căn
                    hộ dịch vụ tại TP.HCM.
                    <br />
                    Luôn mang đến không gian sạch
                    sẽ, tiện nghi, riêng tư và thuận
                    tiện cho mọi chuyến đi.
                  </>
                ) : (
                  <>
                    We specialize in operating
                    hotels, homestays, and serviced
                    apartments in Ho Chi Minh City.
                    <br />
                    We are committed to providing
                    clean, comfortable, and private
                    spaces that are convenient for
                    every trip.
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

                <span className="ml-2">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DANH SÁCH LƯU TRÚ
          ===================================================== */}
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
              className={`grid gap-6 ${getHotelGridClass()}`}
            >
              {hotels.map(
                (hotel, index) => {
                  const hotelImage =
                    hotelCovers[
                      hotel.id
                    ];

                  const hotelName = t(
                    hotel.name_vi,
                    hotel.name_en
                  );

                  const hotelAddress =
                    t(
                      hotel.address_vi,
                      hotel.address_en
                    );

                  const hotelDesc = t(
                    hotel.description_vi,
                    hotel.description_en
                  );

                  return (
                    <article
                      key={hotel.id}
                      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg"
                    >
                      <Link
                        href={`/khach-san/${hotel.slug}`}
                        className="block"
                        aria-label={
                          isVi
                            ? `Xem ${hotelName}`
                            : `View ${hotelName}`
                        }
                      >
                        <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                          {hotelImage ? (
                            <Image
                              src={
                                hotelImage
                              }
                              alt={
                                hotelName
                              }
                              width={800}
                              height={600}
                              loading={
                                index < 2
                                  ? "eager"
                                  : "lazy"
                              }
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
                        {hotelAddress && (
                          <p className="text-xs uppercase text-neutral-400">
                            {
                              hotelAddress
                            }
                          </p>
                        )}

                        <Link
                          href={`/khach-san/${hotel.slug}`}
                        >
                          <h3 className="mt-2 text-xl font-semibold transition-colors hover:text-sky-500">
                            {
                              hotelName
                            }
                          </h3>
                        </Link>

                        {hotelDesc && (
                          <p className="mt-3 line-clamp-3 text-sm text-neutral-500">
                            {
                              hotelDesc
                            }
                          </p>
                        )}

                        <Link
                          href={`/khach-san/${hotel.slug}`}
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
          ===================================================== */}
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

            {/* =================================================
                HOTEL SELECTOR
                ================================================= */}
            <div
              className="mt-8 flex gap-2 overflow-x-auto pb-2"
              role="tablist"
              aria-label={
                isVi
                  ? "Chọn nơi lưu trú"
                  : "Choose a stay"
              }
            >
              {hotels.map((hotel) => {
                const isSelected =
                  hotel.id ===
                  selectedHotelId;

                const hotelName = t(
                  hotel.name_vi,
                  hotel.name_en
                );

                const otaCount =
                  hotelOTAs[
                    hotel.id
                  ]?.length ?? 0;

                return (
                  <button
                    key={hotel.id}
                    type="button"
                    role="tab"
                    aria-selected={
                      isSelected
                    }
                    disabled={
                      otaCount === 0
                    }
                    onClick={() =>
                      setSelectedHotelId(
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
                    {hotelName}
                  </button>
                );
              })}
            </div>

            {/* =================================================
                SELECTED HOTEL OTA
                ================================================= */}
            <div
              className="mt-6"
              role="tabpanel"
              aria-live="polite"
            >
              {selectedHotel && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {t(
                      selectedHotel.name_vi,
                      selectedHotel.name_en
                    )}
                  </h3>
                </div>
              )}

              {selectedOTAs.length === 0 ? (
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
                            {
                              content
                            }
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
                          {
                            content
                          }
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
          ===================================================== */}
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
          ===================================================== */}
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

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {customerReviews.map(
              (review) => (
                <article
                  key={review.id}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <div
                    className="text-amber-400"
                    aria-label={`${review.rating} trên 5 sao`}
                  >
                    {"★".repeat(
                      review.rating
                    )}
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                    &quot;
                    {isVi
                      ? review.reviewVi
                      : review.reviewEn}
                    &quot;
                  </p>

                  <div className="mt-4 border-t border-neutral-50 pt-4">
                    <p className="text-sm font-semibold">
                      {isVi
                        ? review.nameVi
                        : review.nameEn}
                    </p>
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}