"use client";
import { useLanguage } from "../lib/use-language";
import { content } from "./bolt/content/explore";
import type { Hotel, HeroSlide } from "./bolt/types/explore";
import { HeroSection } from "./bolt/components/explore/HeroSection";
import { StorySection } from "./bolt/components/explore/StorySection";
import { CollectionSection } from "./bolt/components/explore/CollectionSection";
import { PhilosophySection } from "./bolt/components/explore/PhilosophySection";
import { FinalCtaSection } from "./bolt/components/explore/FinalCtaSection";

type Props = {
  hotels: Hotel[];
  heroSlides: HeroSlide[];
  hotelCovers: Record<number,string>;
};

export default function ExploreClient({hotels,heroSlides,hotelCovers}:Props) {
  const lang = useLanguage();
  const t = content[lang];
  const images = heroSlides.map(x=>x.image_url)
    .filter((x):x is string=>Boolean(x));
  return (
    <div className="min-h-screen bg-cream antialiased">
      <HeroSection t={t} slides={heroSlides}/>
      <StorySection t={t} images={images}/>
      <CollectionSection t={t} lang={lang}
        hotels={hotels} hotelCovers={hotelCovers}/>
      <PhilosophySection t={t}/>
      <FinalCtaSection t={t} image={images[2] || images[0]}/>
    </div>
  );
}
