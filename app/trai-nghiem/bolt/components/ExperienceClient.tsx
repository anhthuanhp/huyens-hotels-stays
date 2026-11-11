import { useCallback, useMemo, useState } from 'react';
import { useLanguage } from '../lib/use-language';
import {
  findHotel,
  getActivityPhotos,
  toLightboxImage,
  type LightboxImage,
} from '../lib/experience-utils';
import type { ExperienceClientProps } from '../types/experience';
import ExperienceHero from './ExperienceHero';
import ExperienceFinalCta from './ExperienceFinalCta';
import ExperienceStatus from './ExperienceStatus';
import PhotoLightbox from './PhotoLightbox';
import Reveal from './Reveal';
import StoryChapter from './StoryChapter';
import { experienceCopy } from './experience-copy';

type LightboxState = {
  images: LightboxImage[];
  index: number;
};

export default function ExperienceClient({ activities, hotels, media, hasError }: ExperienceClientProps) {
  const { language } = useLanguage();
  const copy = experienceCopy[language];
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const stories = useMemo(
    () =>
      (hasError ? [] : activities)
        .filter((activity) => activity.status === 'active')
        .map((activity) => {
          const photos = getActivityPhotos(activity, media);
          const images = photos.map((photo) =>
            toLightboxImage(photo, language === "en" ? (activity.title_en || activity.title_vi) : activity.title_vi, language),
          );
          return {
            activity,
            hotel: findHotel(hotels, activity.hotel_id),
            images,
          };
        }),
    [activities, hotels, media, language, hasError],
  );

  const heroImage = useMemo(() => {
    const firstWithPhoto = stories.find((story) => story.images.length > 0);
    return firstWithPhoto?.images[0] ?? null;
  }, [stories]);

  const openImage = useCallback(
    (activityId: number, imageIndex: number) => {
      const story = stories.find((item) => item.activity.id === activityId);
      if (!story) return;
      setLightbox({ images: story.images, index: imageIndex });
    },
    [stories],
  );

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const changeLightboxIndex = useCallback((index: number) => {
    setLightbox((current) => (current ? { ...current, index } : current));
  }, []);

  return (
    <main className="experience-story bg-cream">
      <ExperienceHero image={heroImage} />

      <section id="stories" className="scroll-mt-16 px-5 pb-8 sm:px-8">
        <div className="mx-auto max-w-[1160px]">
          <header className="max-w-3xl pt-20 sm:pt-28">
            <h2 className="font-serif text-4xl font-semibold leading-[1.15] text-ink sm:text-5xl">
              {copy.storiesTitle}
            </h2>
          </header>

          {hasError && <div className="mt-12"><ExperienceStatus variant="error" /></div>}
          {!hasError && stories.length === 0 && (
            <div className="mt-12"><ExperienceStatus variant="empty" /></div>
          )}

          <div className="divide-y divide-ink/10">
            {stories.map((story, index) => (
              <Reveal key={story.activity.id}>
                <StoryChapter
                  activity={story.activity}
                  index={index}
                  hotel={story.hotel}
                  images={story.images}
                  onOpenImage={openImage}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ExperienceFinalCta />

      {lightbox && (
        <PhotoLightbox
          images={lightbox.images}
          index={lightbox.index}
          onIndexChange={changeLightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </main>
  );
}
