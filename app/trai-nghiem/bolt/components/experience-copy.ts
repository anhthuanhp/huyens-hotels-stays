import type { Language } from '../lib/use-language';

export type ExperienceCopy = {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroCta: string;
  storiesTitle: string;
  chapterLabel: (number: string) => string;
  readMore: string;
  readLess: string;
  exploreHotel: (hotelName: string) => string;
  galleryLabel: string;
  noPhoto: string;
  errorTitle: string;
  errorBody: string;
  emptyTitle: string;
  emptyBody: string;
  finalTitle: string;
  finalBody: string;
  finalCta: string;
  lightboxLabel: string;
  lightboxClose: string;
  lightboxPrevious: string;
  lightboxNext: string;
  languageLabel: string;
};

export const experienceCopy: Record<Language, ExperienceCopy> = {
  vi: {
    heroEyebrow: 'Trải nghiệm tại Huyen\u2019s',
    heroTitle: 'Mỗi hành trình, một câu chuyện để nhớ.',
    heroDescription:
      'Từ những góc nhỏ bình yên đến nhịp sống thành phố, khám phá những trải nghiệm làm nên dấu ấn riêng của mỗi kỳ lưu trú tại Huyen\u2019s Hotels & Stays.',
    heroCta: 'Khám phá câu chuyện',
    storiesTitle: 'Những trải nghiệm làm nên câu chuyện của Huyen\u2019s',
    chapterLabel: (number) => `CÂU CHUYỆN ${number}`,
    readMore: 'Đọc thêm',
    readLess: 'Thu gọn',
    exploreHotel: (hotelName) => `Khám phá ${hotelName}`,
    galleryLabel: 'Bộ sưu tập ảnh',
    noPhoto: 'Hình ảnh đang được cập nhật',
    errorTitle: 'Không thể tải dữ liệu trải nghiệm',
    errorBody:
      'Đã có lỗi khi tải nội dung trải nghiệm (VI/EN). Vui lòng tải lại trang hoặc thử lại sau ít phút.',
    emptyTitle: 'Câu chuyện đang được chuẩn bị',
    emptyBody: 'Những trải nghiệm mới sẽ sớm được cập nhật tại đây.',
    finalTitle: 'Câu chuyện tiếp theo bắt đầu từ nơi bạn ở.',
    finalBody:
      'Khám phá những không gian lưu trú tại Huyen\u2019s Hotels & Stays và tìm nơi phù hợp với hành trình của bạn.',
    finalCta: 'KHÁM PHÁ CÁC LOẠI PHÒNG',
    lightboxLabel: 'Xem ảnh',
    lightboxClose: 'Đóng',
    lightboxPrevious: 'Ảnh trước',
    lightboxNext: 'Ảnh sau',
    languageLabel: 'Ngôn ngữ',
  },
  en: {
    heroEyebrow: 'Experiences at Huyen\u2019s',
    heroTitle: 'Every journey has a story worth remembering.',
    heroDescription:
      'From quiet corners to the rhythm of the city, discover the experiences that make each stay at Huyen\u2019s Hotels & Stays truly your own.',
    heroCta: 'Explore the stories',
    storiesTitle: 'The experiences behind the Huyen\u2019s story',
    chapterLabel: (number) => `STORY ${number}`,
    readMore: 'Read more',
    readLess: 'Show less',
    exploreHotel: (hotelName) => `Explore ${hotelName}`,
    galleryLabel: 'Photo gallery',
    noPhoto: 'Photos coming soon',
    errorTitle: 'We could not load the experiences',
    errorBody:
      'Something went wrong while loading the experience content (VI/EN). Please refresh the page or try again in a few minutes.',
    emptyTitle: 'Our stories are being prepared',
    emptyBody: 'New experiences will be shared here soon.',
    finalTitle: 'The next story begins where you stay.',
    finalBody:
      'Discover the places to stay at Huyen\u2019s Hotels & Stays and find the one that suits your journey.',
    finalCta: 'EXPLORE OUR ROOMS',
    lightboxLabel: 'Photo viewer',
    lightboxClose: 'Close',
    lightboxPrevious: 'Previous photo',
    lightboxNext: 'Next photo',
    languageLabel: 'Language',
  },
};
