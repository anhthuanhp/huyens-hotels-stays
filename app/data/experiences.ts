export type Experience = {
  slug: string;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  locationVi: string;
  locationEn: string;
  image: string;
  hotelSlugs: string[];
  status: "active" | "inactive";
};

export const experiences: Experience[] = [
  {
    slug: "discover-ho-chi-minh-city",
    titleVi: "Khám phá TP. Hồ Chí Minh",
    titleEn: "Discover Ho Chi Minh City",
    descriptionVi:
      "Từ những con phố trung tâm đến các khu chợ, quán cà phê và điểm đến địa phương, thành phố luôn có những điều mới để khám phá.",
    descriptionEn:
      "From central streets to local markets, cafés and neighborhood spots, the city always offers something new to discover.",
    locationVi: "TP. Hồ Chí Minh",
    locationEn: "Ho Chi Minh City",
    image: "/images/experience/experience.jpg",
    hotelSlugs: [
      "anh-kim-hotel",
      "ae-guesthouse",
      "huyen-house",
      "huyenhomestay",
    ],
    status: "active",
  },

  {
    slug: "local-food",
    titleVi: "Hương vị địa phương",
    titleEn: "Local Flavours",
    descriptionVi:
      "Trải nghiệm ẩm thực thành phố từ những món ăn đường phố quen thuộc đến các quán ăn địa phương được yêu thích.",
    descriptionEn:
      "Experience the city through local food, from familiar street dishes to neighborhood favorites.",
    locationVi: "Trung tâm thành phố",
    locationEn: "Central Ho Chi Minh City",
    image: "/images/hotels/ae-guesthouse.jpg",
    hotelSlugs: [
      "anh-kim-hotel",
      "ae-guesthouse",
    ],
    status: "active",
  },

  {
    slug: "slow-city-stay",
    titleVi: "Một ngày sống chậm",
    titleEn: "A Slow City Day",
    descriptionVi:
      "Dành thời gian nghỉ ngơi, thưởng thức một ly cà phê và cảm nhận nhịp sống thành phố theo cách riêng của bạn.",
    descriptionEn:
      "Take your time, enjoy a coffee and experience the rhythm of the city at your own pace.",
    locationVi: "TP. Hồ Chí Minh",
    locationEn: "Ho Chi Minh City",
    image: "/images/hotels/huyen-house.jpg",
    hotelSlugs: [
      "huyen-house",
      "huyenhomestay",
    ],
    status: "active",
  },
];