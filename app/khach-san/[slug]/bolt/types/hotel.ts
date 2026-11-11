export type Locale = 'vi' | 'en';

export type Bilingual = { vi: string; en: string };

export interface HotelImage {
  url: string;
  alt?: Bilingual;
}

export interface HotelAmenity {
  icon?: string;
  label: Bilingual;
}

export interface RoomAmenity {
  label: Bilingual;
}

export interface HotelRoom {
  slug: string;
  name: Bilingual;
  shortDescription: Bilingual;
  coverImage: string;
  gallery?: string[];
  sizeSqm?: number;
  maxGuests?: number;
  bedType: Bilingual;
  amenities: RoomAmenity[];
  pricePerNight?: number;
  pricePerMonth?: number;
  currency?: string;
}

export interface NearbyPoint {
  name: Bilingual;
  category: Bilingual;
  mapUrl?: string;
}

export interface HotelGuide {
  title: Bilingual;
  description: Bilingual;
}

export interface HotelDetailData {
  slug: string;
  name: string;
  address: Bilingual;
  city: Bilingual;
  country: Bilingual;
  mapUrl?: string;
  images: HotelImage[];
  description: Bilingual;
  highlights: Bilingual[];
  amenities: HotelAmenity[];
  areaInfo?: Bilingual;
  rooms: HotelRoom[];
  nearbyPoints?: NearbyPoint[];
  guides?: HotelGuide[];
  bookingSupport?: Bilingual;
  booking?: {
    integrationSlot: 'HotelBookingSidebar';
  };
}
