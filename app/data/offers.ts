export type Offer = {
  slug: string;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  periodVi: string;
  periodEn: string;
  conditionsVi: string[];
  conditionsEn: string[];
  image: string;
  hotelSlugs: string[];
  status: "active" | "inactive";
};

export const offers: Offer[] = [
  {
    slug: "stay-longer-save-more",
    titleVi: "Ở lâu hơn, tiết kiệm hơn",
    titleEn: "Stay Longer, Save More",
    descriptionVi:
      "Ưu đãi dành cho những kỳ lưu trú dài ngày tại các cơ sở thuộc Huyen's Hotels & Stays.",
    descriptionEn:
      "An offer for guests planning longer stays across Huyen's Hotels & Stays.",
    periodVi: "Áp dụng quanh năm",
    periodEn: "Available year-round",
    conditionsVi: [
      "Áp dụng cho các kỳ lưu trú từ 3 đêm.",
      "Giá và điều kiện có thể thay đổi theo từng cơ sở.",
      "Không áp dụng đồng thời với một số chương trình khuyến mãi khác.",
    ],
    conditionsEn: [
      "Available for stays of 3 nights or more.",
      "Rates and conditions may vary by property.",
      "Cannot be combined with selected other promotions.",
    ],
    image: "/images/hotels/anh-kim.jpg",
    hotelSlugs: [
      "anh-kim-hotel",
      "ae-guesthouse",
      "huyen-house",
      "huyenhomestay",
    ],
    status: "active",
  },

  {
    slug: "direct-booking",
    titleVi: "Ưu đãi đặt phòng trực tiếp",
    titleEn: "Direct Booking Offer",
    descriptionVi:
      "Khám phá những lợi ích dành cho khách đặt phòng trực tiếp với Huyen's Hotels & Stays.",
    descriptionEn:
      "Discover selected benefits available when booking directly with Huyen's Hotels & Stays.",
    periodVi: "Áp dụng theo từng thời điểm",
    periodEn: "Available during selected periods",
    conditionsVi: [
      "Áp dụng khi đặt phòng trực tiếp.",
      "Ưu đãi phụ thuộc vào tình trạng phòng.",
      "Vui lòng kiểm tra điều kiện khi đặt phòng.",
    ],
    conditionsEn: [
      "Available for direct bookings.",
      "Subject to room availability.",
      "Please check the applicable conditions when booking.",
    ],
    image: "/images/hotels/huyen-house.jpg",
    hotelSlugs: [
      "huyen-house",
      "huyenhomestay",
    ],
    status: "active",
  },

  {
    slug: "city-break",
    titleVi: "City Break",
    titleEn: "City Break",
    descriptionVi:
      "Một lựa chọn phù hợp cho những chuyến đi ngắn ngày và khám phá TP. Hồ Chí Minh.",
    descriptionEn:
      "A flexible option for short city breaks and exploring Ho Chi Minh City.",
    periodVi: "Áp dụng theo tình trạng phòng",
    periodEn: "Subject to availability",
    conditionsVi: [
      "Áp dụng cho một số loại phòng.",
      "Số lượng phòng ưu đãi có giới hạn.",
      "Giá cuối cùng được xác nhận tại thời điểm đặt phòng.",
    ],
    conditionsEn: [
      "Available for selected room types.",
      "Limited promotional inventory.",
      "Final rates are confirmed at the time of booking.",
    ],
    image: "/images/hotels/ae-guesthouse.jpg",
    hotelSlugs: [
      "ae-guesthouse",
      "anh-kim-hotel",
    ],
    status: "active",
  },
];