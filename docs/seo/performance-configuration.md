# SEO và hiệu năng — 14/10/2026

## Metadata và heading

Title dùng chủ đề/tên cơ sở hoặc tên phòng + khách sạn + thương hiệu. Description nêu nội dung riêng, dữ liệu phòng/địa chỉ từ admin và lời mời hành động phù hợp; giới hạn 158 ký tự theo từ. Các bài blog hiện có có nội dung SEO riêng, bài mới dùng tiêu đề và excerpt/nội dung thật.

Nguồn nội dung: app/lib/seo.ts. Danh sách từng URL: title-description-inventory.md. Chạy kiểm tra: node scripts/audit-public-seo.mjs http://localhost:3100.

Audit bao gồm các URL sitemap và /tim-phong, /dat-phong: title/description duy nhất, một canonical, một H1 và không bỏ cấp heading. Hai trang nghiệp vụ vẫn dùng noindex, follow.

## Ảnh và JavaScript

- Logo mới: public/images/huyen-hotel-logo-v1.webp, 25.446 byte thay cho PNG 366.448 byte, giữ lại nguồn PNG.
- Next/Image: AVIF trước, WebP dự phòng; quality allowlist 60/75; cache ảnh tối thiểu 86.400 giây.
- Hero dùng quality 75; chỉ slide đầu preload. Bài nổi bật dưới màn hình đầu không còn priority; kích thước thumbnail blog phù hợp màn hình nhỏ.
- Bỏ font Geist/Geist Mono được preload nhưng không dùng trong CSS.
- AI assistant chỉ tải khi người dùng mở; sự kiện đầu được giữ bằng initiallyOpen. Thư viện thống kê tải sau 1,5 giây.
- Layout trang phòng/khách sạn không còn chạy truy vấn metadata và phát schema lặp; page giữ metadata và schema chính.

## Cache Next.js

- Trang chủ, danh sách phòng, khám phá, trải nghiệm, blog, từng bài blog, khách sạn và phòng: ISR 60 giây.
- Sitemap: 3.600 giây.
- /_next/static/: Next.js quản lý file có hash với max-age=31536000, immutable.
- /images/ và /icons/: browser max-age=86400, stale-while-revalidate=604800. Đổi tên/version asset khi thay ảnh để có URL mới.
- Không đặt header Cache-Control chung cho HTML; Next.js/Vercel quản lý ISR, phân biệt HTML/RSC và phản hồi cá nhân hóa.

## Cloudflare — đã áp dụng trực tiếp

Quy tắc Active: Next.js public static assets.

Expression:

```text
(http.host in {"huyenhotels.com" "www.huyenhotels.com"} and http.request.method in {"GET" "HEAD"} and (starts_with(http.request.uri.path, "/_next/static/") or starts_with(http.request.uri.path, "/images/") or starts_with(http.request.uri.path, "/icons/")))
```

Cache eligibility: Eligible. Edge TTL: dùng Cache-Control từ origin; không có header thì bypass. Browser TTL: Respect origin TTL. Giữ query string.

Không mở Cache Everything cho HTML/API/admin/đặt phòng. Không đưa /_next/image vào rule ép cache vì ảnh AVIF/WebP cần được phân biệt theo Accept; image optimizer/Vercel xử lý cache theo định dạng.

Brotli đã hoạt động trước khi chỉnh: HTML và CSS live trả Content-Encoding: br. Sau áp dụng rule, CSS live trả CF-Cache-Status: HIT và immutable một năm. Next.js bật compress=true để duy trì gzip khi phục vụ trực tiếp ở origin.

Ảnh xác nhận Cloudflare nằm trong artifact cloudflare-cache-active.jpg của chat.

## Kiểm chứng và triển khai

Bản sửa repository cần deploy lên Vercel/hosting hiện tại. Cloudflare rule đã Active độc lập với deploy code. Sau deploy chạy lại audit với domain live và kiểm tra sitemap, metadata, ảnh AVIF/WebP, header cache và mở/đóng AI chat.

Kết quả kiểm tra local là kiểm tra chức năng và cấu hình. LCP/INP/CLS thực tế cần đo lại trên site đã deploy bằng Lighthouse/PageSpeed và dữ liệu người dùng Search Console; không coi build thành công là điểm Core Web Vitals.

Tài liệu: https://developers.cloudflare.com/speed/optimization/content/compression/ ; https://developers.cloudflare.com/cache/how-to/cache-rules/ ; hướng dẫn Next.js cài trong node_modules/next/dist/docs.

Kiểm chứng cuối: production build thành công; audit 36/36 URL đạt yêu cầu; AVIF logo 5.008 byte, WebP 8.690 byte; header ISR khách sạn/blog s-maxage=60. AI chat mở được ở lần bấm đầu, đóng được bình thường. Hai lỗi FAQ của Anh Kim trong dữ liệu Supabase cũng đã được sửa; truy vấn kiểm tra trả remaining_typos=0.
