# Blog, phòng, trang chủ và SEO quốc tế — 16/10/2026

## Nội dung

- Bài nhung-dieu-nen-biet-khi-du-lich-ho-chi-minh-city được bổ sung bốn mục VI/EN: đi từ Tân Sơn Nhất về trung tâm; cách dự trù và kiểm tra cước; chọn khu Bùi Viện/Bến Thành/Nguyễn Thị Minh Khai; lưu ý cho khách quốc tế. Nội dung bổ sung nằm trong article, với link khách sạn theo ngữ cảnh, không chỉ ở CTA.
- Nội dung bổ sung được quản lý trong app/data/city-guide.ts; nội dung gốc trong Supabase vẫn được hiển thị và không bị ghi đè.
- 14 mô tả phòng hiện có trong dữ liệu đã chi tiết; bổ sung tư vấn so sánh với hạng phòng thay thế và nội dung xung quanh riêng cho từng cơ sở. Không suy đoán cửa sổ, loại giường hoặc tiện nghi chưa có thông tin.
- H1 trang chủ: Khách sạn, Homestay tại trung tâm TP.HCM – Huyen’s Hotels & Stays. Địa danh Quận 1 cũ vẫn giữ trong nội dung phù hợp.

## URL tiếng Anh

- 35 URL EN có nội dung dựng sẵn: trang chủ, phòng/giá, blog, 4 cơ sở, 14 phòng và 14 bài có bản dịch đầy đủ. HTML document lang=en, title/description EN, canonical riêng và hreflang vi-VN/en/x-default hai chiều.
- Dùng các route Pages Router cụ thể dưới pages/en cùng App Router hiện có, giữ nguyên URL Việt và tính năng cache. Không dùng catch-all EN vì có thể tranh tuyến với booking.
- /en/tim-phong và /en/dat-phong dùng lại luồng booking hiện có, khóa giao diện theo URL EN, metadata EN và noindex. Các URL booking không nằm trong sitemap. Root App layout giữ lang=vi; nội dung booking EN nằm trong phần tử lang=en, còn các trang EN được index dùng document lang=en riêng.
- Nút VI/EN chuyển sang URL tương ứng cho các trang đã hỗ trợ; query string đặt phòng được giữ nguyên. Những trang chính sách/trải nghiệm/liên hệ chưa có URL EN riêng không được khai báo hreflang EN.
- Sitemap hiện có 78 URL, gồm 43 VI và 35 EN; có alternates tương ứng cho các cặp dịch.

## Kiểm tra

- scripts/audit-locales.mjs: 35 cặp hreflang/canonical đạt; link tới bốn khách sạn trong cả hai bản bài hướng dẫn đạt.
- scripts/audit-public-seo.mjs: 80/80 URL đạt (78 sitemap + 2 booking VI); bộ audit hỗ trợ thuộc tính hợp lệ data-next-head trên title Pages Router.
- 14 regression tests đạt; lint ngoài admin không có lỗi/cảnh báo ở lần kiểm tra gần nhất. Không chỉnh 18 warning admin đã được yêu cầu bỏ qua.
- Mobile 320px: trang chủ và bài hướng dẫn EN không tràn ngang; đường dẫn phòng EN → tìm phòng EN tải form EN. Không gửi booking thật hoặc sửa dữ liệu production để kiểm tra.

## Nguồn và giá tham khảo

- Vinasun, biểu phí hiệu lực 14/07/2026: https://vinasun.vn/tin-chi-tiet/vinasun-taxi-dieu-chinh-gia-cuoc-tu-ngay-14072026 . Ví dụ 8 km là phép tính làm tròn để dự trù phần quãng đường, không phải báo giá trọn chuyến sân bay.
- Vietnam Tourism: https://vietnam.travel/things-to-do/currency-and-payments-vietnam .
- Không dùng bảng giá buýt cũ hoặc nguồn không phải sân bay chính thức để đưa ra giá/lịch tuyến cố định. Bài hướng dẫn khách kiểm tra thông tin tại thời điểm đi.

Các thay đổi trong báo cáo này chưa push/deploy. Không ghi đè nội dung blog hoặc dữ liệu phòng trong Supabase.

Kết quả cuối: production build thành công (110 trang được tạo); 35 cặp ngôn ngữ và 80 URL audit đạt. Luồng browser EN đã kiểm tra tới form thông tin khách với ngày 10–12/11/2026 và một phòng Standard Double; không nhấn Confirm booking. Nhãn tải EN đã kiểm tra trên bản build cuối; nhãn trợ giúp EN được sửa riêng và ESLint đạt sau đó.
