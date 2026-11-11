import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import type { HotelImage, Locale } from '../types/hotel';
import { t } from '../lib/i18n';
import { format, ui } from '../lib/uiText';

interface Props {
  images: HotelImage[];
  hotelName: string;
  propertyType: string | null;
  officialStarRating: number | null;
  locale: Locale;
  placeholderText: string;
}

const BASE_COUNT = 5;

export default function HotelHero({ images, hotelName, locale, placeholderText, propertyType, officialStarRating }: Props) {
  hotelName = hotelName.normalize("NFC");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const gallery = images.length > 0 ? images : [];
  const hasImages = gallery.length > 0;

  const openLightbox = (index: number) => {
    setCurrent(index);
    setLightboxOpen(true);
  };

  const goPrev = useCallback(
    () => setCurrent((c) => (c - 1 + gallery.length) % gallery.length),
    [gallery.length],
  );
  const goNext = useCallback(
    () => setCurrent((c) => (c + 1) % gallery.length),
    [gallery.length],
  );

  useEffect(() => {
    if (!lightboxOpen || !hasImages) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, hasImages, goPrev, goNext]);

  const main = hasImages ? gallery[0] : null;
  const side = gallery.slice(1, BASE_COUNT);

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-muted">
          <span>Huyen's Hotels &amp; Stays</span>
          <span aria-hidden>/</span>
          <span>{t(ui.breadcrumbHotels, locale)}</span>
          <span aria-hidden>/</span>
          <span className="text-brand font-medium">{hotelName}</span>
        </nav>

        <h1 className="text-4xl leading-[1.2] tracking-normal text-brand sm:text-5xl lg:text-6xl" style={{ fontFamily: 'Cambria, "Times New Roman", serif' }}>
          {hotelName}
        </h1>

        {/* HOTEL_CLASSIFICATION_V2 */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {propertyType && (
            <span className="rounded-full bg-sage px-3 py-1.5 text-xs font-semibold text-brand">
              {({
                hotel: locale === "vi" ? "Khách sạn" : "Hotel",
                guesthouse: locale === "vi" ? "Guesthouse / Nhà khách" : "Guesthouse",
                homestay: "Homestay",
                serviced_apartment: locale === "vi" ? "Căn hộ dịch vụ" : "Serviced apartment"
              } as Record<string, string>)[propertyType] || (locale === "vi" ? "Cơ sở lưu trú" : "Property")}
            </span>
          )}
          {officialStarRating !== null &&
           Number.isInteger(officialStarRating) &&
           officialStarRating >= 1 &&
           officialStarRating <= 5 && (
            <span
              className="text-lg tracking-[2px] text-amber-500"
              aria-label={locale === "vi" ? officialStarRating + " sao" : officialStarRating + " stars"}
            >
              {"★".repeat(officialStarRating)}
            </span>
          )}
        </div>

      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        {hasImages ? (
          <div className="grid gap-2 sm:gap-3 lg:grid-cols-[1.9fr_1fr] lg:h-[330px] xl:h-[380px]">
            <button
              type="button"
              onClick={() => openLightbox(0)}
              className="group relative h-56 w-full overflow-hidden rounded-2xl sm:h-72 lg:h-full"
              aria-label={t(ui.viewAllImages, locale)}
            >
              <img
                src={main!.url}
                alt={main!.alt ? t(main!.alt, locale) : hotelName}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 bg-brand-deep/0 transition-colors duration-300 group-hover:bg-brand-deep/10" />
            </button>

            <div className="hidden grid-cols-2 grid-rows-2 gap-2 sm:gap-3 lg:grid">
              {side.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => openLightbox(i + 1)}
                  className="group relative overflow-hidden rounded-2xl"
                >
                  <img
                    src={img.url}
                    alt={img.alt ? t(img.alt, locale) : `${hotelName} ${i + 2}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  {i === side.length - 1 && gallery.length > BASE_COUNT && (
                    <span className="absolute inset-0 flex items-center justify-center bg-brand-deep/60 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Images className="h-6 w-6" />
                      <span className="ml-2 text-sm font-medium">
                        +{gallery.length - BASE_COUNT}
                      </span>
                    </span>
                  )}
                </button>
              ))}
              {side.length < 3 && (
                <div className="rounded-2xl bg-sage" aria-hidden />
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-sage text-muted sm:h-96">
            <p className="px-6 text-center text-sm">{placeholderText}</p>
          </div>
        )}

        {hasImages && (
          <div className="mt-4 flex items-center justify-between sm:mt-5">
            <p className="text-sm text-muted">
              {gallery.length} {locale === 'vi' ? 'hình ảnh' : 'images'}
            </p>
            <button
              type="button"
              onClick={() => openLightbox(0)}
              className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-2 text-sm font-medium text-brand shadow-sm transition-all duration-200 hover:border-brand hover:bg-brand hover:text-white"
            >
              <Images className="h-4 w-4" />
              {t(ui.viewAllImages, locale)}
            </button>
          </div>
        )}
      </div>

      {lightboxOpen && hasImages && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-deep/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={t(ui.viewAllImages, locale)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
            aria-label={t(ui.closeGallery, locale)}
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:left-6"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:right-6"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            className="flex h-full w-full max-w-5xl flex-col items-center justify-center px-4 pb-16 pt-10"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(dx) > 48) {
                if (dx > 0) goPrev();
                else goNext();
              }
              touchStartX.current = null;
            }}
          >
            <img
              key={gallery[current].url}
              src={gallery[current].url}
              alt={gallery[current].alt ? t(gallery[current].alt!, locale) : `${hotelName} ${current + 1}`}
              className="animate-zoom-in max-h-full max-w-full rounded-xl object-contain"
            />
            <p className="mt-4 text-sm text-white/70">
              {format(t(ui.galleryCounter, locale), {
                current: current + 1,
                total: gallery.length,
              })}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
