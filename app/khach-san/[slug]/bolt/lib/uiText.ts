import type { Bilingual } from '../types/hotel';

export const ui = {
  viewAllImages: {
    vi: 'Xem tất cả hình ảnh',
    en: 'View all images',
  } satisfies Bilingual,
  welcomeTitle: {
    vi: 'Chào mừng đến với',
    en: 'Welcome to',
  } satisfies Bilingual,
  overviewNav: {
    vi: 'Tổng quan',
    en: 'Overview',
  } satisfies Bilingual,
  highlightsLabel: {
    vi: 'Điểm nổi bật',
    en: 'Highlights',
  } satisfies Bilingual,
  amenitiesLabel: {
    vi: 'Tiện nghi',
    en: 'Amenities',
  } satisfies Bilingual,
  areaInfoLabel: {
    vi: 'Thông tin khu vực',
    en: 'Area information',
  } satisfies Bilingual,
  bookingTitle: {
    vi: 'Đặt phòng',
    en: 'Book your stay',
  } satisfies Bilingual,
  bookingSubtitle: {
    vi: 'Chọn ngày và loại phòng phù hợp với hành trình của bạn.',
    en: 'Choose dates and a room type that fits your journey.',
  } satisfies Bilingual,
  bookingIntegrationNote: {
    vi: 'Khu vực tích hợp widget đặt phòng hiện có của hệ thống.',
    en: 'Integration slot for the existing booking widget.',
  } satisfies Bilingual,
  bookingSupportTitle: {
    vi: 'Hỗ trợ đặt phòng',
    en: 'Booking support',
  } satisfies Bilingual,
  roomsEyebrow: {
    vi: 'Lưu trú',
    en: 'Stay',
  } satisfies Bilingual,
  roomsTitle: {
    vi: 'Khám phá các loại phòng',
    en: 'Explore room types',
  } satisfies Bilingual,
  roomsSubtitle: {
    vi: 'Chọn không gian phù hợp với nhu cầu và thời gian lưu trú của bạn.',
    en: 'Choose the space that suits your needs and length of stay.',
  } satisfies Bilingual,
  perNight: {
    vi: '/ đêm',
    en: '/ night',
  } satisfies Bilingual,
  perMonth: {
    vi: '/ tháng',
    en: '/ month',
  } satisfies Bilingual,
  monthly: {
    vi: 'Giá theo tháng',
    en: 'Monthly',
  } satisfies Bilingual,
  viewRoomDetail: {
    vi: 'Xem chi tiết phòng',
    en: 'View room details',
  } satisfies Bilingual,
  contact: {
    vi: 'Liên hệ',
    en: 'Contact',
  } satisfies Bilingual,
  sizeLabel: {
    vi: 'Diện tích',
    en: 'Size',
  } satisfies Bilingual,
  guestsLabel: {
    vi: 'Sức chứa',
    en: 'Capacity',
  } satisfies Bilingual,
  bedLabel: {
    vi: 'Loại giường',
    en: 'Bed type',
  } satisfies Bilingual,
  guestsUnit: {
    vi: 'khách',
    en: 'guests',
  } satisfies Bilingual,
  sqmUnit: {
    vi: 'm²',
    en: 'm²',
  } satisfies Bilingual,
  amenitiesTitle: {
    vi: 'Tiện nghi & Trải nghiệm',
    en: 'Amenities & Experience',
  } satisfies Bilingual,
  amenitiesSubtitle: {
    vi: 'Mọi thứ bạn cần cho một kỳ nghỉ thoải mái và trọn vẹn.',
    en: 'Everything you need for a comfortable and complete stay.',
  } satisfies Bilingual,
  locationTitle: {
    vi: 'Khám phá khu vực xung quanh',
    en: 'Explore the surrounding area',
  } satisfies Bilingual,
  viewMap: {
    vi: 'Xem bản đồ',
    en: 'View on map',
  } satisfies Bilingual,
  addressLabel: {
    vi: 'Địa chỉ khách sạn',
    en: 'Hotel address',
  } satisfies Bilingual,
  nearbyLabel: {
    vi: 'Điểm khám phá gần đó',
    en: 'Nearby places to explore',
  } satisfies Bilingual,
  guidesLabel: {
    vi: 'Hướng dẫn khám phá',
    en: 'Local guide',
  } satisfies Bilingual,
  ctaTitle: {
    vi: 'Hành trình của bạn bắt đầu từ đây.',
    en: 'Your journey starts here.',
  } satisfies Bilingual,
  ctaDescription: {
    vi: 'Khám phá những lựa chọn lưu trú tại {name} và chọn căn phòng phù hợp với bạn.',
    en: 'Discover the stay options at {name} and choose the room that suits you.',
  } satisfies Bilingual,
  ctaButton: {
    vi: 'Xem các loại phòng',
    en: 'View room types',
  } satisfies Bilingual,
  closeGallery: {
    vi: 'Đóng bộ sưu tập ảnh',
    en: 'Close gallery',
  } satisfies Bilingual,
  galleryCounter: {
    vi: 'Ảnh {current} / {total}',
    en: 'Image {current} / {total}',
  } satisfies Bilingual,
  imagePlaceholder: {
    vi: 'Hình ảnh khách sạn sẽ sớm được cập nhật',
    en: 'Hotel images coming soon',
  } satisfies Bilingual,
  breadcrumbHotels: {
    vi: 'Khách sạn',
    en: 'Hotels',
  } satisfies Bilingual,
} as const;

export type UiKey = keyof typeof ui;

export const format = (
  template: string,
  params: Record<string, string | number>,
): string =>
  Object.entries(params).reduce(
    (acc, [key, value]) => acc.split(`{${key}}`).join(String(value)),
    template,
  );
