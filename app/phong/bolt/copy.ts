import type { Lang } from './types';

export const copy = {
  hero: {
    eyebrow: { vi: 'Huyen\u2019s Hotels & Stays', en: 'Huyen\u2019s Hotels & Stays' },
    title: { vi: 'T\u00ECm kh\u00F4ng gian d\u00E0nh ri\u00EAng cho b\u1EA1n.', en: 'Hotels, Guesthouses & Rooms in Ho Chi Minh City' },
    description: {
      vi: 'Khám phá bộ sưu tập phòng tại hệ thống Huyen’s Hotels & Stays, với nhiều lựa chọn phù hợp cho chuyến du lịch hoặc công tác ngắn ngày. Mỗi loại phòng mang một nét riêng, giúp bạn dễ dàng so sánh và lựa chọn không gian phù hợp với nhu cầu của mình.',
      en: 'Explore rooms for your Saigon visit. Compare room types and nightly rates before choosing your dates.',
    },
    cta: { vi: 'Kh\u00E1m ph\u00E1 c\u00E1c lo\u1EA1i ph\u00F2ng', en: 'Explore our rooms' },
    imageNote: { vi: '\u1EA2nh minh h\u1ECDa', en: 'Illustration' },
  },
  collection: {
    title: { vi: 'Nh\u1EEFng c\u0103n ph\u00F2ng d\u00E0nh cho h\u00E0nh tr\u00ECnh c\u1EE7a b\u1EA1n.', en: 'Rooms made for the journey you\u2019re on.' },
    subtitle: {
      vi: 'So s\u00E1nh theo kh\u00E1ch s\u1EA1n, gi\u00E1 v\u00E0 lo\u1EA1i gi\u01A1\u0300 \u0111\u1EC3 t\u00ECm c\u0103n ph\u00F2ng ph\u00F9 h\u1EE3p nh\u1EA5t.',
      en: 'Compare by hotel, price and bed type to find the room that suits you best.',
    },
    count: { vi: 'c\u0103n ph\u00F2ng', en: 'rooms' },
  },
  filters: {
    allHotels: { vi: 'T\u1EA5t c\u1EA3 kh\u00E1ch s\u1EA1n', en: 'All hotels' },
    daily: { vi: 'Theo \u0111\u00EAm', en: 'Per night' },
    monthly: { vi: 'Theo th\u00E1ng', en: 'Per month' },
  },
  card: {
    perNight: { vi: '/ \u0111\u00EAm', en: '/ night' },
    perMonth: { vi: '/ th\u00E1ng', en: '/ month' },
    contact: { vi: 'Li\u00EAn h\u1EC7', en: 'Contact' },
    contactHint: { vi: 'Li\u00EAn h\u1EC7 \u0111\u1EC3 nh\u1EADn b\u00E1o gi\u00E1', en: 'Contact us for a quote' },
    guests: { vi: 'Kh\u00E1ch', en: 'Guests' },
    guest: { vi: 'Kh\u00E1ch', en: 'Guest' },
    size: { vi: 'Di\u1EC7n t\u00EDch', en: 'Size' },
    beds: { vi: 'Gi\u01A1\u0300', en: 'Beds' },
    detail: { vi: 'Xem chi ti\u1EBFt ph\u00F2ng', en: 'View room details' },
  },
  empty: {
    title: { vi: 'Ch\u01B0a c\u00F3 ph\u00F2ng \u0111\u1EC3 hi\u1EC3n th\u1ECB', en: 'No rooms to show yet' },
    description: {
      vi: 'B\u1ED9 s\u01B0\u1EE9u t\u1EADp ph\u00F2ng \u0111ang \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt. B\u1EA1n vui l\u00F2ng quay l\u1EA1i sau ho\u1EB7c li\u00EAn h\u1EC7 \u0111\u1EC3 ch\u00FAng t\u00F4i t\u01B0 v\u1EA5n c\u0103n ph\u00F2ng ph\u00F9 h\u1EE3p.',
      en: 'Our room collection is being updated. Please check back soon, or reach out and we\u2019ll help you find the right room.',
    },
  },
  finalCta: {
    title: { vi: 'S\u1EB5n s\u00E0ng cho h\u00E0nh tr\u00ECnh c\u1EE7a b\u1EA1n?', en: 'Ready for your journey?' },
    description: {
      vi: 'Ch\u1ECDn ng\u00E0y l\u01B0u tr\u00FA v\u00E0 kh\u00E1m ph\u00E1 ph\u00F2ng ph\u00F9 h\u1EE3p t\u1EA1i Huyen\u2019s Hotels & Stays.',
      en: 'Choose your dates and discover the right room at Huyen\u2019s Hotels & Stays.',
    },
    button: { vi: 'T\u00CCM PH\u00D2NG', en: 'FIND A ROOM' },
  },
} satisfies Record<string, Record<Lang, string> | Record<string, Record<Lang, string>>>;

export function pick(node: Record<Lang, string>, lang: Lang): string {
  return node[lang];
}
