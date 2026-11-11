import { useLanguage } from '../lib/use-language';
import type { LightboxImage } from '../lib/experience-utils';
import { experienceCopy } from './experience-copy';

type PhotoGalleryProps = {
  images: LightboxImage[];
  onOpen: (index: number) => void;
};

export default function PhotoGallery({ images, onOpen }: PhotoGalleryProps) {
  const { language } = useLanguage();
  const copy = experienceCopy[language];
  const extraImages = images.slice(1);

  if (extraImages.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-medium tracking-[0.25em] text-muted">{copy.galleryLabel}</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {extraImages.map((image, offset) => (
          <li key={`${image.url}-${offset}`}>
            <button
              type="button"
              onClick={() => onOpen(offset + 1)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-sm bg-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <img
                src={image.url}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
