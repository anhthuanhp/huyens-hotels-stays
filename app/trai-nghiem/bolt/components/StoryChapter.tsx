import { ArrowRight, CalendarDays, ImageOff, MapPin } from 'lucide-react';
import { useLanguage } from '../lib/use-language';
import {
  formatActivityDate,
  pickText,
  type LightboxImage,
} from '../lib/experience-utils';
import type { Activity, Hotel } from '../types/experience';
import ExpandableText from './ExpandableText';
import PhotoGallery from './PhotoGallery';
import { experienceCopy } from './experience-copy';

type StoryChapterProps = {
  activity: Activity;
  index: number;
  hotel: Hotel | undefined;
  images: LightboxImage[];
  onOpenImage: (activityId: number, imageIndex: number) => void;
};

export default function StoryChapter({ activity, index, hotel, images, onOpenImage }: StoryChapterProps) {
  const { language } = useLanguage();
  const copy = experienceCopy[language];
  const title = pickText(activity.title_vi, activity.title_en, language);
  const description = pickText(activity.description_vi, activity.description_en, language);
  const dateLabel = formatActivityDate(activity.activity_date, language);
  const hotelName = hotel ? pickText(hotel.name_vi, hotel.name_en, language) : null;
  const hotelAddress = hotel ? pickText(hotel.address_vi, hotel.address_en, language) : null;
  const cover = images[0];
  const isReversed = index % 2 === 1;
  const chapterNumber = String(index + 1).padStart(2, '0');

  return (
    <article className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:gap-16">
      <div className={`order-1 lg:col-span-7 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
        <figure className="group overflow-hidden rounded-sm bg-sage">
          {cover ? (
            <button
              type="button"
              onClick={() => onOpenImage(activity.id, 0)}
              disabled={images.length < 2}
              className="block aspect-[4/3] w-full cursor-zoom-in disabled:cursor-default lg:aspect-[5/4]"
            >
              <img
                src={cover.url}
                alt={cover.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </button>
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 bg-sage text-muted lg:aspect-[5/4]">
              <ImageOff size={28} aria-hidden="true" />
              <span className="text-sm">{copy.noPhoto}</span>
            </div>
          )}
        </figure>
      </div>

      <div className={`order-2 lg:col-span-5 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
        <p className="text-xs font-medium tracking-[0.25em] text-accent">
          {copy.chapterLabel(chapterNumber)}
        </p>
        <h2 className="mt-4 font-serif text-4xl font-semibold leading-[1.15] text-ink sm:text-5xl">
          {title}
        </h2>

        {(dateLabel || hotelName || hotelAddress) && (
          <ul className="mt-6 space-y-2.5 text-sm text-muted">
            {hotelName && <li className="font-medium text-ink/80">{hotelName}</li>}
            {dateLabel && (
              <li className="flex items-start gap-2.5">
                <CalendarDays size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <span>{dateLabel}</span>
              </li>
            )}
            {hotelAddress && (
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <span>{hotelAddress}</span>
              </li>
            )}
          </ul>
        )}

        {description && (
          <div className="mt-6">
            <ExpandableText text={description} />
          </div>
        )}

        {hotel && hotelName && (
          <a
            href={`/khach-san/${encodeURIComponent(hotel.slug)}`}
            className="group mt-8 inline-flex items-center gap-2 border-b border-accent/40 pb-1 text-sm font-medium text-accent transition-colors hover:border-accent hover:text-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {copy.exploreHotel(hotelName)}
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </a>
        )}
      </div>

      {images.length > 1 && (
        <div className="order-3 lg:col-span-12">
          <PhotoGallery images={images} onOpen={(imageIndex) => onOpenImage(activity.id, imageIndex)} />
        </div>
      )}
    </article>
  );
}
