import { useEffect, useRef, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '../lib/use-language';
import type { LightboxImage } from '../lib/experience-utils';
import { experienceCopy } from './experience-copy';

const SWIPE_THRESHOLD = 50;

type PhotoLightboxProps = {
  images: LightboxImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

export default function PhotoLightbox({ images, index, onIndexChange, onClose }: PhotoLightboxProps) {
  const { language } = useLanguage();
  const copy = experienceCopy[language];
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const total = images.length;
  const current = images[index];
  const hasMultiple = total > 1;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (!hasMultiple) return;
      if (event.key === 'ArrowLeft') onIndexChange((index - 1 + total) % total);
      if (event.key === 'ArrowRight') onIndexChange((index + 1) % total);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [index, total, hasMultiple, onClose, onIndexChange]);

  const goPrevious = () => onIndexChange((index - 1 + total) % total);
  const goNext = () => onIndexChange((index + 1) % total);

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null || !hasMultiple) return;
    const delta = event.changedTouches[0].clientX - start;
    if (delta <= -SWIPE_THRESHOLD) goNext();
    if (delta >= SWIPE_THRESHOLD) goPrevious();
  };

  const navButtonClass =
    'absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-cream backdrop-blur transition-colors hover:bg-cream/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.lightboxLabel}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex flex-col bg-pine-deep/95 text-cream backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <p className="text-sm tracking-[0.2em] text-sage">
          {index + 1} / {total}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={copy.lightboxClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          <X size={20} />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-20"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {current && (
          <img
            key={current.url}
            src={current.url}
            alt={current.alt}
            className="max-h-full max-w-full select-none object-contain"
            draggable={false}
          />
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrevious}
              aria-label={copy.lightboxPrevious}
              className={`${navButtonClass} left-2 sm:left-6`}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={copy.lightboxNext}
              className={`${navButtonClass} right-2 sm:right-6`}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
