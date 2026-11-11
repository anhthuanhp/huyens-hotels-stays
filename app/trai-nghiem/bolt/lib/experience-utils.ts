import type { Language } from './use-language';
import type { Activity, Hotel, Media } from '../types/experience';

export type LightboxImage = { url: string; alt: string };

export function pickText(vi: string | null, en: string | null, language: Language): string {
  if (language === 'en') return en || vi || '';
  return vi || en || '';
}

export function getActivityPhotos(activity: Activity, media: Media[]): Media[] {
  return media
    .filter((item) => item.entity_id === activity.id)
    .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order);
}

export function toLightboxImage(photo: Media, fallbackAlt: string, language: Language): LightboxImage {
  return {
    url: photo.public_url,
    alt: pickText(photo.alt_vi, photo.alt_en, language) || fallbackAlt,
  };
}

export function findHotel(hotels: Hotel[], hotelId: number | null): Hotel | undefined {
  if (hotelId === null) return undefined;
  return hotels.find((hotel) => hotel.id === hotelId);
}

export function formatActivityDate(value: string | null, language: Language): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
