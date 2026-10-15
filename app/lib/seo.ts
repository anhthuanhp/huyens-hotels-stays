import type { Metadata } from "next";

export const SITE_NAME = "Huyen's Hotels & Stays";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://huyenhotels.com").replace(/\/+$/, "");

export function cleanSeoText(value: string | null | undefined): string {
  return (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    .replace(/Doulbe/g, "Double").replace(/Windown/g, "Window").replace(/tiết kiếm/g, "tiết kiệm");
}

export function seoDescription(value: string, limit = 158): string {
  const text = cleanSeoText(value);
  if (text.length <= limit) return text;
  const shortened = text.slice(0, limit - 1);
  const space = shortened.lastIndexOf(" ");
  return shortened.slice(0, space > limit * 0.6 ? space : shortened.length).trimEnd() + "…";
}

export const STATIC_SEO: Record<string, { title: string; description: string }> = {
  "/khach-san-quan-1-cu": { title: "Khách sạn Quận 1 cũ Sài Gòn", description: "Tìm hiểu cách chọn khách sạn Quận 1 cũ, trung tâm Sài Gòn cùng Huyen's. So sánh vị trí, loại phòng và chính sách trước khi gửi yêu cầu đặt phòng." },
  "/": { title: "Khách sạn & homestay Quận 1 cũ, Sài Gòn", description: "Khám phá khách sạn và homestay Huyen’s tại Quận 1 cũ, trung tâm Sài Gòn. Xem cơ sở ở Cô Bắc, Đỗ Quang Đẩu, Nguyễn Thị Minh Khai và đặt phòng trực tiếp." },
  "/phong": { title: "Phòng và giá lưu trú tại TP.HCM", description: "So sánh các loại phòng tại Huyen's Hotels & Stays ở TP.HCM. Xem giá thuê ngày, giá tháng, diện tích, sức chứa và tiện nghi để chọn phòng phù hợp." },
  "/kham-pha-huyens": { title: "Về Huyen's Hotels & Stays", description: "Tìm hiểu Huyen's Hotels & Stays và các cơ sở lưu trú tại TP.HCM. Khám phá phong cách từng khách sạn, guesthouse, homestay và cách liên hệ đặt phòng." },
  "/trai-nghiem": { title: "Trải nghiệm và khám phá TP.HCM", description: "Khám phá hoạt động, ẩm thực và những góc phố tại TP.HCM cùng Huyen's Hotels & Stays. Tham khảo ý tưởng trải nghiệm để lên kế hoạch cho kỳ lưu trú." },
  "/blog": { title: "Blog và kinh nghiệm du lịch TP.HCM", description: "Đọc kinh nghiệm chọn khách sạn, khám phá ẩm thực và lịch trình du lịch TP.HCM trên blog Huyen's Hotels & Stays để chuẩn bị cho chuyến đi của bạn." },
  "/lien-he": { title: "Liên hệ và hỗ trợ đặt phòng", description: "Liên hệ Huyen's Hotels & Stays để hỏi phòng, giá và điều kiện lưu trú tại TP.HCM. Xem số điện thoại, email và gửi yêu cầu hỗ trợ qua website." },
  "/chinh-sach-dat-phong": { title: "Chính sách đặt phòng", description: "Đọc quy định đặt phòng tại Huyen's Hotels & Stays: thông tin khách, giá phòng, nhận và trả phòng, thay đổi yêu cầu và trách nhiệm khi lưu trú." },
  "/chinh-sach-huy-phong": { title: "Chính sách hoàn và hủy phòng", description: "Tìm hiểu điều kiện hoàn tiền, hủy phòng, đổi ngày lưu trú và trường hợp không đến tại Huyen's Hotels & Stays trước khi xác nhận đặt phòng." },
  "/chinh-sach-bao-mat": { title: "Chính sách bảo mật thông tin", description: "Xem cách Huyen's Hotels & Stays thu thập, sử dụng và bảo vệ thông tin khi bạn tìm phòng, gửi yêu cầu đặt phòng hoặc liên hệ qua website." },
  "/chinh-sach-khac": { title: "Chính sách giá, cọc và thanh toán", description: "Xem chính sách giá, đặt cọc, thanh toán, khiếu nại và chấm dứt thuê phòng tại Huyen's Hotels & Stays. Xác nhận điều kiện áp dụng trước khi thanh toán." },
  "/tim-phong": { title: "Tìm phòng theo ngày hoặc tháng", description: "Chọn khách sạn, ngày lưu trú, số khách và hình thức thuê ngày hoặc tháng tại Huyen's Hotels & Stays. Kiểm tra lựa chọn phù hợp trước khi đặt phòng." },
  "/dat-phong": { title: "Xác nhận yêu cầu đặt phòng", description: "Kiểm tra khách sạn, loại phòng, ngày lưu trú và tổng tiền tại Huyen's Hotels & Stays. Nhập thông tin liên hệ và gửi yêu cầu đặt phòng trực tiếp." },
};

export function staticMetadata(path: string): Metadata {
  const copy = STATIC_SEO[path];
  if (!copy) throw new Error(`Missing SEO copy: ${path}`);
  const title = path === "/" ? copy.title + " | Huyen’s" : path === "/kham-pha-huyens" ? copy.title : `${copy.title} | ${SITE_NAME}`;
  const description = seoDescription(copy.description);
  const url = path === "/" ? SITE_URL : SITE_URL + path;
  const index = path !== "/tim-phong" && path !== "/dat-phong";
  return {
    title: { absolute: title }, description,
    alternates: { canonical: url },
    robots: { index, follow: true, googleBot: { index, follow: true, "max-image-preview": "large" } },
    openGraph: { type: "website", locale: "vi_VN", siteName: SITE_NAME, title, description, url },
    twitter: { card: "summary", title, description },
  };
}

type HotelSeoData = { slug?: string; name_vi: string | null; name_en: string | null; address_vi: string | null; address_en: string | null };
export function hotelSeo(hotel: HotelSeoData) {
  const name = cleanSeoText(hotel.name_vi || hotel.name_en) || "Cơ sở lưu trú";
  const address = cleanSeoText(hotel.address_vi || hotel.address_en);
  const positioning: Record<string, { title: string; description: string }> = {
    "anh-kim-hotel": { title: "Anh Kim Hotel – Khách sạn Cô Bắc, gần Bùi Viện", description: "Anh Kim Hotel tại khu vực Cô Bắc, thuận tiện khám phá Bùi Viện và Bến Thành. Xem loại phòng, tiện nghi, giá lưu trú và gửi yêu cầu đặt phòng." },
    "ae-guesthouse": { title: "A&E Guesthouse – Gần Bùi Viện và Phạm Ngũ Lão", description: "A&E Guesthouse cho hành trình khám phá khu Bùi Viện, Phạm Ngũ Lão tại Sài Gòn. Xem các loại phòng thực tế, tiện nghi và liên hệ đặt phòng trực tiếp." },
    "huyen-house": { title: "Huyen House – Lưu trú gần Tổng Lãnh sự quán Mỹ", description: "Huyen House tại khu vực Nguyễn Thị Minh Khai, thuận tiện đến Tổng Lãnh sự quán Mỹ tại TP.HCM. Xem phòng, địa chỉ và gửi yêu cầu đặt phòng." },
    "huyenhomestay": { title: "Huyen Homestay – Lưu trú dài ngày tại TP.HCM", description: "Tìm phòng thuê tháng tại Huyen Homestay, khu vực Nguyễn Thị Minh Khai, TP.HCM. Xem loại phòng, giá tháng và hỏi điều kiện cọc, điện nước trước khi đặt." },
  };
  const copy = hotel.slug ? positioning[hotel.slug] : undefined;
  if (copy) return { title: copy.title + " | Huyen's", description: seoDescription(copy.description) };
  return { title: `${name} tại TP.HCM | Huyen's Hotels & Stays`, description: seoDescription(`${name}${address ? " tại " + address : ""}. Xem loại phòng, tiện nghi, giá thuê và gửi yêu cầu đặt phòng trực tiếp với Huyen's.`) };
}

export const BLOG_SEO: Record<string, { title: string; description: string }> = {
  "kinh-nghiem-chon-khach-san-o-quan-1": { title: "Cách chọn khách sạn Quận 1 TP.HCM", description: "Kinh nghiệm chọn khách sạn ở khu vực Quận 1 TP.HCM cho người lần đầu đến Sài Gòn: cân nhắc vị trí, loại phòng và điều kiện đặt phòng trước chuyến đi." },
  "khach-san-gan-cho-ben-thanh": { title: "Cách chọn khách sạn gần chợ Bến Thành", description: "Tìm hiểu cách chọn khách sạn gần chợ Bến Thành khi du lịch TP.HCM. Cân nhắc vị trí, nhu cầu lưu trú và thông tin phòng để chọn nơi nghỉ phù hợp." },
  "kinh-nghiem-khi-luu-tru-tai-sai-gon": { title: "Kinh nghiệm lưu trú tại Sài Gòn", description: "Tham khảo kinh nghiệm lưu trú tại Sài Gòn để chuẩn bị chuyến đi TP.HCM. Tìm hiểu việc chọn nơi nghỉ và những thông tin cần kiểm tra trước khi đặt phòng." },
  "nhung-dieu-nen-biet-khi-du-lich-ho-chi-minh-city": { title: "Điều cần biết khi du lịch TP.HCM", description: "Những điều cần biết khi du lịch TP.HCM: giao thông, khu vực lưu trú, ẩm thực và trải nghiệm địa phương để chuẩn bị cho hành trình khám phá thành phố." },
  "an-gi-o-trung-tam-tp-ho-chi-minh": { title: "Ăn gì ở trung tâm TP.HCM?", description: "Khám phá gợi ý món ăn nên thử ở trung tâm TP.HCM cùng Huyen's Hotels & Stays. Tham khảo ý tưởng ẩm thực để kết hợp với lịch trình khám phá thành phố." },
  "mot-ngay-song-cham-o-ho-chi-minh-city": { title: "Một ngày sống chậm ở TP.HCM", description: "Gợi ý một ngày sống chậm tại TP.HCM với cà phê, những con phố, ẩm thực và nhịp sống địa phương. Tham khảo lịch trình nhẹ nhàng cho chuyến lưu trú." },
};
