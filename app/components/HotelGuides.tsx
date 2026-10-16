import Link from "@/app/components/LocalizedLink";

const guides: Record<string, { slug: string; vi: string; en: string }[]> = {
  "anh-kim-hotel": [
    { slug: "khach-san-gan-cho-ben-thanh", vi: "Cách chọn khách sạn gần chợ Bến Thành", en: "Choosing a hotel near Ben Thanh Market" },
    { slug: "khach-san-cong-tac-tap-huan-mb-di-hoc-kham-rang-anh-kim", vi: "Đi công tác, tập huấn, đi học và khám: chọn nơi lưu trú", en: "Choosing accommodation for work, training, study and appointments" },
    { slug: "anh-kim-hotel-co-bac-chon-phong-cap-doi-gia-dinh", vi: "Anh Kim: chọn phòng đôi hay phòng gia đình?", en: "Anh Kim: double or family room?" },
  ],
  "ae-guesthouse": [
    { slug: "ae-guesthouse-do-quang-dau-huong-dan-chon-phong", vi: "Chọn phòng gần Bùi Viện theo nhu cầu và ngân sách", en: "Choose a guesthouse room near Bui Vien for your budget" },
    { slug: "an-gi-gan-bui-vien-lich-trinh-am-thuc-buoi-toi", vi: "Ăn gì gần Bùi Viện? Gợi ý một buổi tối", en: "What to eat near Bui Vien: an evening guide" },
  ],
  "huyen-house": [
    { slug: "huyen-house-di-hoc-hen-lanh-su-nguyen-thi-minh-khai", vi: "Lưu trú gần Lãnh sự quán Mỹ khi đi học hoặc có lịch hẹn", en: "A quiet base for study and US Consulate appointments" },
    { slug: "huyen-house-nguyen-thi-minh-khai-phong-mot-hai-nguoi", vi: "Huyen House: chọn phòng cho 1–2 người", en: "Huyen House rooms for solo travellers and couples" },
  ],
  huyenhomestay: [
    { slug: "huyen-homestay-sinh-vien-quoc-te-su-kien-chay-bo", vi: "Chỗ ở đi học và dự giải chạy Sài Gòn", en: "A Saigon base for study and running events" },
    { slug: "huyen-homestay-luu-tru-dai-ngay-nguyen-thi-minh-khai", vi: "Chọn homestay dài ngày tại Nguyễn Thị Minh Khai", en: "Long stay accommodation on Nguyen Thi Minh Khai" },
  ],
};

export default function HotelGuides({ slug, language }: { slug: string; language: "vi" | "en" }) {
  const items = guides[slug];
  if (!items) return null;
  return (
    <section className="mt-8 rounded-2xl border border-sky-100 bg-sky-50 p-5">
      <h2 className="text-lg font-semibold text-sky-900">{language === "vi" ? "Kinh nghiệm lưu trú tại khu vực" : "Plan your stay in the area"}</h2>
      <ul className="mt-3 space-y-2">
        {items.map(item => <li key={item.slug}><Link href={"/blog/" + item.slug} className="inline-block py-2 text-sm font-medium text-sky-800 underline underline-offset-4">{language === "vi" ? item.vi : item.en}</Link></li>)}
      </ul>
    </section>
  );
}
