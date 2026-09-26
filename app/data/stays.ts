export type Stay = {
  slug: string;
  name: string;

  typeVi: string;
  typeEn: string;

  areaVi: string;
  areaEn: string;

  addressVi: string;
  addressEn: string;

  descriptionVi: string;
  descriptionEn: string;

  cover: string;
  gallery: string[];

  featured?: boolean;
};

export const stays: Stay[] = [
  {
    slug: "anh-kim-hotel",
    name: "Anh Kim Hotel",

    typeVi: "Khách sạn",
    typeEn: "Hotel",

    areaVi: "Quận 1, TP. Hồ Chí Minh",
    areaEn: "District 1, Ho Chi Minh City",

    addressVi:
      "310 Cô Bắc, Phường Cầu Ông Lãnh, TP. Hồ Chí Minh",
    addressEn:
      "310 Co Bac Street, Cau Ong Lanh Ward, Ho Chi Minh City",

    descriptionVi:
      "Không gian lưu trú thuận tiện dành cho những hành trình khám phá trung tâm thành phố.",
    descriptionEn:
      "A convenient stay for guests exploring the heart of Ho Chi Minh City.",

    cover: "/images/hotels/anh-kim.jpg",

    gallery: [
      "/images/hotels/anh-kim.jpg",
      "/images/hotels/anh-kim.jpg",
      "/images/hotels/anh-kim.jpg",
    ],

    featured: true,
  },

  {
    slug: "ae-guesthouse",
    name: "A&E Guesthouse",

    typeVi: "Guesthouse",
    typeEn: "Guesthouse",

    areaVi: "TP. Hồ Chí Minh",
    areaEn: "Ho Chi Minh City",

    addressVi: "",
    addressEn: "",

    descriptionVi:
      "Một lựa chọn lưu trú thân thiện, phù hợp cho những chuyến đi ngắn ngày và khám phá thành phố.",
    descriptionEn:
      "A welcoming stay for short trips and discovering the city.",

    cover: "/images/hotels/ae-guesthouse.jpg",

    gallery: [
      "/images/hotels/ae-guesthouse.jpg",
      "/images/hotels/ae-guesthouse.jpg",
      "/images/hotels/ae-guesthouse.jpg",
    ],

    featured: true,
  },

  {
    slug: "huyen-house",
    name: "Huyen House",

    typeVi: "Homestay",
    typeEn: "Homestay",

    areaVi: "TP. Hồ Chí Minh",
    areaEn: "Ho Chi Minh City",

    addressVi: "",
    addressEn: "",

    descriptionVi:
      "Không gian mang cảm giác gần gũi và riêng tư, phù hợp cho những kỳ lưu trú thoải mái.",
    descriptionEn:
      "A private and welcoming space designed for comfortable stays.",

    cover: "/images/hotels/huyen-house.jpg",

    gallery: [
      "/images/hotels/huyen-house.jpg",
      "/images/hotels/huyen-house.jpg",
      "/images/hotels/huyen-house.jpg",
    ],

    featured: true,
  },

  {
    slug: "huyenhomestay",
    name: "Huyenhomestay",

    typeVi: "Homestay",
    typeEn: "Homestay",

    areaVi: "TP. Hồ Chí Minh",
    areaEn: "Ho Chi Minh City",

    addressVi: "",
    addressEn: "",

    descriptionVi:
      "Một không gian lưu trú linh hoạt cho những du khách muốn trải nghiệm thành phố theo cách riêng.",
    descriptionEn:
      "A flexible stay for guests who want to experience the city their own way.",

    cover: "/images/hotels/huyenhomestay.jpg",

    gallery: [
      "/images/hotels/huyenhomestay.jpg",
      "/images/hotels/huyenhomestay.jpg",
      "/images/hotels/huyenhomestay.jpg",
    ],

    featured: true,
  },
];