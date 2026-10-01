import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://huyenhotels.com";

const cleanSiteUrl = siteUrl.replace(/\/+$/, "");
const canonicalUrl = `${cleanSiteUrl}/chinh-sach-dat-phong`;

export const metadata: Metadata = {
  title: "Chính sách đặt phòng | Huyen's Hotels & Stays",
  description:
    "Chính sách đặt phòng của Huyen's Hotels & Stays, bao gồm các quy định và thông tin cần biết khi đặt phòng tại khách sạn, guesthouse và homestay.",
  keywords: [
    "chính sách đặt phòng",
    "quy định đặt phòng khách sạn",
    "điều khoản đặt phòng",
    "đặt phòng khách sạn TP.HCM",
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
    title: "Chính sách đặt phòng | Huyen's Hotels & Stays",
    description:
      "Tìm hiểu các quy định và thông tin cần biết khi đặt phòng tại Huyen's Hotels & Stays.",
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
    title: "Chính sách đặt phòng | Huyen's Hotels & Stays",
    description:
      "Các quy định và thông tin cần biết khi đặt phòng tại Huyen's Hotels & Stays.",
    images: [`${cleanSiteUrl}/hero/hero-1.webp`],
  },
};

export default function BookingPolicyPage() {
  return (
    <main className="bg-white text-neutral-800">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="mb-10 border-b border-neutral-200 pb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Chính sách đặt phòng
          </h1>

          <p className="mt-4 text-base leading-7 text-neutral-600">
            Các quy định và thông tin cần biết khi đặt phòng tại Huyen&apos;s
            Hotels &amp; Stays. Vui lòng đọc kỹ thông tin trước khi hoàn tất
            đặt phòng.
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
              Khi thực hiện đặt phòng trên website Huyen&apos;s Hotels &amp;
              Stays, khách hàng xác nhận rằng các thông tin cung cấp là chính
              xác và đầy đủ.
            </p>

            <p className="mt-3">
              Việc đặt phòng chỉ được xem là hoàn tất khi hệ thống hoặc nhân
              viên của Huyen&apos;s Hotels &amp; Stays xác nhận đặt phòng thành
              công theo quy trình áp dụng tại thời điểm đặt phòng.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              2. Thông tin khi đặt phòng
            </h2>

            <p className="mt-3">
              Khách hàng cần cung cấp các thông tin cần thiết để Huyen&apos;s
              Hotels &amp; Stays có thể tiếp nhận và xử lý đặt phòng, bao gồm:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Họ và tên khách lưu trú.</li>
              <li>Số điện thoại liên hệ.</li>
              <li>Địa chỉ email nếu được yêu cầu.</li>
              <li>Ngày nhận phòng và ngày trả phòng.</li>
              <li>Số lượng người lớn và trẻ em.</li>
              <li>Loại phòng và số lượng phòng.</li>
              <li>Các yêu cầu hoặc ghi chú đặc biệt nếu có.</li>
            </ul>

            <p className="mt-3">
              Khách hàng chịu trách nhiệm về tính chính xác của các thông tin
              được cung cấp trong quá trình đặt phòng.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              3. Giá phòng
            </h2>

            <p className="mt-3">
              Giá phòng được hiển thị trên website có thể thay đổi tùy theo
              thời điểm, loại phòng, thời gian lưu trú, số lượng khách và các
              chương trình giá đang được áp dụng.
            </p>

            <p className="mt-3">
              Giá và tổng tiền được hiển thị tại thời điểm xác nhận đặt phòng
              là cơ sở để xử lý đơn đặt phòng, trừ trường hợp có sai sót rõ
              ràng về giá hoặc thông tin hệ thống.
            </p>

            <p className="mt-3">
              Các khoản phí phát sinh ngoài giá phòng, nếu có, sẽ được thông
              báo theo chính sách của từng cơ sở lưu trú.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              4. Nhận phòng và trả phòng
            </h2>

            <p className="mt-3">
              Thời gian nhận phòng và trả phòng có thể khác nhau tùy từng
              khách sạn, guesthouse hoặc homestay. Khách hàng nên kiểm tra
              thông tin của cơ sở lưu trú cụ thể trước khi đặt phòng.
            </p>

            <p className="mt-3">
              Khi nhận phòng, khách có thể được yêu cầu cung cấp giấy tờ tùy
              thân hợp lệ theo quy định của cơ sở lưu trú và pháp luật hiện
              hành.
            </p>

            <p className="mt-3">
              Nếu khách dự kiến đến muộn hoặc có yêu cầu đặc biệt về thời gian
              nhận phòng, vui lòng liên hệ trước với cơ sở lưu trú.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              5. Thay đổi thông tin đặt phòng
            </h2>

            <p className="mt-3">
              Khách hàng có thể liên hệ Huyen&apos;s Hotels &amp; Stays để yêu
              cầu thay đổi thông tin đặt phòng như ngày lưu trú, số lượng
              khách hoặc loại phòng.
            </p>

            <p className="mt-3">
              Việc thay đổi phụ thuộc vào tình trạng phòng, giá phòng tại thời
              điểm thay đổi và chính sách của từng cơ sở lưu trú.
            </p>

            <p className="mt-3">
              Không phải mọi yêu cầu thay đổi đều có thể được đáp ứng nếu cơ
              sở lưu trú đã hết phòng hoặc điều kiện đặt phòng không cho phép
              thay đổi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              6. Hủy phòng
            </h2>

            <p className="mt-3">
              Chính sách hủy phòng có thể khác nhau tùy theo khách sạn, loại
              phòng, thời gian lưu trú và điều kiện của từng đơn đặt phòng.
            </p>

            <p className="mt-3">
              Khách hàng cần kiểm tra điều kiện hủy được áp dụng cho đơn đặt
              phòng của mình trước khi xác nhận.
            </p>

            <p className="mt-3">
              Trường hợp khách muốn hủy phòng, vui lòng liên hệ theo thông tin
              liên hệ được cung cấp trong xác nhận đặt phòng hoặc trên
              website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              7. Trường hợp khách không đến
            </h2>

            <p className="mt-3">
              Nếu khách không đến nhận phòng theo thời gian đã đặt mà không
              thông báo trước, đơn đặt phòng có thể được xử lý theo điều kiện
              hủy hoặc điều kiện không đến nhận phòng được áp dụng cho đặt
              phòng đó.
            </p>

            <p className="mt-3">
              Chính sách cụ thể có thể khác nhau tùy từng cơ sở lưu trú và
              điều kiện của đơn đặt phòng.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              8. Số lượng khách và phòng
            </h2>

            <p className="mt-3">
              Khách hàng cần đặt đúng số lượng khách và số lượng phòng thực tế
              sử dụng.
            </p>

            <p className="mt-3">
              Mỗi loại phòng có thể có giới hạn số khách tối đa. Nếu số lượng
              khách thực tế vượt quá giới hạn của phòng, cơ sở lưu trú có thể
              yêu cầu khách bổ sung phòng hoặc thực hiện theo quy định của cơ
              sở lưu trú.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              9. Đặt phòng không thành công
            </h2>

            <p className="mt-3">
              Trong một số trường hợp, phòng có thể không còn khả dụng tại
              thời điểm hoàn tất đặt phòng do tình trạng phòng thay đổi hoặc
              có đơn đặt phòng khác được xác nhận trước.
            </p>

            <p className="mt-3">
              Hệ thống có thể thực hiện kiểm tra tình trạng phòng trước khi
              hoàn tất đơn đặt phòng. Nếu phòng không còn khả dụng, khách hàng
              sẽ được thông báo để lựa chọn phương án khác.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              10. Trách nhiệm của khách hàng
            </h2>

            <p className="mt-3">
              Khách hàng có trách nhiệm:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                Cung cấp thông tin đặt phòng chính xác và đầy đủ.
              </li>
              <li>
                Kiểm tra ngày lưu trú, loại phòng và số lượng phòng trước khi
                xác nhận.
              </li>
              <li>
                Tuân thủ nội quy của cơ sở lưu trú trong thời gian lưu trú.
              </li>
              <li>
                Thanh toán các khoản tiền hợp lệ theo điều kiện đặt phòng.
              </li>
              <li>
                Thông báo sớm nếu có thay đổi hoặc phát sinh liên quan đến
                đặt phòng.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              11. Trách nhiệm của Huyen&apos;s Hotels &amp; Stays
            </h2>

            <p className="mt-3">
              Huyen&apos;s Hotels &amp; Stays hỗ trợ tiếp nhận và xử lý yêu
              cầu đặt phòng, cung cấp thông tin về phòng và hỗ trợ khách hàng
              trong phạm vi dịch vụ được cung cấp trên website.
            </p>

            <p className="mt-3">
              Trong trường hợp có sự cố liên quan đến tình trạng phòng hoặc
              thông tin đặt phòng, Huyen&apos;s Hotels &amp; Stays sẽ phối hợp
              với khách hàng và cơ sở lưu trú để xử lý phù hợp.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              12. Liên hệ hỗ trợ
            </h2>

            <p className="mt-3">
              Nếu cần hỗ trợ về đặt phòng, thay đổi thông tin hoặc các vấn đề
              liên quan đến lưu trú, khách hàng có thể liên hệ với Huyen
              Group.
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
              Chính sách đặt phòng có thể được cập nhật để phù hợp với hoạt
              động kinh doanh, dịch vụ lưu trú và các quy định hiện hành.
            </p>

            <p className="mt-3">
              Phiên bản mới nhất của chính sách sẽ được công bố trên website
              Huyen&apos;s Hotels &amp; Stays.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}