import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://huyenhotels.com";

const cleanSiteUrl = siteUrl.replace(/\/+$/, "");
const canonicalUrl = `${cleanSiteUrl}/chinh-sach-hoan-huy`;

export const metadata: Metadata = {
  title: "Chính sách hoàn & hủy phòng | Huyen's Hotels & Stays",
  description:
    "Chính sách hoàn và hủy phòng của Huyen's Hotels & Stays, bao gồm các quy định cần biết khi thay đổi hoặc hủy đặt phòng.",
  keywords: [
    "chính sách hoàn hủy phòng",
    "chính sách hủy phòng khách sạn",
    "chính sách hoàn tiền đặt phòng",
    "quy định hủy phòng",
    "hủy đặt phòng khách sạn",
    "Huyen's Hotels & Stays",
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: canonicalUrl,
    siteName: "Huyen's Hotels & Stays",
    title: "Chính sách hoàn & hủy phòng | Huyen's Hotels & Stays",
    description:
      "Tìm hiểu các quy định về hoàn tiền, thay đổi và hủy đặt phòng tại Huyen's Hotels & Stays.",
    images: [
      {
        url: `${cleanSiteUrl}/hero/hero-1.webp`,
        width: 1200,
        height: 630,
        alt: "Huyen's Hotels & Stays",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chính sách hoàn & hủy phòng | Huyen's Hotels & Stays",
    description:
      "Các quy định về hoàn tiền, thay đổi và hủy đặt phòng tại Huyen's Hotels & Stays.",
    images: [`${cleanSiteUrl}/hero/hero-1.webp`],
  },
};

export default function CancellationPolicyPage() {
  return (
    <main className="bg-white text-neutral-800">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="mb-10 border-b border-neutral-200 pb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Chính sách hoàn &amp; hủy phòng
          </h1>

          <p className="mt-4 text-base leading-7 text-neutral-600">
            Quy định về việc thay đổi, hủy đặt phòng và hoàn tiền khi khách
            hàng sử dụng dịch vụ lưu trú của Huyen&apos;s Hotels &amp; Stays.
          </p>

          <p className="mt-3 text-sm text-neutral-500">
            Cập nhật lần cuối: 01/10/2026
          </p>
        </header>

        <div className="space-y-10 text-[15px] leading-7">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              1. Quy định chung
            </h2>

            <p className="mt-3">
              Chính sách hoàn và hủy phòng được áp dụng tùy theo từng khách
              sạn, guesthouse, homestay, loại phòng, thời gian lưu trú và điều
              kiện của từng đơn đặt phòng.
            </p>

            <p className="mt-3">
              Trước khi hoàn tất đặt phòng, khách hàng nên kiểm tra kỹ điều
              kiện hủy và hoàn tiền được áp dụng cho phòng đã lựa chọn.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              2. Yêu cầu hủy phòng
            </h2>

            <p className="mt-3">
              Khách hàng có thể gửi yêu cầu hủy phòng bằng cách liên hệ với
              Huyen&apos;s Hotels &amp; Stays theo thông tin liên hệ được cung
              cấp trên website hoặc trong xác nhận đặt phòng.
            </p>

            <p className="mt-3">
              Thời điểm Huyen&apos;s Hotels &amp; Stays tiếp nhận yêu cầu hủy
              có thể được sử dụng làm căn cứ để xác định điều kiện hoàn tiền
              theo chính sách áp dụng cho đơn đặt phòng.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              3. Điều kiện hoàn tiền
            </h2>

            <p className="mt-3">
              Việc hoàn tiền phụ thuộc vào điều kiện đặt phòng cụ thể. Có
              những loại giá hoặc chương trình đặt phòng có thể được hoàn tiền,
              trong khi một số loại giá có thể không được hoàn tiền hoặc chỉ
              được hoàn một phần.
            </p>

            <p className="mt-3">
              Nếu đơn đặt phòng đủ điều kiện hoàn tiền, số tiền được hoàn sẽ
              được xác định dựa trên số tiền khách đã thanh toán và điều kiện
              hủy được áp dụng cho đơn đặt phòng đó.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              4. Hủy phòng trước thời hạn
            </h2>

            <p className="mt-3">
              Nếu khách hủy phòng trong thời hạn được quy định là hủy miễn
              phí, khách có thể được hoàn lại khoản tiền đủ điều kiện theo
              chính sách của đơn đặt phòng.
            </p>

            <p className="mt-3">
              Nếu yêu cầu hủy được thực hiện sau thời hạn hủy miễn phí, khoản
              phí hủy hoặc số tiền không được hoàn có thể được áp dụng theo
              điều kiện của loại phòng và đơn đặt phòng.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              5. Hủy phòng sát ngày nhận phòng
            </h2>

            <p className="mt-3">
              Đối với các yêu cầu hủy được thực hiện gần ngày nhận phòng,
              chính sách hủy của từng cơ sở lưu trú hoặc loại giá có thể quy
              định khoản phí hủy hoặc không hoàn tiền.
            </p>

            <p className="mt-3">
              Khách hàng nên kiểm tra điều kiện hủy cụ thể trước khi đặt phòng
              để biết chính xác quyền hoàn tiền trong trường hợp cần hủy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              6. Khách không đến nhận phòng
            </h2>

            <p className="mt-3">
              Trường hợp khách không đến nhận phòng theo thời gian đã đặt mà
              không thông báo trước có thể được xem là không đến nhận phòng
              (no-show).
            </p>

            <p className="mt-3">
              Việc hoàn tiền hoặc giữ lại tiền trong trường hợp không đến nhận
              phòng sẽ phụ thuộc vào điều kiện của đơn đặt phòng và chính sách
              của cơ sở lưu trú.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              7. Thay đổi ngày lưu trú
            </h2>

            <p className="mt-3">
              Khách hàng có thể liên hệ để yêu cầu thay đổi ngày nhận hoặc trả
              phòng.
            </p>

            <p className="mt-3">
              Việc thay đổi phụ thuộc vào tình trạng phòng và điều kiện của
              đơn đặt phòng. Nếu giá phòng tại ngày mới cao hơn, khách có thể
              phải thanh toán phần chênh lệch theo giá được áp dụng tại thời
              điểm thay đổi.
            </p>

            <p className="mt-3">
              Nếu giá phòng tại ngày mới thấp hơn, việc điều chỉnh hoặc hoàn
              phần chênh lệch sẽ phụ thuộc vào điều kiện của đơn đặt phòng.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              8. Thay đổi loại phòng hoặc số lượng phòng
            </h2>

            <p className="mt-3">
              Mọi yêu cầu thay đổi loại phòng hoặc số lượng phòng cần được
              xác nhận lại dựa trên tình trạng phòng tại thời điểm yêu cầu.
            </p>

            <p className="mt-3">
              Nếu thay đổi làm phát sinh thêm chi phí, khách hàng sẽ được
              thông báo về khoản chênh lệch trước khi thay đổi được xác nhận.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              9. Thời gian xử lý hoàn tiền
            </h2>

            <p className="mt-3">
              Sau khi yêu cầu hoàn tiền được xác nhận, thời gian tiền được
              hoàn về tài khoản hoặc phương thức thanh toán của khách có thể
              phụ thuộc vào phương thức thanh toán, ngân hàng hoặc đơn vị cung
              cấp dịch vụ thanh toán.
            </p>

            <p className="mt-3">
              Vì vậy, thời gian tiền thực tế được ghi có có thể khác với thời
              điểm Huyen&apos;s Hotels &amp; Stays hoàn tất xử lý yêu cầu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              10. Trường hợp đặc biệt
            </h2>

            <p className="mt-3">
              Trong trường hợp phát sinh sự kiện bất khả kháng hoặc các tình
              huống đặc biệt ảnh hưởng đến khả năng cung cấp phòng, Huyen&apos;s
              Hotels &amp; Stays sẽ phối hợp với khách hàng và cơ sở lưu trú để
              đưa ra phương án xử lý phù hợp.
            </p>

            <p className="mt-3">
              Phương án có thể bao gồm thay đổi ngày lưu trú, chuyển sang
              phương án lưu trú khác hoặc hoàn tiền tùy theo tình huống và
              điều kiện thực tế.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              11. Trường hợp đặt phòng qua nền tảng bên thứ ba
            </h2>

            <p className="mt-3">
              Đối với đặt phòng được thực hiện thông qua các nền tảng đặt
              phòng hoặc đối tác bên thứ ba, chính sách hoàn và hủy có thể
              được áp dụng theo điều kiện của nền tảng hoặc đơn đặt phòng
              tương ứng.
            </p>

            <p className="mt-3">
              Khách hàng nên kiểm tra điều kiện hủy và hoàn tiền được hiển thị
              trên nền tảng nơi đơn đặt phòng được thực hiện.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              12. Liên hệ yêu cầu hoàn hoặc hủy phòng
            </h2>

            <p className="mt-3">
              Khi cần hủy phòng hoặc yêu cầu hoàn tiền, khách hàng nên cung cấp
              mã đặt phòng cùng thông tin liên hệ để Huyen&apos;s Hotels &amp;
              Stays có thể kiểm tra và xử lý nhanh chóng.
            </p>

            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
              <p>
                <strong>Công ty TNHH Huyen Group</strong>
              </p>

              <p className="mt-1">
                Địa chỉ: 18A/139 Nguyễn Thị Minh Khai, Sài Gòn, TP. Hồ Chí Minh
              </p>

              <p className="mt-1">
                Website: huyenhotels.com
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              13. Thay đổi chính sách
            </h2>

            <p className="mt-3">
              Chính sách hoàn và hủy phòng có thể được cập nhật để phù hợp với
              hoạt động kinh doanh, điều kiện dịch vụ và các quy định hiện
              hành.
            </p>

            <p className="mt-3">
              Phiên bản mới nhất sẽ được công bố trên website Huyen&apos;s
              Hotels &amp; Stays.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}