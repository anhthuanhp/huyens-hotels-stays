# Kiểm tra cảnh báo Siteliner 15/10/2026

- Quét lại 59 URL từ sitemap và liên kết nội bộ, không truy cập admin/API.
- Tìm thấy URL 404 https://huyenhotels.com/cdn-cgi/l/email-protection tại /, /lien-he, /kham-pha-huyens và /trai-nghiem. Đây là một URL lỗi ở bốn trang, phù hợp số lỗi trong ảnh; cần báo cáo chi tiết Siteliner để khẳng định từng dòng của công cụ.
- HTML trên các trang có email cho thấy Cloudflare rewrite mailto/text thành /cdn-cgi/l/email-protection và thêm email-decode.min.js.
- Sửa các email công khai bằng component EmailLink: comment email_off bao toàn bộ anchor, escape mọi giá trị HTML.
- Nội dung trùng hoàn toàn trong lần quét là nhóm /tim-phong và 14 biến thể chọn phòng bằng query. Các trang này đã có noindex,follow và canonical /tim-phong. Không đổi canonical phòng về trang chủ và không chặn robots khiến bot không thấy noindex.
- Chưa thể tái tạo tỷ lệ near-duplicate của Siteliner từ ảnh vì không có danh sách cặp trang và khối nội dung. Header/footer/chính sách dùng chung không tự đồng nghĩa vi phạm spam.
- http://huyenhotels.com/ trả 308 sang HTTPS: giữ nguyên vì đúng.
- https://www.huyenhotels.com/ trả 307 sang non-www: bổ sung redirect permanent 308 trong next.config.ts. Nếu Vercel domain redirect xử lý trước ứng dụng thì phải đổi 307 sang 308 ở Domains; không tuyên bố cấu hình code đã thay được lớp hosting.

Tham khảo:
- https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/
- https://developers.google.com/search/docs/crawling-indexing/301-redirects
- https://developers.google.com/search/docs/crawling-indexing/canonicalization

Xác minh: TypeScript qua; render component xác nhận mailto và comment email_off, nội dung escape; cấu hình www permanent, giữ path.
