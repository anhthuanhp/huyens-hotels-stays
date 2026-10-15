# Đối chiếu báo cáo SEO ngày 15/10/2026

## Đã kiểm tra trên website trước bản sửa này
- Trang chủ, danh sách Blog, bốn cơ sở, phòng A&E standard-room, robots.txt và sitemap.xml trả về HTTP 200.
- Sitemap có 43 URL tại thời điểm kiểm tra; robots cho phép nội dung công khai và chặn admin/API.
- Các trang HTML được kiểm tra có canonical riêng và một H1; JSON-LD parse được.
- Trang cơ sở có Hotel và BreadcrumbList; FAQPage xuất hiện khi có FAQ thực tế. Phòng có HotelRoom.
- Tên Studio without Window đúng trong H1 và title.

## Bổ sung trong bản sửa
- Title, description và H1 trang chủ tập trung thương hiệu, khách sạn/homestay Quận 1 cũ, Sài Gòn.
- Trang chủ truy vấn ba bài public mới nhất, sắp theo ngày rồi ID và liên kết tới danh sách Blog.
- Blog hiển thị các tiêu đề đoạn ngắn thành H2 và hỗ trợ cú pháp ##/###; URL HTTP/HTTPS thành liên kết, vẫn escape văn bản qua React.
- Giữ xuống dòng và hỗ trợ nội dung cũ lưu ký tự newline dưới dạng chuỗi.
- FAQ vị trí Bùi Viện gợi ý A&E/Anh Kim và có liên kết đến hai cơ sở; nội dung JSON-LD dùng cùng nguồn câu trả lời.
- Huyen Homestay nhắm lưu trú dài ngày; nhu cầu tháng phải xác nhận, vì business_model hiện là daily.

## Đã hoàn thành ở các lượt trước
- Tách title/H1 từng khách sạn; FAQ loại phòng theo inventory active; sửa chính tả tên phòng.
- Các bài Việt–Anh cho từng cơ sở, ẩm thực, công tác/tập huấn, đi học/lãnh sự và giải chạy đã được lưu Supabase.
- Danh sách Blog bỏ giới hạn ba bài mỗi chuyên mục, sắp bài mới trước.

## Chưa thể kết luận từ báo cáo này
- Chưa có số liệu Core Web Vitals hoặc đo PageSpeed: không tuyên bố đã đạt LCP < 2.5s.
- Chưa có quyền/dữ liệu Google Search Console nên chưa xác nhận từ khóa, CTR, index hoặc nộp sitemap.
- Chưa gắn hreflang vì hai ngôn ngữ dùng cùng URL qua lựa chọn phía client; cần URL ngôn ngữ riêng trước khi triển khai hreflang đúng.
- Không bịa khoảng cách đi bộ, hạng sao, đánh giá, ưu đãi hoặc điều kiện thuê tháng.

## Xác minh
- TypeScript --noEmit --incremental false: qua.
- Kiểm tra parser: heading, paragraph, newline cũ, URL/dấu câu, chuỗi javascript và URL lỗi: qua.
- ESLint các file mới/sửa liên quan nội dung: qua; hai component cũ có lỗi set-state-in-effect đã tồn tại trước thay đổi, kiểm tra các rule còn lại riêng.
