import Link from "next/link";
import { staticMetadata } from "../lib/seo";

export const metadata = staticMetadata("/khach-san-quan-1-cu");

export default function DistrictOnePage() {
  return (
    <div className="bg-white px-5 py-16 text-neutral-800">
      <article className="mx-auto max-w-3xl space-y-8 leading-8">
        <nav aria-label="Đường dẫn"><Link href="/" className="text-sky-800 underline">Trang chủ</Link> / Khách sạn Quận 1 cũ</nav>
        <h1 className="text-3xl font-bold leading-tight text-sky-900">Chọn khách sạn Quận 1 cũ, trung tâm Sài Gòn</h1>
        <p>Bạn đang tìm khách sạn Quận 1 cũ Sài Gòn cho chuyến du lịch hoặc công tác? Huyen&apos;s Hotels &amp; Stays giúp bạn xem các lựa chọn lưu trú, so sánh loại phòng và gửi yêu cầu đặt phòng trực tiếp. Bắt đầu từ lịch trình và địa chỉ cụ thể để chọn nơi ở phù hợp với nhu cầu của mình.</p>
        <h2 className="text-2xl font-semibold text-sky-900">Chọn vị trí theo lịch trình</h2>
        <p>Khi phần lớn lịch trình nằm ở trung tâm Sài Gòn, chọn nơi nghỉ trong cùng khu vực giúp bạn dễ sắp xếp thời gian tham quan, ăn uống và gặp gỡ. Nếu muốn ghé chợ Bến Thành hoặc phố đi bộ Nguyễn Huệ, hãy đối chiếu địa chỉ khách sạn với từng điểm đến trên bản đồ trước khi quyết định.</p>
        <p>Trong hướng dẫn này, “Quận 1 cũ” được dùng như cách gọi khu vực quen thuộc để tìm nơi lưu trú. Khi đặt xe, nhận phòng hoặc cần xuất hóa đơn, hãy sử dụng địa chỉ hiện tại được cơ sở xác nhận. Không nên suy ra khoảng cách đi bộ chỉ từ cụm từ “khách sạn trung tâm”.</p>
        <p>Hãy ghi lại các điểm cần đến mỗi ngày, kiểm tra tuyến đường và phương tiện dự kiến. Với chuyến công tác, ưu tiên đường đi đến nơi họp; với chuyến du lịch, cân nhắc giờ quay về, hành lý và nhu cầu nghỉ ngơi. Xem <Link href="/#stays-heading" className="text-sky-800 underline">các cơ sở và địa chỉ</Link> trước khi chọn nơi ở.</p>
        <h2 className="text-2xl font-semibold text-sky-900">So sánh loại phòng và chi phí</h2>
        <p>Chọn phòng theo số khách, loại giường và thời gian lưu trú. Xem ảnh, diện tích và tiện nghi trên trang chi tiết phòng; nếu cần cửa sổ, bàn làm việc hoặc chỗ để xe, hãy hỏi cơ sở trước khi gửi yêu cầu. Khách ở dài ngày nên kiểm tra thêm cách tính điện, nước, vệ sinh và tiền cọc.</p>
        <p>Tại trang <Link href="/phong" className="text-sky-800 underline">loại phòng và giá lưu trú</Link>, bạn có thể đối chiếu các lựa chọn trước khi chọn ngày. Giá và tình trạng phòng cần được xác nhận theo thời điểm lưu trú, số khách và điều kiện áp dụng cho từng cơ sở.</p>
        <h2 className="text-2xl font-semibold text-sky-900">Kiểm tra điều kiện trước khi đặt phòng</h2>
        <p>Trước khi thanh toán, kiểm tra ngày nhận và trả phòng, tổng chi phí, khoản đặt cọc và cách xác nhận đặt phòng. Đọc <Link href="/chinh-sach-dat-phong" className="text-sky-800 underline">chính sách đặt phòng</Link> cùng <Link href="/chinh-sach-huy-phong" className="text-sky-800 underline">điều kiện hoàn, hủy phòng</Link>. Nếu lịch trình có thể thay đổi, hãy hỏi rõ điều kiện đổi ngày và thời hạn thông báo.</p>
        <p>Cần hỗ trợ chọn nơi lưu trú tại khu trung tâm cũ Sài Gòn? Gửi ngày lưu trú, số người, ngân sách và những tiện nghi cần thiết để đội ngũ Huyen&apos;s tư vấn lựa chọn phù hợp.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/tim-phong" className="rounded-lg bg-sky-800 px-5 py-3 font-semibold text-white">Tìm phòng cho chuyến đi</Link>
          <Link href="/lien-he" className="rounded-lg border border-sky-800 px-5 py-3 text-sky-800">Liên hệ tư vấn</Link>
        </div>
      </article>
    </div>
  );
}
