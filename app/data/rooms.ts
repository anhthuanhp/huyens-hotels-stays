export type Room = {
  slug: string;
  hotelSlug: string;

  nameVi: string;
  nameEn: string;

  descriptionVi: string;
  descriptionEn: string;

  image: string;

  size: number;
  maxGuests: number;

  bedsVi: string;
  bedsEn: string;

  basePrice: number;

  // Tổng số phòng vật lý của loại phòng này
  quantity: number;

  amenitiesVi: string[];
  amenitiesEn: string[];

  status: "active" | "inactive";
};

export const rooms: Room[] = [
  // =========================================================
  // ANH KIM HOTEL
  // =========================================================
  {
    slug: "standard-double",
    hotelSlug: "anh-kim-hotel",

    nameVi: "Phòng Standard Double",
    nameEn: "Standard Double Room",

    descriptionVi:
      "Phòng nghỉ tiện nghi dành cho khách đi công tác hoặc những chuyến lưu trú ngắn ngày tại trung tâm thành phố.",
    descriptionEn:
      "A comfortable room designed for business trips and short stays in the heart of the city.",

    image: "/images/hotels/anh-kim.jpg",

    size: 22,
    maxGuests: 2,

    bedsVi: "1 giường đôi",
    bedsEn: "1 double bed",

    basePrice: 500000,

    quantity: 5,

    amenitiesVi: [
      "Wi-Fi miễn phí",
      "Điều hòa",
      "TV",
      "Phòng tắm riêng",
    ],

    amenitiesEn: [
      "Free Wi-Fi",
      "Air conditioning",
      "TV",
      "Private bathroom",
    ],

    status: "active",
  },

  {
    slug: "deluxe-double",
    hotelSlug: "anh-kim-hotel",

    nameVi: "Phòng Deluxe Double",
    nameEn: "Deluxe Double Room",

    descriptionVi:
      "Không gian rộng rãi hơn với đầy đủ tiện nghi, phù hợp cho những kỳ lưu trú thoải mái tại thành phố.",
    descriptionEn:
      "A more spacious room with additional comfort for a relaxing city stay.",

    image: "/images/hotels/anh-kim.jpg",

    size: 28,
    maxGuests: 2,

    bedsVi: "1 giường đôi lớn",
    bedsEn: "1 large double bed",

    basePrice: 650000,

    quantity: 3,

    amenitiesVi: [
      "Wi-Fi miễn phí",
      "Điều hòa",
      "TV",
      "Phòng tắm riêng",
      "Tủ lạnh",
    ],

    amenitiesEn: [
      "Free Wi-Fi",
      "Air conditioning",
      "TV",
      "Private bathroom",
      "Refrigerator",
    ],

    status: "active",
  },

  // =========================================================
  // A&E GUESTHOUSE
  // =========================================================
  {
    slug: "standard-room",
    hotelSlug: "ae-guesthouse",

    nameVi: "Phòng Standard",
    nameEn: "Standard Room",

    descriptionVi:
      "Phòng nghỉ gọn gàng và thoải mái, phù hợp cho khách du lịch và những chuyến đi ngắn ngày.",
    descriptionEn:
      "A clean and comfortable room suitable for travelers and short stays.",

    image: "/images/hotels/ae-guesthouse.jpg",

    size: 20,
    maxGuests: 2,

    bedsVi: "1 giường đôi",
    bedsEn: "1 double bed",

    basePrice: 450000,

    quantity: 4,

    amenitiesVi: [
      "Wi-Fi miễn phí",
      "Điều hòa",
      "TV",
      "Phòng tắm riêng",
    ],

    amenitiesEn: [
      "Free Wi-Fi",
      "Air conditioning",
      "TV",
      "Private bathroom",
    ],

    status: "active",
  },

  {
    slug: "family-room",
    hotelSlug: "ae-guesthouse",

    nameVi: "Phòng Family",
    nameEn: "Family Room",

    descriptionVi:
      "Không gian rộng rãi dành cho gia đình hoặc nhóm khách cần thêm không gian nghỉ ngơi.",
    descriptionEn:
      "A spacious room designed for families or small groups.",

    image: "/images/hotels/ae-guesthouse.jpg",

    size: 32,
    maxGuests: 4,

    bedsVi: "2 giường đôi",
    bedsEn: "2 double beds",

    basePrice: 750000,

    quantity: 2,

    amenitiesVi: [
      "Wi-Fi miễn phí",
      "Điều hòa",
      "TV",
      "Phòng tắm riêng",
      "Tủ lạnh",
    ],

    amenitiesEn: [
      "Free Wi-Fi",
      "Air conditioning",
      "TV",
      "Private bathroom",
      "Refrigerator",
    ],

    status: "active",
  },

  // =========================================================
  // HUYEN HOUSE
  // =========================================================
  {
    slug: "cozy-room",
    hotelSlug: "huyen-house",

    nameVi: "Phòng Cozy",
    nameEn: "Cozy Room",

    descriptionVi:
      "Không gian ấm cúng và riêng tư dành cho những kỳ nghỉ thoải mái.",
    descriptionEn:
      "A cozy and private space designed for a comfortable stay.",

    image: "/images/hotels/huyen-house.jpg",

    size: 20,
    maxGuests: 2,

    bedsVi: "1 giường đôi",
    bedsEn: "1 double bed",

    basePrice: 500000,

    quantity: 4,

    amenitiesVi: [
      "Wi-Fi miễn phí",
      "Điều hòa",
      "TV",
      "Phòng tắm riêng",
    ],

    amenitiesEn: [
      "Free Wi-Fi",
      "Air conditioning",
      "TV",
      "Private bathroom",
    ],

    status: "active",
  },

  {
    slug: "family-house",
    hotelSlug: "huyen-house",

    nameVi: "Phòng Family",
    nameEn: "Family Room",

    descriptionVi:
      "Phòng rộng rãi dành cho gia đình hoặc nhóm bạn.",
    descriptionEn:
      "A spacious room for families or groups of friends.",

    image: "/images/hotels/huyen-house.jpg",

    size: 35,
    maxGuests: 4,

    bedsVi: "2 giường đôi",
    bedsEn: "2 double beds",

    basePrice: 800000,

    quantity: 2,

    amenitiesVi: [
      "Wi-Fi miễn phí",
      "Điều hòa",
      "TV",
      "Phòng tắm riêng",
      "Tủ lạnh",
    ],

    amenitiesEn: [
      "Free Wi-Fi",
      "Air conditioning",
      "TV",
      "Private bathroom",
      "Refrigerator",
    ],

    status: "active",
  },

  // =========================================================
  // HUYENHOMESTAY
  // =========================================================
  {
    slug: "private-room",
    hotelSlug: "huyenhomestay",

    nameVi: "Phòng Private",
    nameEn: "Private Room",

    descriptionVi:
      "Không gian riêng tư, phù hợp cho khách muốn tận hưởng một kỳ lưu trú thoải mái.",
    descriptionEn:
      "A private space for guests looking for a comfortable and relaxing stay.",

    image: "/images/hotels/huyenhomestay.jpg",

    size: 22,
    maxGuests: 2,

    bedsVi: "1 giường đôi",
    bedsEn: "1 double bed",

    basePrice: 450000,

    quantity: 5,

    amenitiesVi: [
      "Wi-Fi miễn phí",
      "Điều hòa",
      "TV",
      "Phòng tắm riêng",
    ],

    amenitiesEn: [
      "Free Wi-Fi",
      "Air conditioning",
      "TV",
      "Private bathroom",
    ],

    status: "active",
  },

  {
    slug: "family-homestay",
    hotelSlug: "huyenhomestay",

    nameVi: "Phòng Family",
    nameEn: "Family Room",

    descriptionVi:
      "Không gian rộng rãi dành cho gia đình hoặc nhóm khách.",
    descriptionEn:
      "A spacious room suitable for families or groups.",

    image: "/images/hotels/huyenhomestay.jpg",

    size: 34,
    maxGuests: 4,

    bedsVi: "2 giường đôi",
    bedsEn: "2 double beds",

    basePrice: 750000,

    quantity: 2,

    amenitiesVi: [
      "Wi-Fi miễn phí",
      "Điều hòa",
      "TV",
      "Phòng tắm riêng",
      "Tủ lạnh",
    ],

    amenitiesEn: [
      "Free Wi-Fi",
      "Air conditioning",
      "TV",
      "Phòng tắm riêng",
      "Tủ lạnh",
    ],

    status: "active",
  },
];