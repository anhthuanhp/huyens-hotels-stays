export type BlogPost = {
  slug: string;
  titleVi: string;
  titleEn: string;
  excerptVi: string;
  excerptEn: string;
  contentVi: string[];
  contentEn: string[];
  categoryVi: string;
  categoryEn: string;
  image: string;
  date: string;
  readTime: number;
  featured?: boolean;
  status: "active" | "inactive";
};

export const blogPosts: BlogPost[] = [
  {
    slug: "nhung-dieu-nen-biet-khi-du-lich-ho-chi-minh-city",
    titleVi:
      "Những điều nên biết khi du lịch TP. Hồ Chí Minh",
    titleEn:
      "Things to Know Before Visiting Ho Chi Minh City",
    excerptVi:
      "Một vài thông tin hữu ích giúp bạn dễ dàng bắt đầu hành trình khám phá TP. Hồ Chí Minh.",
    excerptEn:
      "A few useful tips to help you start exploring Ho Chi Minh City with ease.",
    contentVi: [
      "TP. Hồ Chí Minh là một thành phố năng động với sự kết hợp giữa nhịp sống hiện đại và những dấu ấn văn hóa lâu đời.",
      "Khi lưu trú tại khu vực trung tâm, bạn có thể dễ dàng tiếp cận nhiều điểm tham quan, nhà hàng, quán cà phê và các khu phố đặc trưng của thành phố.",
      "Một trong những cách thú vị nhất để khám phá thành phố là dành thời gian đi bộ, thưởng thức ẩm thực địa phương và quan sát nhịp sống hàng ngày.",
      "Nếu đây là lần đầu bạn đến TP. Hồ Chí Minh, nên sắp xếp lịch trình linh hoạt để có thời gian khám phá cả những địa điểm nổi tiếng và những góc phố nhỏ hơn.",
    ],
    contentEn: [
      "Ho Chi Minh City is a dynamic destination where modern city life meets layers of history and local culture.",
      "Staying in central areas gives you convenient access to attractions, restaurants, cafés and some of the city's most distinctive neighborhoods.",
      "One of the most enjoyable ways to experience the city is to walk, taste local food and observe everyday life.",
      "For a first visit, keeping your itinerary flexible can give you time to explore both well-known attractions and quieter local streets.",
    ],
    categoryVi: "Du lịch",
    categoryEn: "Travel",
    image: "/images/blog/blog-1.jpg",
    date: "2026-09-01",
    readTime: 5,
    featured: true,
    status: "active",
  },
  {
    slug: "an-gi-o-trung-tam-tp-ho-chi-minh",
    titleVi:
      "Ăn gì ở trung tâm TP. Hồ Chí Minh?",
    titleEn:
      "What to Eat in Central Ho Chi Minh City?",
    excerptVi:
      "Khám phá những trải nghiệm ẩm thực mà bạn có thể tìm thấy trong một ngày ở trung tâm thành phố.",
    excerptEn:
      "Discover food experiences you can enjoy during a day in central Ho Chi Minh City.",
    contentVi: [
      "Ẩm thực là một phần quan trọng trong trải nghiệm khám phá TP. Hồ Chí Minh.",
      "Từ những món ăn đường phố quen thuộc đến các quán ăn lâu năm, du khách có rất nhiều lựa chọn trong khu vực trung tâm.",
      "Bạn có thể bắt đầu ngày mới bằng một món ăn sáng địa phương, dành buổi trưa cho một quán ăn nhỏ và kết thúc ngày bằng cà phê hoặc một món ăn nhẹ.",
      "Điều thú vị nằm ở việc không nhất thiết phải tìm kiếm những nơi quá nổi tiếng. Nhiều trải nghiệm đáng nhớ lại đến từ những hàng quán nhỏ nằm trên các con phố địa phương.",
    ],
    contentEn: [
      "Food is an important part of discovering Ho Chi Minh City.",
      "From familiar street food to long-established local restaurants, visitors have many choices around the city center.",
      "You can start the day with a local breakfast, enjoy lunch at a small neighborhood restaurant and finish with coffee or a light evening snack.",
      "Some of the most memorable experiences do not necessarily come from the most famous places. Small local spots can often provide a more personal glimpse of the city.",
    ],
    categoryVi: "Ẩm thực",
    categoryEn: "Food",
    image: "/images/blog/blog-2.jpg",
    date: "2026-09-05",
    readTime: 4,
    status: "active",
  },
  {
    slug: "mot-ngay-song-cham-o-ho-chi-minh-city",
    titleVi:
      "Một ngày sống chậm ở TP. Hồ Chí Minh",
    titleEn:
      "A Slow Day in Ho Chi Minh City",
    excerptVi:
      "Không phải chuyến đi nào cũng cần một lịch trình dày đặc. Hãy dành một ngày để tận hưởng thành phố theo nhịp riêng.",
    excerptEn:
      "Not every trip needs a packed itinerary. Take a day to experience the city at your own pace.",
    contentVi: [
      "Sau những ngày bận rộn, đôi khi điều bạn cần trong một chuyến đi chỉ là một ngày thật chậm.",
      "Hãy bắt đầu bằng một buổi sáng không quá vội vàng. Một ly cà phê, một bữa sáng đơn giản và một đoạn đường đi bộ có thể là cách tuyệt vời để cảm nhận thành phố.",
      "Buổi chiều có thể dành cho việc nghỉ ngơi, đọc sách hoặc khám phá một khu phố mà bạn chưa từng ghé qua.",
      "Đến tối, hãy tìm một địa điểm nhỏ để thưởng thức bữa ăn và ngắm thành phố thay đổi khi ánh đèn bắt đầu xuất hiện.",
    ],
    contentEn: [
      "After a busy schedule, sometimes all you need from a trip is a slower day.",
      "Start the morning without rushing. A coffee, a simple breakfast and a walk can be a wonderful way to experience the city.",
      "Spend the afternoon resting, reading or exploring a neighborhood you have never visited before.",
      "In the evening, find a small local place for dinner and watch the city change as the lights come on.",
    ],
    categoryVi: "Trải nghiệm",
    categoryEn: "Experience",
    image: "/images/blog/blog-3.jpg",
    date: "2026-09-10",
    readTime: 4,
    status: "active",
  },
];