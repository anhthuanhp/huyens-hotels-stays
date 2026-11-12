"use client";

import { useLanguage } from "@/app/lib/use-language";

import Link from "@/app/components/LocalizedLink";
import EmailLink from "./components/EmailLink";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronRight,
  MapPin,
} from "lucide-react";
import BookingSearch from "./components/BookingSearch";
import Header from "./components/Header";

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
  property_type: string | null;
  official_star_rating: number | null;
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

type LatestPost = {
  id: number;
  slug: string;
  title_vi: string;
  title_en: string;
  excerpt_vi: string | null;
  excerpt_en: string | null;
  image: string | null;
};
type HomeClientProps = {
  latestPosts?: LatestPost[];
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

// Four slides should not replace the initial LCP image during the first few seconds.
// A 40-second cycle keeps each slide visible for roughly 10 seconds.
const SLIDE_DURATION = 40;

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
  latestPosts = [],
}: HomeClientProps) {
  /*
   * Luôn render "vi" ở lần render đầu tiên để server và client
   * có cùng HTML, tránh hydration mismatch.
   */
  const language = useLanguage();
  const [galleryPage, setGalleryPage] = useState(0);
  const [stayMode, setStayMode] = useState<"short" | "long">("short");
  const [pickedHotelId, setPickedHotelId] =
    useState<number | null>(null);

  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewExpanded, setReviewExpanded] = useState(false);

  const isVi = language === "vi";

  /*
   * Đồng bộ ngôn ngữ với Header và <html lang>.
   */
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

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

  const galleryPosts = latestPosts.filter(
    (post) => typeof post.image === "string" &&
      post.image.trim().length > 0
  );

  const galleryPageCount = Math.ceil(galleryPosts.length / 4);

  const currentGalleryPage =
    galleryPageCount > 0
      ? galleryPage % galleryPageCount
      : 0;

  const visibleGalleryPosts = galleryPosts.slice(
    currentGalleryPage * 4,
    currentGalleryPage * 4 + 4
  );
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
        {/* HERO - BOLT DESIGN */}
        <section
          className="relative"
          aria-labelledby="hero-heading"
        >
          <div className="relative h-[455px] overflow-hidden bg-[#222611] text-white max-sm:h-[445px]">

            {/* Slideshow Supabase */}
            <div className="absolute inset-0">
              {heroSlides.map((slide, index) => {
                const isFirst = index === 0;
                const fallback =
                  heroFallbackTexts[
                    index % heroFallbackTexts.length
                  ];

                const alt =
                  (isVi ? slide.title_vi : slide.title_en)?.trim() ||
                  (isVi ? fallback.titleVi : fallback.titleEn);

                const animationDelay = isFirst
                  ? "0s"
                  : `${index * perSlide - SLIDE_DURATION}s`;

                return (
                  <div
                    key={slide.id}
                    data-first={isFirst ? "true" : "false"}
                    aria-hidden="true"
                    className="huyen-hero-slide absolute inset-0"
                    style={
                      slideCount > 1
                        ? {
                            opacity: isFirst ? 1 : 0,
                            animation: `huyenHeroFade ${SLIDE_DURATION}s linear ${animationDelay} infinite`,
                          }
                        : { opacity: 1 }
                    }
                  >
                    {slide.image_url && (
                      <Image
                        src={slide.image_url}
                        alt={alt}
                        fill
                        preload={isFirst}
                        fetchPriority={isFirst ? "high" : "auto"}
                        loading={isFirst ? "eager" : "lazy"}
                        quality={75}
                        sizes="100vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Gradient goc cua Bolt */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                background:
                  "linear-gradient(90deg, rgba(34,38,17,.78) 0%, rgba(34,38,17,.34) 42%, rgba(0,0,0,.05) 75%)",
              }}
            />

            <Header />

            {/* Noi dung ben trai theo Bolt */}
            <div className="relative z-20 mx-auto w-[calc(100%-48px)] max-w-[1100px] pt-[115px] pb-[25px] text-white max-sm:w-[calc(100%-32px)] max-sm:pt-[150px]">
              <div className="max-w-[560px]">

                <div className="grid h-[230px] w-full max-w-[560px] overflow-hidden">
                  {heroSlides.length > 0 ? (
                    heroSlides.map((slide, index) => {
                      const fallback =
                        heroFallbackTexts[
                          index % heroFallbackTexts.length
                        ];

                      const title = isVi
                        ? slide.title_vi?.trim() || fallback.titleVi
                        : slide.title_en?.trim() || fallback.titleEn;

                      const description = isVi
                        ? slide.description_vi?.trim() || fallback.descriptionVi
                        : slide.description_en?.trim() || fallback.descriptionEn;

                      const isFirst = index === 0;

                      const animationDelay = isFirst
                        ? "0s"
                        : `${index * perSlide - SLIDE_DURATION}s`;

                      return (
                        <div
                          key={slide.id}
                          data-first={isFirst ? "true" : "false"}
                          aria-hidden={!isFirst}
                          className="huyen-hero-slide col-start-1 row-start-1"
                          style={
                            slideCount > 1
                              ? {
                                  opacity: isFirst ? 1 : 0,
                                  animation: `huyenHeroFade ${SLIDE_DURATION}s linear ${animationDelay} infinite`,
                                }
                              : { opacity: 1 }
                          }
                        >
                          <p className="mb-[5px] text-[12px] font-bold tracking-[1.7px] text-[#e8eee0]">
                            HUYEN&apos;S HOTELS &amp; STAYS
                          </p>

                          {isFirst ? (
                            <h1
                              id="hero-heading"
                              className="mb-[14px] text-[clamp(34px,4.5vw,60px)] leading-[1.04] tracking-[-0.8px] text-white"
                              style={{
                                fontFamily: "'Playfair Display', Georgia, serif",
                                fontWeight: 700,
                              }}
                            >
                              {title}
                            </h1>
                          ) : (
                            <p
                              className="mb-[14px] text-[clamp(34px,4.5vw,60px)] leading-[1.04] tracking-[-0.8px] text-white"
                              style={{
                                fontFamily: "'Playfair Display', Georgia, serif",
                                fontWeight: 700,
                              }}
                            >
                              {title}
                            </p>
                          )}

                          {description && (
                            <p className="mb-[17px] whitespace-pre-line text-[14px] leading-[1.4] text-white">
                              {description}
                            </p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-start-1 row-start-1">
                      <p className="mb-[5px] text-[12px] font-bold tracking-[1.7px] text-[#e8eee0]">
                        HUYEN&apos;S HOTELS &amp; STAYS
                      </p>

                      <h1
                        id="hero-heading"
                        className="mb-[14px] text-[clamp(34px,4.5vw,60px)] leading-[1.04] text-white"
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontWeight: 700,
                        }}
                      >
                        {isVi
                          ? "Lưu trú theo cách của bạn"
                          : "Stay your own way"}
                      </h1>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStayMode("short")}
                    aria-pressed={stayMode === "short"}
                    className={`inline-flex items-center gap-[7px] rounded-[28px] border border-white px-[17px] py-2 text-sm font-semibold text-white transition-colors ${
                      stayMode === "short"
                        ? "bg-[#0b6c38]"
                        : "bg-[rgba(16,31,22,.3)] hover:bg-[#0b6c38]"
                    }`}
                  >
                    <Building2 size={16} aria-hidden="true" />
                    {isVi ? "Lưu trú ngắn hạn" : "Short stay"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStayMode("long")}
                    aria-pressed={stayMode === "long"}
                    className={`inline-flex items-center gap-[7px] rounded-[28px] border border-white px-[17px] py-2 text-sm font-semibold text-white transition-colors ${
                      stayMode === "long"
                        ? "bg-[#0b6c38]"
                        : "bg-[rgba(16,31,22,.3)] hover:bg-[#0b6c38]"
                    }`}
                  >
                    <Building2 size={16} aria-hidden="true" />
                    {isVi ? "Thuê dài hạn" : "Long stay"}
                  </button>
                </div>
              </div>
            </div>

            {heroCss && (
              <style
                dangerouslySetInnerHTML={{
                  __html: heroCss,
                }}
              />
            )}
          </div>

          {/* Thanh tim phong noi tren mep Hero */}
          <BookingSearch
            hotels={bookingHotels}
            stayMode={stayMode}
            floating
          />
        </section>
        {/* =====================================================
            GIOI THIEU - BOLT DESIGN
        ====================================================== */}
        <section
          className="bg-white px-4 pb-0 pt-[52px] sm:px-6 max-sm:pt-8"
          aria-labelledby="about-heading"
        >
          <div className="mx-auto max-w-[1100px]">
            <div className="grid items-center gap-5 lg:grid-cols-[25fr_30fr_45fr] lg:gap-0">

              {/* Cot 1 - tieu de */}
              <div className="lg:pr-5">
                <p className="mb-[5px] text-[12px] font-bold tracking-[1.7px] text-[#0959dc]">
                  HUYEN&apos;S HOTELS &amp; STAYS
                </p>

                <h2
                  id="about-heading"
                  className="text-[25px] font-semibold leading-[1.08] text-[#0755cc] max-sm:text-[23px]"
                >
                  {isVi ? (
                    <>
                      <span className="block">Mỗi kỳ lưu trú,</span>
                      <span className="block">một trải nghiệm riêng</span>
                    </>
                  ) : (
                    <>
                      <span className="block">Every stay,</span>
                      <span className="block">a personal experience</span>
                    </>
                  )}
                </h2>
              </div>

              {/* Cot 2 - noi dung */}
              <div className="border-l border-[#bfc5c1] px-[38px] max-lg:px-5 max-sm:border-l-0 max-sm:border-t max-sm:px-0 max-sm:pt-4">
                <p className="mb-3 text-[13px] leading-[1.55] text-[#111613]">
                  {isVi
                    ? "Chúng tôi chuyên vận hành khách sạn, căn hộ dịch vụ tại TP. Hồ Chí Minh. Cam kết mang đến không gian sạch sẽ, thoải mái, riêng tư và tiện lợi cho mọi chuyến đi."
                    : "We operate hotels and serviced apartments in Ho Chi Minh City. Clean, comfortable, private and convenient spaces for every journey."}
                </p>

                <Link
                  href="/kham-pha-huyens"
                  className="flex items-center justify-end gap-2 text-[13px] font-bold text-[#075bd7] hover:underline"
                >
                  {isVi ? "Khám phá Huyen's" : "Discover Huyen's"}
                  <span aria-hidden="true" className="text-lg">→</span>
                </Link>
              </div>

              {/* Cot 3 - collage 1 anh lon + 2 anh nho */}
              <div className="grid h-[280px] min-h-0 grid-cols-[1.6fr_1fr] gap-[11px] pl-[14px] max-lg:h-[220px] max-sm:mt-2 max-sm:h-[180px] max-sm:pl-0">

                <img
                  src="https://images.pexels.com/photos/3771087/pexels-photo-3771087.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt={isVi ? "Không gian lưu trú Huyen's" : "Huyen's stay experience"}
                  loading="lazy"
                  className="h-full min-h-0 w-full rounded-xl object-cover"
                />

                <div className="grid min-h-0 grid-rows-2 gap-[11px]">
                  <img
                    src="https://images.pexels.com/photos/40624417/pexels-photo-40624417.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt={isVi ? "Không gian phòng nghỉ" : "Guest room"}
                    loading="lazy"
                    className="h-full min-h-0 w-full rounded-xl object-cover"
                  />

                  <img
                    src="https://images.pexels.com/photos/5007253/pexels-photo-5007253.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                    alt={isVi ? "Trải nghiệm lưu trú" : "Stay experience"}
                    loading="lazy"
                    className="h-full min-h-0 w-full rounded-xl object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>
        {/* =====================================================
            DANH SÁCH LƯU TRÚ - BOLT FEATURED CARDS
        ====================================================== */}
        <section
          id="hotels"
          className="bg-white px-4 pb-[22px] pt-[36px] sm:px-6"
          aria-labelledby="stays-heading"
        >
          <div className="mx-auto max-w-[1100px]">

            {/* Heading theo Bolt */}
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-[5px] text-[12px] font-bold uppercase tracking-[1.7px] text-[#155d2f]">
                  {isVi ? "CƠ SỞ NỔI BẬT" : "FEATURED PROPERTIES"}
                </p>

                <h2
                  id="stays-heading"
                  className="text-[25px] font-bold leading-[1.08] text-[#111613] max-sm:text-[20px]"
                >
                  {isVi
                    ? "Khám phá hệ thống Huyen's"
                    : "Explore Huyen's collection"}
                </h2>
              </div>

              <Link
                href="/phong"
                className="inline-flex items-center gap-2 text-[13px] font-bold text-[#155d2f] hover:underline max-sm:text-[11px]"
              >
                {isVi ? "Xem toàn bộ phòng" : "View all rooms"}
                <span aria-hidden="true" className="text-lg">→</span>
              </Link>
            </div>

            {/* Danh sách thật từ Supabase */}
            {hotels.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-300 p-7 text-center text-sm text-neutral-500">
                {isVi
                  ? "Chưa có cơ sở lưu trú nào hoạt động."
                  : "No active properties available."}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-4 max-lg:gap-3">
                {hotels.map((hotel) => {
                  const image = hotelCovers[hotel.id];

                  const name = t(
                    hotel.name_vi,
                    hotel.name_en
                  ) as string;

                  const typeLabels: Record<string, [string, string]> = {
                    hotel: ["Khách sạn", "Hotel"],
                    guesthouse: ["Guesthouse / Nhà khách", "Guesthouse"],
                    homestay: ["Homestay", "Homestay"],
                    serviced_apartment: ["Căn hộ dịch vụ", "Serviced apartment"]
                  };
                  const propertyType =
                    typeLabels[hotel.property_type || ""]?.[isVi ? 0 : 1] ||
                    (isVi ? "Cơ sở lưu trú" : "Property");
                  const officialStars =
                    hotel.official_star_rating != null &&
                    Number.isInteger(hotel.official_star_rating) &&
                    hotel.official_star_rating >= 1 &&
                    hotel.official_star_rating <= 5
                      ? hotel.official_star_rating
                      : null;
                  const href = `/khach-san/${hotel.slug}`;

                  return (
                    <article
                      key={hotel.id}
                      className="group relative overflow-hidden rounded-[13px] border border-[#e1e4e1] bg-white shadow-[0_2px_5px_rgba(0,0,0,.06)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(0,0,0,.1)]"
                    >
                      <Link
                        href={href}
                        aria-label={
                          isVi
                            ? `Xem chi tiết ${name}`
                            : `View details of ${name}`
                        }
                        className="block"
                      >
                        <div className="relative h-[140px] overflow-hidden bg-neutral-100 max-sm:h-[170px]">
                          {image ? (
                            <Image
                              src={image}
                              alt={name}
                              fill
                              loading="lazy"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                              {isVi ? "Chưa có ảnh" : "No image"}
                            </div>
                          )}
                        </div>

                        <div className="relative min-h-[78px] px-[14px] pb-[10px] pt-[7px]">
                          <h3 className="mb-1 pr-7 text-[14px] font-bold leading-snug text-[#111613]">
                            {name}
                          </h3>

                          <span className="inline-block rounded-[10px] bg-[#d8f2dc] px-[7px] py-[3px] text-[10px] font-semibold leading-tight text-[#125d26]">
                            {propertyType}
                          </span>
                           {officialStars !== null && (
                             <span
                               className="ml-2 text-[13px] tracking-[1px] text-amber-500"
                               aria-label={isVi ? officialStars + " sao" : officialStars + " stars"}
                             >
                               {"★".repeat(officialStars)}
                             </span>
                           )}

                          <p className="mt-[6px] flex items-center gap-1 text-[10px] text-[#5b625d]">
                            <MapPin size={13} aria-hidden="true" />
                            {(isVi
          ? hotel.address_vi || hotel.address_en
          : hotel.address_en || hotel.address_vi
        )?.normalize("NFC") ||
          (isVi ? "TP. Hồ Chí Minh" : "Ho Chi Minh City")}
                          </p>

                          <span
                            aria-hidden="true"
                            className="absolute bottom-[10px] right-[10px] grid h-[28px] w-[28px] place-items-center rounded-full border border-[#e1e4e1] bg-white text-[#111613] shadow-sm transition-colors group-hover:bg-[#d8f2dc]"
                          >
                            <span className="text-[18px] leading-none">→</span>
                          </span>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}

          </div>
        </section>
        {/* =====================================================
            OTA + CUSTOMER REVIEWS - BOLT DESIGN
        ====================================================== */}
        <section
          id="bolt-ota-reviews"
          className="bg-white px-4 pb-[22px] pt-[22px] sm:px-6"
          aria-label={
            isVi
              ? "Đặt phòng và đánh giá khách lưu trú"
              : "Booking channels and guest reviews"
          }
        >
          <div className="mx-auto grid max-w-[1100px] gap-[18px] lg:grid-cols-[1fr_1.25fr]">

            {/* OTA - COT TRAI */}
            <div
              id="ota-booking"
              className="min-w-0 rounded-[13px] border border-[#e0e4e1] bg-white px-[14px] py-3 shadow-[0_2px_4px_rgba(0,0,0,.04)]"
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5 text-[#12652f]">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M7 3v4M17 3v4M3 10h18" />
                    <path d="m9 15 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-[#111613]">
                    {isVi
                      ? "Đặt phòng qua các nền tảng (OTA)"
                      : "Book through OTA platforms"}
                  </h2>
                  <p className="text-[11px] leading-[1.5] text-[#515b54]">
                    {isVi
                      ? "Chọn cơ sở và đặt phòng nhanh chóng, an toàn."
                      : "Choose a property and book quickly, safely."}
                  </p>
                </div>
              </div>

              {/* Chon co so tu Supabase */}
              <div className="relative mt-3 w-full max-w-[320px]">
                <select
                  aria-label={
                    isVi ? "Chọn cơ sở lưu trú" : "Choose a property"
                  }
                  value={selectedHotelId ?? ""}
                  onChange={(event) =>
                    setPickedHotelId(Number(event.target.value))
                  }
                  disabled={!hasAnyOTA}
                  className="w-full appearance-none rounded-[10px] border border-[#dfe3e0] bg-white py-2 pl-3 pr-9 text-[12px] font-semibold text-[#111613] outline-none focus:border-[#0a6b36] disabled:opacity-50"
                >
                  {hotels.length === 0 && (
                    <option value="">
                      {isVi ? "Chưa có cơ sở" : "No properties"}
                    </option>
                  )}
                  {hotels.map((hotel) => (
                    <option
                      key={hotel.id}
                      value={hotel.id}
                      disabled={
                        (otaByHotel[hotel.id]?.length ?? 0) === 0
                      }
                    >
                      {t(hotel.name_vi, hotel.name_en) as string}
                    </option>
                  ))}
                </select>
                <ChevronRight
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[#111613]"
                  aria-hidden="true"
                />
              </div>

              {/* Link OTA that, khong dung du lieu mau */}
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {selectedOTAs.length === 0 ? (
                  <p className="col-span-full py-3 text-[12px] text-neutral-500">
                    {isVi
                      ? "Chưa có kênh đặt phòng đang hoạt động."
                      : "No active booking channels available."}
                  </p>
                ) : (
                  selectedOTAs.map((ota) => {
                    const href = ota.listing_url || ota.website;
                    const inner = (
                      <>
                        {ota.logo ? (
                          <span className="relative h-6 w-8 shrink-0">
                            <Image
                              src={ota.logo}
                              alt=""
                              fill
                              sizes="32px"
                              className="object-contain"
                            />
                          </span>
                        ) : (
                          <span className="grid h-6 w-7 shrink-0 place-items-center rounded bg-[#0a6b36] text-[11px] font-bold text-white">
                            {ota.name.charAt(0)}
                          </span>
                        )}

                        <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#111613]">
                          {ota.name}
                        </span>

                        <span
                          aria-hidden="true"
                          className="shrink-0 text-[15px] text-[#64716a]"
                        >
                          ↗
                        </span>
                      </>
                    );

                    return href ? (
                      <a
                        key={ota.id}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-w-0 items-center gap-1.5 rounded-lg border border-[#e2e5e3] bg-white px-2 py-2 transition-colors hover:border-[#0a6b36] hover:bg-[#f4fbf5]"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div
                        key={ota.id}
                        className="flex min-w-0 items-center gap-1.5 rounded-lg border border-[#e2e5e3] px-2 py-2 opacity-60"
                      >
                        {inner}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* REVIEWS - COT PHAI */}
            <div
              className="min-w-0 rounded-[13px] border border-[#e0e4e1] bg-white px-[14px] py-3 shadow-[0_2px_4px_rgba(0,0,0,.04)]"
              aria-labelledby="reviews-heading"
            >
              <div className="flex flex-wrap items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#12652f"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="7" r="4" />
                  <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                </svg>

                <h2
                  id="reviews-heading"
                  className="text-[14px] font-bold text-[#111613]"
                >
                  {isVi
                    ? "Đánh giá từ khách lưu trú"
                    : "Guest reviews"}
                </h2>

                <Link
                  href="/#cau-hoi-thuong-gap"
                  className="ml-auto text-[11px] font-semibold text-[#12652f] hover:underline"
                >
                  {isVi ? "Xem thêm thông tin" : "More information"}
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>

              {customerReviews.length === 0 ? (
                <p className="py-6 text-center text-[12px] text-neutral-500">
                  {isVi
                    ? "Chưa có đánh giá của khách lưu trú."
                    : "No guest reviews yet."}
                </p>
              ) : (
                <>
                  <div className="mt-3 flex items-center gap-2">
                    {/* Nut truoc */}
                    <button
                      type="button"
                      onClick={() => {
                        setReviewIndex((index) =>
                          (index - 1 + customerReviews.length) %
                          customerReviews.length
                        );
                        setReviewExpanded(false);
                      }}
                      aria-label={
                        isVi ? "Đánh giá trước" : "Previous review"
                      }
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#e5e8e5] bg-white hover:bg-neutral-50"
                    >
                      <ChevronRight
                        size={16}
                        className="rotate-180"
                      />
                    </button>

                    {/* Hien 2 danh gia song song */}
                    <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                      {Array.from(
                        {
                          length: Math.min(
                            2,
                            customerReviews.length
                          ),
                        },
                        (_, offset) => {
                          const review =
                            customerReviews[
                              (reviewIndex + offset) %
                              customerReviews.length
                            ];

                          const content = isVi
                            ? review.review_vi
                            : review.review_en?.trim() ||
                              review.review_vi;

                          const rating = Math.max(
                            1,
                            Math.min(
                              5,
                              Math.round(Number(review.rating) || 5)
                            )
                          );

                          return (
                            <article
                              key={review.id}
                              className="flex min-w-0 flex-col rounded-[12px] border border-[#e7e9e7] px-3 py-2 shadow-[0_2px_5px_rgba(0,0,0,.04)]"
                            >
                              <div
                                className="text-[14px] tracking-[1px] text-[#f2bd00]"
                                aria-label={`${rating}/5`}
                              >
                                {"★".repeat(rating)}
                              </div>

                              <p
                                className={`mt-1 text-[11px] leading-[1.4] text-[#111613] ${
                                  reviewExpanded ? "" : "line-clamp-2"
                                }`}
                              >
                                &ldquo;{content}&rdquo;
                              </p>

                              <div className="mt-auto pt-1 text-[11px] font-semibold text-[#111613]">
                                {review.guest_name}
                                {review.guest_country
                                  ? ` – ${review.guest_country}`
                                  : ""}
                              </div>

                              {content.length > 85 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReviewExpanded((value) => !value)
                                  }
                                  className="mt-1 self-start text-[10px] font-semibold text-[#075bd7]"
                                >
                                  {reviewExpanded
                                    ? isVi ? "Thu gọn" : "Show less"
                                    : isVi ? "Xem thêm" : "Read more"}
                                </button>
                              )}
                            </article>
                          );
                        }
                      )}
                    </div>

                    {/* Nut sau */}
                    <button
                      type="button"
                      onClick={() => {
                        setReviewIndex((index) =>
                          (index + 1) % customerReviews.length
                        );
                        setReviewExpanded(false);
                      }}
                      aria-label={
                        isVi ? "Đánh giá tiếp" : "Next review"
                      }
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#e5e8e5] bg-white hover:bg-neutral-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="mt-2 flex justify-center gap-1.5">
                    {customerReviews.length <= 8 ? (
                      customerReviews.map((review, index) => (
                        <button
                          key={review.id}
                          type="button"
                          onClick={() => {
                            setReviewIndex(index);
                            setReviewExpanded(false);
                          }}
                          aria-label={
                            isVi
                              ? `Đến đánh giá ${index + 1}`
                              : `Go to review ${index + 1}`
                          }
                          aria-current={
                            reviewIndex === index ? "true" : undefined
                          }
                          className={`h-[7px] w-[7px] rounded-full ${
                            reviewIndex === index
                              ? "bg-[#21a33d]"
                              : "bg-[#d4d7d5]"
                          }`}
                        />
                      ))
                    ) : (
                      <span className="text-[11px] text-neutral-500">
                        {reviewIndex + 1} / {customerReviews.length}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
        {/* =====================================================
            TRẢI NGHIỆM LƯU TRÚ - BOLT GALLERY
        ====================================================== */}
        <section
          id="stay-experiences"
          className="bg-white px-4 pb-[42px] pt-[34px] sm:px-6"
          aria-labelledby="experience-heading"
        >
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-6 flex items-center justify-center gap-4">
              <span
                aria-hidden="true"
                className="h-px w-[37px] shrink-0 bg-[#111613]"
              />

              <h2
                id="experience-heading"
                className="text-center text-[14px] font-semibold tracking-[2.5px] text-[#111613] max-sm:text-[11px] max-sm:tracking-[1.5px]"
              >
                {isVi
                  ? "TRẢI NGHIỆM LƯU TRÚ CÙNG HUYEN’S"
                  : "STAY EXPERIENCES WITH HUYEN’S"}
              </h2>

              <span
                aria-hidden="true"
                className="h-px w-[37px] shrink-0 bg-[#111613]"
              />
            </div>

            {galleryPosts.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500">
                {isVi
                  ? "Chưa có bài viết có hình ảnh."
                  : "No articles with images are available yet."}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                  {visibleGalleryPosts.map((post) => {
                    const title = isVi
                      ? post.title_vi
                      : post.title_en || post.title_vi;

                    return (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        title={title}
                        aria-label={
                          isVi
                            ? `Đọc bài viết: ${title}`
                            : `Read article: ${title}`
                        }
                        className="group block overflow-hidden rounded-[11px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a6b36]"
                      >
                        <div className="h-[130px] overflow-hidden sm:h-[170px] md:h-[200px]">
                          <img
                            src={post.image || ""}
                            alt={title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {galleryPageCount > 1 && (
                  <nav
                    className="mt-5 flex items-center justify-center gap-4"
                    aria-label={
                      isVi
                        ? "Phân trang hình ảnh Blog"
                        : "Blog image pagination"
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setGalleryPage(
                          (currentGalleryPage - 1 +
                            galleryPageCount) % galleryPageCount
                        )
                      }
                      aria-label={
                        isVi ? "Trang ảnh trước" : "Previous page"
                      }
                      className="grid h-9 w-9 place-items-center rounded-full border border-[#e1e4e1] bg-white text-[#111613] hover:bg-[#f0f7f1]"
                    >
                      <ChevronRight
                        size={19}
                        className="rotate-180"
                      />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from(
                        { length: galleryPageCount },
                        (_, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setGalleryPage(index)}
                            aria-label={
                              isVi
                                ? `Xem trang ảnh ${index + 1}`
                                : `Show image page ${index + 1}`
                            }
                            aria-current={
                              index === currentGalleryPage
                                ? "page"
                                : undefined
                            }
                            className={`h-2 w-2 rounded-full transition-colors ${
                              index === currentGalleryPage
                                ? "bg-[#0a6b36]"
                                : "bg-[#d4d7d5] hover:bg-[#8ca995]"
                            }`}
                          />
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setGalleryPage(
                          (currentGalleryPage + 1) % galleryPageCount
                        )
                      }
                      aria-label={
                        isVi ? "Trang ảnh tiếp" : "Next page"
                      }
                      className="grid h-9 w-9 place-items-center rounded-full border border-[#e1e4e1] bg-white text-[#111613] hover:bg-[#f0f7f1]"
                    >
                      <ChevronRight size={19} />
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </section>
      </div>


    </>
  );
}