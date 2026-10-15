export type HomeFaqItem = {
  questionVi: string;
  questionEn: string;
  answerVi: string;
  answerEn: string;
};

export type HomeFaqGroup = {
  titleVi: string;
  titleEn: string;
  items: HomeFaqItem[];
};

// Answers stay within confirmed website behavior and avoid unverified policies.
export const HOME_FAQ_GROUPS: HomeFaqGroup[] = [
  {
    titleVi: "Đặt phòng",
    titleEn: "Booking",
    items: [
      {
        questionVi: "Làm thế nào để đặt phòng tại Huyen’s Hotels & Stays?",
        questionEn: "How can I book a room at Huyen’s Hotels & Stays?",
        answerVi: "Chọn khách sạn, ngày lưu trú và loại phòng trên website, sau đó gửi thông tin theo hướng dẫn. Bạn cũng có thể đặt qua OTA nếu khách sạn có liên kết đặt phòng.",
        answerEn: "Choose a hotel, stay dates, and room on the website, then submit your details as prompted. You can also use an OTA link when one is available for the hotel.",
      },
      {
        questionVi: "Tôi có thể đặt phòng trực tiếp với khách sạn không?",
        questionEn: "Can I book directly with the hotel?",
        answerVi: "Có. Bạn có thể gửi yêu cầu đặt phòng trực tiếp trên website bằng cách chọn khách sạn, ngày ở và loại phòng.",
        answerEn: "Yes. You can submit a direct booking request on this website by choosing a hotel, dates, and room type.",
      },
      {
        questionVi: "Đặt phòng trực tiếp có giá tốt hơn đặt qua OTA không?",
        questionEn: "Is direct booking cheaper than booking through an OTA?",
        answerVi: "Giá và ưu đãi có thể khác nhau theo khách sạn, ngày ở và kênh đặt. Hãy so sánh tổng giá và điều kiện hiển thị trước khi xác nhận.",
        answerEn: "Rates and offers may vary by hotel, dates, and booking channel. Compare the displayed total and terms before confirming.",
      },
      {
        questionVi: "Tôi có cần thanh toán trước khi nhận phòng không?",
        questionEn: "Do I need to pay before check-in?",
        answerVi: "Website không thu tiền khi bạn gửi yêu cầu đặt phòng. Việc đặt cọc hoặc thanh toán trước khi nhận phòng được thực hiện trực tiếp với khách sạn theo điều kiện đặt phòng đã xác nhận.",
        answerEn: "The website does not collect payment when you submit a booking request. Any deposit or payment before check-in is arranged directly with the hotel under the confirmed booking terms.",
      },
      {
        questionVi: "Tôi có thể yêu cầu giữ phòng trước khi thanh toán không?",
        questionEn: "Can I ask the hotel to hold a room before payment?",
        answerVi: "Bạn có thể liên hệ trực tiếp với khách sạn để yêu cầu giữ phòng. Để giữ phòng, bạn cần đặt cọc theo thỏa thuận với khách sạn. Vui lòng xác nhận số tiền cọc, thời hạn thanh toán và điều kiện hủy hoặc hoàn cọc trước khi thanh toán.",
        answerEn: "Contact the hotel directly to request a room hold. A deposit is required to hold the room, as agreed with the hotel. Confirm the deposit amount, payment deadline, and cancellation or deposit refund terms before paying.",
      },
      {
        questionVi: "Tôi có thể thay đổi ngày lưu trú sau khi đặt phòng không?",
        questionEn: "Can I change my stay dates after booking?",
        answerVi: "Việc đổi ngày phụ thuộc điều kiện của đặt phòng và kênh bạn đã dùng. Liên hệ khách sạn hoặc OTA càng sớm càng tốt để được kiểm tra.",
        answerEn: "Date changes depend on your booking terms and channel. Contact the hotel or OTA as soon as possible to check your options.",
      },
      {
        questionVi: "Tôi có thể hủy phòng không? Chính sách hủy như thế nào?",
        questionEn: "Can I cancel my booking? What is the cancellation policy?",
        answerVi: "Điều kiện hủy và hoàn tiền phụ thuộc đặt phòng cụ thể và chính sách hoàn và hủy phòng của khách sạn; vui lòng xác nhận với nơi bạn đã đặt trước khi hủy.",
        answerEn: "Cancellation and refund conditions depend on the specific booking and the hotel's cancellation and refund policy; please confirm with your booking provider before cancelling.",
      },
      {
        questionVi: "Tôi có nhận được xác nhận đặt phòng sau khi đặt không?",
        questionEn: "Will I receive a booking confirmation after submitting a booking?",
        answerVi: "Khi gửi đặt phòng trực tiếp thành công, website hiển thị mã đặt phòng và thông báo đã ghi nhận yêu cầu. Hãy lưu mã này; nếu cần xác nhận thêm, liên hệ khách sạn.",
        answerEn: "After a direct booking request is submitted successfully, the website displays a booking code and a receipt message. Keep the code and contact the hotel if you need further confirmation.",
      },
    ],
  },
  {
    titleVi: "Nhận phòng & trả phòng",
    titleEn: "Check-in & check-out",
    items: [
      {
        questionVi: "Giờ nhận phòng là mấy giờ?",
        questionEn: "What time is check-in?",
        answerVi: "Giờ nhận phòng từ 14:00. Nếu dự kiến đến muộn, vui lòng báo trước với khách sạn.",
        answerEn: "Check-in is available from 2:00 PM. If you expect to arrive late, please notify the hotel in advance.",
      },
      {
        questionVi: "Giờ trả phòng là mấy giờ?",
        questionEn: "What time is check-out?",
        answerVi: "Vui lòng hoàn tất trả phòng trước 12:00.",
        answerEn: "Please check out before 12:00 noon.",
      },
      {
        questionVi: "Tôi có thể nhận phòng sớm không?",
        questionEn: "Can I check in early?",
        answerVi: "Nhận phòng sớm phụ thuộc tình trạng phòng và chính sách của từng khách sạn. Hãy liên hệ trước để xác nhận khả năng và chi phí (nếu có).",
        answerEn: "Early check-in depends on room availability and the hotel’s policy. Contact the hotel in advance to confirm availability and any fee.",
      },
      {
        questionVi: "Tôi có thể trả phòng muộn không?",
        questionEn: "Can I check out late?",
        answerVi: "Trả phòng muộn cần được khách sạn xác nhận. Hãy hỏi trước ngày trả phòng về khả năng và chi phí (nếu có).",
        answerEn: "Late check-out requires the hotel’s approval. Ask before your check-out date about availability and any fee.",
      },
      {
        questionVi: "Nếu tôi đến khách sạn vào ban đêm thì có nhận phòng được không?",
        questionEn: "Can I check in if I arrive at night?",
        answerVi: "Khả năng nhận phòng ban đêm tùy khách sạn và cần được xác nhận trước. Hãy báo giờ đến dự kiến khi liên hệ hoặc ghi chú đặt phòng.",
        answerEn: "Night-time check-in depends on the hotel and should be confirmed in advance. Share your estimated arrival time when contacting the hotel or in your booking note.",
      },
      {
        questionVi: "Tôi cần mang theo giấy tờ gì khi nhận phòng?",
        questionEn: "What documents should I bring for check-in?",
        answerVi: "Khi nhận phòng, khách cần xuất trình căn cước công dân hoặc hộ chiếu.",
        answerEn: "Guests must present a Vietnamese citizen ID card or passport at check-in.",
      },
      {
        questionVi: "Tôi có thể gửi hành lý trước giờ nhận phòng không?",
        questionEn: "Can I leave my luggage before check-in?",
        answerVi: "Khách có thể gửi hành lý tại khách sạn. Vui lòng hỏi khách sạn về thời điểm và cách gửi.",
        answerEn: "Guests can leave luggage at the hotel. Please ask the hotel about drop-off times and arrangements.",
      },
      {
        questionVi: "Sau khi trả phòng tôi có thể gửi hành lý lại không?",
        questionEn: "Can I leave my luggage after check-out?",
        answerVi: "Khách có thể gửi hành lý tại khách sạn sau khi trả phòng. Vui lòng hỏi khách sạn về thời điểm và cách nhận lại.",
        answerEn: "Guests can leave luggage at the hotel after check-out. Please ask the hotel about timing and collection arrangements.",
      },
    ],
  },
  {
    titleVi: "Phòng & số lượng khách",
    titleEn: "Rooms & occupancy",
    items: [
      {
        questionVi: "Phòng có những loại nào?",
        questionEn: "What room types are available?",
        answerVi: "Loại phòng khác nhau theo khách sạn. Mở trang khách sạn để xem danh sách phòng, mô tả và tiện nghi hiện có.",
        answerEn: "Room types vary by hotel. Open a hotel page to view its current room list, descriptions, and amenities.",
      },
      {
        questionVi: "Một phòng có thể ở tối đa bao nhiêu người?",
        questionEn: "What is the maximum occupancy per room?",
        answerVi: "Sức chứa tối đa được hiển thị theo từng loại phòng trên trang khách sạn. Chọn đúng số khách khi tìm phòng để kiểm tra lựa chọn phù hợp.",
        answerEn: "Maximum occupancy is listed for each room type on the hotel page. Enter your guest count when searching to check suitable options.",
      },
      {
        questionVi: "Trẻ em có được ở cùng phòng với người lớn không?",
        questionEn: "Can children stay in the same room as adults?",
        answerVi: "Bạn có thể nhập số trẻ em trong yêu cầu tìm/đặt phòng. Điều kiện lưu trú cụ thể tùy loại phòng và khách sạn; hãy xác nhận trước khi đặt.",
        answerEn: "You can enter the number of children in your room search or booking request. Conditions depend on the room and hotel; please confirm before booking.",
      },
      {
        questionVi: "Trẻ em có tính thêm phí không?",
        questionEn: "Is there an extra charge for children?",
        answerVi: "Trẻ em thường được miễn phụ phí. Vui lòng thông báo độ tuổi của trẻ để khách sạn xác nhận điều kiện và phụ phí áp dụng, nếu có.",
        answerEn: "Child surcharges are generally waived. Please tell the hotel the children's ages to confirm the applicable conditions and any surcharge.",
      },
      {
        questionVi: "Tôi có thể yêu cầu giường phụ không?",
        questionEn: "Can I request an extra bed?",
        answerVi: "Khách sạn chúng tôi không cung cấp thêm giường phụ.",
        answerEn: "We do not provide extra beds.",
      },
      {
        questionVi: "Tôi có thể yêu cầu phòng ở tầng thấp/tầng cao không?",
        questionEn: "Can I request a lower or higher floor?",
        answerVi: "Hãy ghi yêu cầu tầng trong ghi chú đặt phòng hoặc liên hệ khách sạn. Yêu cầu tùy tình trạng phòng và chưa được đảm bảo cho đến khi khách sạn xác nhận.",
        answerEn: "Add your floor preference to the booking note or contact the hotel. It depends on availability and is not guaranteed until confirmed by the hotel.",
      },
      {
        questionVi: "Tôi có thể chọn phòng cụ thể không?",
        questionEn: "Can I choose a specific room?",
        answerVi: "Website cho phép chọn loại phòng; việc chọn số phòng cụ thể cần được khách sạn xác nhận. Ghi yêu cầu khi đặt hoặc liên hệ trước.",
        answerEn: "The website lets you choose a room type. A specific room number must be confirmed by the hotel; add a request or contact them in advance.",
      },
      {
        questionVi: "Các phòng có cửa sổ/ban công không?",
        questionEn: "Do the rooms have windows or balconies?",
        answerVi: "Đặc điểm cửa sổ và ban công tùy từng loại phòng. Xem ảnh/mô tả phòng trên trang khách sạn hoặc hỏi khách sạn để xác nhận.",
        answerEn: "Windows and balconies vary by room type. Check the room photos and description or ask the hotel to confirm.",
      },
    ],
  },
  {
    titleVi: "Thanh toán",
    titleEn: "Payment",
    items: [
      {
        questionVi: "Huyen’s Hotels & Stays chấp nhận những hình thức thanh toán nào?",
        questionEn: "Which payment methods does Huyen’s Hotels & Stays accept?",
        answerVi: "Huyen’s Hotels & Stays chấp nhận thanh toán bằng tiền mặt và thẻ. Nếu đặt qua OTA, hãy kiểm tra phương thức thanh toán trên nền tảng đó.",
        answerEn: "Huyen’s Hotels & Stays accepts cash and card payments. For OTA bookings, check the payment methods on that platform.",
      },
      {
        questionVi: "Tôi có thể thanh toán bằng tiền mặt tại khách sạn không?",
        questionEn: "Can I pay in cash at the hotel?",
        answerVi: "Có. Huyen’s Hotels & Stays chấp nhận thanh toán bằng tiền mặt.",
        answerEn: "Yes. Huyen’s Hotels & Stays accepts cash payments.",
      },
      {
        questionVi: "Tôi có thể thanh toán bằng thẻ không?",
        questionEn: "Can I pay by card?",
        answerVi: "Có. Huyen’s Hotels & Stays chấp nhận thanh toán bằng thẻ.",
        answerEn: "Yes. Huyen’s Hotels & Stays accepts card payments.",
      },
      {
        questionVi: "Tôi có thể chuyển khoản trước không?",
        questionEn: "Can I pay by bank transfer in advance?",
        answerVi: "Website không thu tiền chuyển khoản khi bạn gửi yêu cầu đặt phòng. Nếu đặt cọc hoặc thanh toán trước bằng chuyển khoản, hãy xác nhận số tiền, thời hạn thanh toán và thông tin tài khoản qua kênh chính thức của khách sạn trước khi chuyển tiền.",
        answerEn: "The website does not collect bank transfers when you submit a booking request. For a deposit or advance payment by bank transfer, confirm the amount, payment deadline, and bank account details through the hotel’s official channel before transferring money.",
      },
      {
        questionVi: "Giá phòng đã bao gồm thuế và phí chưa?",
        questionEn: "Does the room rate include taxes and fees?",
        answerVi: "Giá phòng hiển thị trên website và OTA chưa bao gồm thuế GTGT. Vui lòng xem tổng tiền và các khoản thuế/phí trước khi xác nhận đặt phòng.",
        answerEn: "Room rates shown on this website and OTAs exclude VAT. Review the total and any taxes or fees before confirming your booking.",
      },
      {
        questionVi: "Nếu đặt qua Agoda/Booking.com thì thanh toán như thế nào?",
        questionEn: "How do I pay if I book through Agoda or Booking.com?",
        answerVi: "Đặt qua OTA thì làm theo phương thức và điều kiện thanh toán hiển thị trên chính nền tảng đó. Huyen’s không thể xác nhận thay điều khoản của OTA.",
        answerEn: "For OTA bookings, follow the payment methods and terms shown on that platform. Huyen’s cannot confirm an OTA’s terms on its behalf.",
      },
    ],
  },
  {
    titleVi: "Vị trí & đi lại",
    titleEn: "Location & transport",
    items: [
      {
        questionVi: "Khách sạn của Huyen’s nằm ở đâu?",
        questionEn: "Where are Huyen’s hotels located?",
        answerVi: "Huyen’s tập trung các lựa chọn lưu trú tại Quận 1 và TP. Hồ Chí Minh. Địa chỉ cụ thể được hiển thị trên trang của từng khách sạn.",
        answerEn: "Huyen’s focuses on stays in District 1 and Ho Chi Minh City. The exact address is listed on each hotel page.",
      },
      {
        questionVi: "Từ khách sạn đến Bùi Viện mất bao lâu?",
        questionEn: "How long does it take to get from a hotel to Bui Vien Street?",
        answerVi: "Để khám phá khu Bùi Viện, bạn có thể xem A&E Guesthouse tại 26/3 Đỗ Quang Đẩu hoặc Anh Kim Hotel tại 310 Cô Bắc. Kiểm tra tuyến đường từ đúng địa chỉ; thời gian phụ thuộc phương tiện và giao thông.",
        answerEn: "For the Bui Vien area, compare A&E Guesthouse at 26/3 Do Quang Dau and Anh Kim Hotel at 310 Co Bac. Check the route from the exact address; travel time depends on transport and traffic.",
      },
      {
        questionVi: "Từ khách sạn đến chợ Bến Thành mất bao lâu?",
        questionEn: "How long does it take to get from a hotel to Ben Thanh Market?",
        answerVi: "Thời gian phụ thuộc khách sạn, phương tiện và giao thông. Xem địa chỉ khách sạn và kiểm tra bản đồ theo giờ khởi hành.",
        answerEn: "Travel time depends on the hotel, transport, and traffic. Check the hotel address and a map for your departure time.",
      },
      {
        questionVi: "Từ khách sạn đến phố đi bộ Nguyễn Huệ mất bao lâu?",
        questionEn: "How long does it take to get from a hotel to Nguyen Hue Walking Street?",
        answerVi: "Thời gian phụ thuộc khách sạn, phương tiện và giao thông. Xem địa chỉ khách sạn và kiểm tra bản đồ theo giờ khởi hành.",
        answerEn: "Travel time depends on the hotel, transport, and traffic. Check the hotel address and a map for your departure time.",
      },
      {
        questionVi: "Từ sân bay Tân Sơn Nhất đến khách sạn mất bao lâu?",
        questionEn: "How long does it take to get from Tan Son Nhat Airport to a hotel?",
        answerVi: "Thời gian di chuyển thay đổi theo khách sạn, phương tiện và giao thông. Hãy kiểm tra bản đồ vào thời điểm đến dự kiến.",
        answerEn: "Travel time varies by hotel, transport, and traffic. Check a map for your expected arrival time.",
      },
      {
        questionVi: "Khách sạn có hỗ trợ đưa đón sân bay không?",
        questionEn: "Does the hotel provide airport transfers?",
        answerVi: "Chúng tôi có cung cấp dịch vụ đưa đón tại sân bay. Vui lòng hỏi khách sạn bạn chọn trước khi đặt xe.",
        answerEn: "We provide airport transfer services. Ask your chosen hotel before arranging transport.",
      },
      {
        questionVi: "Gần khách sạn có nhà hàng, quán cà phê và cửa hàng tiện lợi không?",
        questionEn: "Are there restaurants, cafés, and convenience stores near the hotel?",
        answerVi: "Các địa điểm lân cận khác nhau theo khách sạn. Xem địa chỉ và thông tin khu vực trên trang khách sạn, sau đó kiểm tra bản đồ để biết các địa điểm hiện có.",
        answerEn: "Nearby places vary by hotel. Check the address and area information on the hotel page, then use a map for current nearby businesses.",
      },
      {
        questionVi: "Có chỗ gửi xe gần khách sạn không?",
        questionEn: "Is parking available near the hotel?",
        answerVi: "Có và còn tùy vào từng khách sạn. Hãy hỏi khách sạn về chỗ gửi xe, khoảng cách và phí trước khi đến.",
        answerEn: "Yes, though it depends on the specific hotel. Ask the hotel about nearby parking, distance, and fees before arrival.",
      },
    ],
  },
  {
    titleVi: "Tiện nghi",
    titleEn: "Amenities",
    items: [
      {
        questionVi: "Khách sạn có Wi-Fi miễn phí không?",
        questionEn: "Does the hotel offer free Wi-Fi?",
        answerVi: "Tiện nghi Wi-Fi tùy khách sạn và loại phòng. Kiểm tra danh sách tiện nghi trên trang khách sạn/phòng bạn định đặt.",
        answerEn: "Wi-Fi availability depends on the hotel and room type. Check the amenities listed on the hotel or room page you plan to book.",
      },
      {
        questionVi: "Phòng có máy lạnh không?",
        questionEn: "Do the rooms have air conditioning?",
        answerVi: "Tiện nghi máy lạnh tùy loại phòng. Hãy xem danh sách tiện nghi của đúng phòng trên trang khách sạn.",
        answerEn: "Air conditioning depends on the room type. Check the amenities for the specific room on its hotel page.",
      },
      {
        questionVi: "Phòng có TV không?",
        questionEn: "Do the rooms have a TV?",
        answerVi: "TV có thể khác nhau theo loại phòng. Kiểm tra phần tiện nghi phòng trước khi đặt.",
        answerEn: "TV availability may vary by room type. Check the room amenities before booking.",
      },
      {
        questionVi: "Phòng có tủ lạnh không?",
        questionEn: "Do the rooms have a refrigerator?",
        answerVi: "Tủ lạnh có thể khác nhau theo loại phòng. Kiểm tra phần tiện nghi phòng hoặc hỏi khách sạn để xác nhận.",
        answerEn: "Refrigerators may vary by room type. Check the room amenities or ask the hotel to confirm.",
      },
      {
        questionVi: "Phòng có máy sấy tóc không?",
        questionEn: "Do the rooms have a hair dryer?",
        answerVi: "Có máy sấy tóc tại tất cả các phòng. Vui lòng xem tiện nghi của loại phòng hoặc hỏi khách sạn.",
        answerEn: "Hairdryers are available in all rooms. Check the room amenities or ask the hotel.",
      },
      {
        questionVi: "Khách sạn có thang máy không?",
        questionEn: "Does the hotel have an elevator?",
        answerVi: "Thang máy tùy khách sạn. Hãy kiểm tra tiện nghi trên trang khách sạn; nếu cần hỗ trợ tiếp cận, liên hệ trước để xác nhận.",
        answerEn: "Elevators vary by hotel. Check the hotel amenities; if you have accessibility needs, contact the hotel to confirm.",
      },
      {
        questionVi: "Khách sạn có dịch vụ dọn phòng hàng ngày không?",
        questionEn: "Does the hotel provide daily housekeeping?",
        answerVi: "Tần suất dọn phòng chưa được công bố chung và có thể tùy khách sạn/gói lưu trú. Vui lòng hỏi nơi lưu trú bạn chọn.",
        answerEn: "Housekeeping frequency is not published site-wide and may depend on the hotel or stay plan. Ask your chosen stay.",
      },
      {
        questionVi: "Có dịch vụ giặt ủi không?",
        questionEn: "Is laundry service available?",
        answerVi: "Chúng tôi cung cấp dịch vụ giặt ủi có tính phí. Một số khách sạn có khu vực tự giặt ủi miễn phí. Vui lòng liên hệ khách sạn để xác nhận dịch vụ, thời gian và mức phí.",
        answerEn: "We offer paid laundry services, and at some hotels, you can also do your own laundry for free. Contact the hotel to ask about service, timing, and fees.",
      },
    ],
  },
  {
    titleVi: "Lưu trú dài ngày",
    titleEn: "Long stays",
    items: [
      {
        questionVi: "Huyen’s có nhận khách thuê theo tháng không?",
        questionEn: "Does Huyen’s offer monthly stays?",
        answerVi: "Website hỗ trợ tìm phòng và gửi yêu cầu thuê theo tháng. Tùy chọn và tình trạng phòng phụ thuộc từng khách sạn; kiểm tra trên trang tìm phòng.",
        answerEn: "The website supports searching and submitting monthly stay requests. Options and availability depend on the hotel; check the room search page.",
      },
      {
        questionVi: "Giá thuê tháng được tính như thế nào?",
        questionEn: "How is the monthly rate calculated?",
        answerVi: "Giá tháng hiển thị theo loại phòng và số tháng thuê nếu khách sạn có cung cấp. Kiểm tra tổng tiền và điều kiện trước khi gửi yêu cầu.",
        answerEn: "Monthly rates are shown by room type and length of stay when provided by the hotel. Review the total and terms before submitting a request.",
      },
      {
        questionVi: "Thuê dài ngày có được ưu đãi không?",
        questionEn: "Are discounts available for long stays?",
        answerVi: "Có, chúng tôi thường đề xuất mức giảm giá từ 5% đến 10% cho khách lưu trú dài ngày. Vui lòng xác nhận ưu đãi áp dụng với khách sạn trước khi đặt.",
        answerEn: "Yes, we often offer a discount of 5%–10% for long stays. Please confirm the applicable offer with the hotel before booking.",
      },
      {
        questionVi: "Giá thuê tháng đã bao gồm điện, nước và Wi-Fi chưa?",
        questionEn: "Does the monthly rate include electricity, water, and Wi-Fi?",
        answerVi: "Giá đã bao gồm mọi dịch vụ có sẵn tại khách sạn. Hãy xác nhận các khoản này với khách sạn trước khi thuê.",
        answerEn: "The price includes all services available at the hotel. Confirm these items with the hotel before renting.",
      },
      {
        questionVi: "Thuê phòng theo tháng cần đặt cọc không?",
        questionEn: "Is a deposit required for a monthly stay?",
        answerVi: "Thuê phòng theo tháng không yêu cầu tiền cọc riêng, nhưng bạn cần thanh toán trước tiền thuê. Tiền thuê trả trước khác với tiền cọc giữ phòng. Vui lòng xác nhận số tiền, thời hạn thanh toán và điều kiện hủy hoặc hoàn tiền thuê với khách sạn trước khi thanh toán.",
        answerEn: "Monthly stays do not require a separate rental deposit, but the rent must be paid in advance. Advance rent is different from a room-hold deposit. Confirm the amount, payment deadline, and cancellation or rent refund terms with the hotel before paying.",
      },
      {
        questionVi: "Tôi có thể gia hạn thời gian lưu trú không?",
        questionEn: "Can I extend my stay?",
        answerVi: "Bạn cần liên hệ khách sạn để kiểm tra phòng trống và giá cho thời gian gia hạn trước ngày trả phòng.",
        answerEn: "Contact the hotel to check availability and rates for an extension before your scheduled check-out.",
      },
      {
        questionVi: "Có thể thuê phòng dài hạn cho người đi công tác không?",
        questionEn: "Can business travelers book a long-term stay?",
        answerVi: "Website có luồng yêu cầu thuê theo tháng. Hãy chọn khách sạn/phòng phù hợp và liên hệ nơi lưu trú để xác nhận điều kiện cho chuyến công tác.",
        answerEn: "The website supports monthly stay requests. Choose a suitable hotel and room, then contact the property to confirm terms for your business trip.",
      },
    ],
  },
];