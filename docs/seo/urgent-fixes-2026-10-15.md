# Kiểm tra SEO ngày 15/10/2026

- Google Search Console: gửi lại https://huyenhotels.com/sitemap.xml thành công ngày 15/10/2026; Google ghi nhận 43 trang được khám phá. Đây không phải số trang đã lập chỉ mục. Bằng chứng: artifacts/search-console-sitemap-2026-10-15.png.
- Sitemap local: 43 URL duy nhất; robot mở /, chặn admin/API/test và .git/.env/tmp/temp/debug/preview; không chặn ảnh /media/optimized hay tài nguyên Next.js.
- Hotel và HotelRoom trên trang Anh Kim/family-room: JSON-LD parse thành công; phòng liên kết khách sạn bằng @id; khách sạn liên kết Place Quận 1 cũ, Sài Gòn, City TP.HCM, Country Việt Nam. Giữ nguyên địa chỉ hiện tại của cơ sở.
- Bộ tối ưu ảnh dùng sharp: chỉ nhận nguồn public đã cho phép, kiểm tra width, chặn redirect, giới hạn đầu vào 20MB và 40 triệu pixel. Trả WebP dưới 199.000 byte, giảm chất lượng/kích thước khi cần. Cache đầu ra qua browser/CDN, không cache ảnh gốc vào Next Data Cache (ảnh gốc có thể trên 2MB).
- Ảnh nhiều chi tiết sinh ngẫu nhiên: width 384/750/1920 đều WebP dưới 200.000 byte. Ảnh Anh Kim thực tế tại width 750: 37.228 byte.
- Ảnh raster Next/Image dùng loader chung; SVG giữ nguyên vector. Logo có width/height; ảnh fill có khung aspect ratio giữ chỗ. Ảnh trong trợ lý AI đã dùng Next/Image với width/height 480/320. Alt ảnh cơ sở trang chủ bổ sung ngữ cảnh Sài Gòn.
- Upload hero và ảnh khách sạn/phòng, blog, trải nghiệm: nén WebP dưới 199.000 byte trước khi gửi. Các giới hạn loại file/kích thước đầu vào hiện có của admin vẫn áp dụng.
- Mobile: trang chủ kiểm tra 320px và 390px; trang family-room kiểm tra 320px; không tràn ngang, các nút hiện ra không dưới 44px. CSS hiện có đặt tối thiểu 48px, bổ sung focus outline, giới hạn form và wrap nội dung. Gallery phòng 4:3 trên mobile, 16:6 từ sm.
- Kiểm tra: production build thành công với NEXT_DIST_DIR=.next-seo-build; TypeScript và ESLint các helper mới đạt. Thư mục build mặc định cũ bị EPERM ở cache/standalone; dùng thư mục mới để kiểm tra.

Các sửa mã nguồn chưa được triển khai lên production trong lượt này. Sitemap được gửi là URL production đang hoạt động. Ảnh gốc trong Storage được giữ nguyên; ảnh phục vụ qua bộ tối ưu mới chỉ áp dụng sau triển khai.

Tài liệu upload: https://supabase.com/docs/reference/javascript/storage-from-upload . Hướng dẫn Next.js đọc trực tiếp từ node_modules/next/dist/docs.
