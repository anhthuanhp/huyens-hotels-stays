import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://huyenhotels.com";

const cleanSiteUrl = siteUrl.replace(/\/+$/, "");
const canonicalUrl = `${cleanSiteUrl}/chinh-sach-bao-mat`;

export const metadata: Metadata = {
  title: "Chính sách bảo mật | Huyen's Hotels & Stays",
  description:
    "Chính sách bảo mật của Huyen's Hotels & Stays, quy định cách thông tin của khách hàng được tiếp nhận, sử dụng và bảo vệ khi sử dụng website.",
  keywords: [
    "chính sách bảo mật",
    "chính sách bảo mật khách sạn",
    "bảo mật thông tin khách hàng",
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
    title: "Chính sách bảo mật | Huyen's Hotels & Stays",
    description:
      "Tìm hiểu chính sách bảo mật và cách Huyen's Hotels & Stays bảo vệ thông tin của khách hàng.",
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
    title: "Chính sách bảo mật | Huyen's Hotels & Stays",
    description:
      "Chính sách bảo mật và cách Huyen's Hotels & Stays bảo vệ thông tin khách hàng.",
    images: [`${cleanSiteUrl}/hero/hero-1.webp`],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white text-neutral-800">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="mb-10 border-b border-neutral-200 pb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Chính sách bảo mật
          </h1>

          <p className="mt-4 text-base leading-7 text-neutral-600">
            Huyen&apos;s Hotels &amp; Stays tôn trọng quyền riêng tư và cam kết
            bảo vệ thông tin cá nhân của khách hàng khi sử dụng website,
            tìm kiếm phòng và thực hiện đặt phòng.
          </p>

          <p className="mt-3 text-sm text-neutral-500">
            Cập nhật lần cuối: 01/10/2026
          </p>
        </header>

        <div className="space-y-10 text-[15px] leading-7">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              1. Thông tin chúng tôi thu thập
            </h2>

            <p className="mt-3">
              Khi bạn sử dụng website Huyen&apos;s Hotels &amp; Stays, chúng
              tôi có thể tiếp nhận một số thông tin cần thiết cho quá trình
              tìm kiếm, tư vấn và đặt phòng, bao gồm:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Họ và tên của khách đặt phòng.</li>
              <li>Số điện thoại liên hệ.</li>
              <li>Địa chỉ email.</li>
              <li>Thông tin ngày nhận phòng và ngày trả phòng.</li>
              <li>Số lượng người lớn, trẻ em và số lượng phòng.</li>
              <li>Thông tin phòng hoặc dịch vụ mà khách lựa chọn.</li>
              <li>Nội dung ghi chú hoặc yêu cầu đặc biệt do khách cung cấp.</li>
            </ul>

            <p className="mt-3">
              Một số thông tin kỹ thuật như địa chỉ IP, loại thiết bị, trình
              duyệt, thời gian truy cập và dữ liệu thống kê sử dụng website có
              thể được ghi nhận nhằm phục vụ việc vận hành, bảo mật và cải
              thiện chất lượng website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              2. Mục đích sử dụng thông tin
            </h2>

            <p className="mt-3">
              Thông tin được cung cấp có thể được sử dụng cho các mục đích sau:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Tiếp nhận và xử lý yêu cầu đặt phòng.</li>
              <li>Xác nhận thông tin đặt phòng và liên hệ với khách.</li>
              <li>Hỗ trợ khách hàng trước, trong và sau thời gian lưu trú.</li>
              <li>
                Quản lý tình trạng phòng và đảm bảo thông tin đặt phòng chính
                xác.
              </li>
              <li>
                Cải thiện trải nghiệm sử dụng website, giao diện và dịch vụ.
              </li>
              <li>
                Phát hiện, ngăn chặn các hành vi gian lận hoặc sử dụng website
                không phù hợp.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              3. Bảo vệ thông tin khách hàng
            </h2>

            <p className="mt-3">
              Huyen&apos;s Hotels &amp; Stays áp dụng các biện pháp phù hợp
              trong phạm vi khả năng vận hành website để hạn chế việc truy
              cập, sử dụng, thay đổi hoặc tiết lộ thông tin khách hàng trái
              phép.
            </p>

            <p className="mt-3">
              Tuy nhiên, không có phương thức truyền tải hoặc lưu trữ dữ liệu
              trên Internet nào có thể được đảm bảo an toàn tuyệt đối. Vì vậy,
              khách hàng nên chủ động bảo vệ thông tin tài khoản, thiết bị và
              các thông tin cá nhân của mình.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              4. Chia sẻ thông tin với bên thứ ba
            </h2>

            <p className="mt-3">
              Huyen&apos;s Hotels &amp; Stays không bán thông tin cá nhân của
              khách hàng cho bên thứ ba.
            </p>

            <p className="mt-3">
              Trong một số trường hợp cần thiết để cung cấp dịch vụ, thông tin
              liên quan có thể được chia sẻ với các đơn vị cung cấp hạ tầng,
              công nghệ, thanh toán, nền tảng đặt phòng hoặc dịch vụ hỗ trợ có
              liên quan. Việc chia sẻ chỉ được thực hiện trong phạm vi cần
              thiết cho mục đích cung cấp và vận hành dịch vụ.
            </p>

            <p className="mt-3">
              Thông tin cũng có thể được cung cấp khi có yêu cầu hợp pháp từ
              cơ quan nhà nước có thẩm quyền hoặc khi cần thiết để bảo vệ
              quyền và lợi ích hợp pháp của Huyen&apos;s Hotels &amp; Stays,
              khách hàng hoặc bên liên quan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              5. Cookie và dữ liệu kỹ thuật
            </h2>

            <p className="mt-3">
              Website có thể sử dụng cookie hoặc các công nghệ tương tự để ghi
              nhớ một số lựa chọn của người dùng, duy trì chức năng website,
              phân tích lưu lượng truy cập và cải thiện trải nghiệm sử dụng.
            </p>

            <p className="mt-3">
              Bạn có thể điều chỉnh cài đặt cookie thông qua trình duyệt của
              mình. Việc tắt một số cookie có thể ảnh hưởng đến một số chức
              năng của website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              6. Lưu trữ thông tin
            </h2>

            <p className="mt-3">
              Thông tin khách hàng được lưu trữ trong khoảng thời gian cần
              thiết để thực hiện mục đích thu thập, xử lý đặt phòng, chăm sóc
              khách hàng, đáp ứng yêu cầu pháp lý và giải quyết các vấn đề
              liên quan đến giao dịch.
            </p>

            <p className="mt-3">
              Khi thông tin không còn cần thiết cho các mục đích nêu trên,
              thông tin có thể được xóa hoặc xử lý theo quy định và quy trình
              lưu trữ dữ liệu phù hợp.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              7. Quyền của khách hàng
            </h2>

            <p className="mt-3">
              Trong phạm vi pháp luật hiện hành, khách hàng có thể yêu cầu:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Được biết về việc thông tin cá nhân được sử dụng như thế nào.</li>
              <li>Kiểm tra hoặc yêu cầu cập nhật thông tin cá nhân.</li>
              <li>Yêu cầu chỉnh sửa thông tin không chính xác.</li>
              <li>
                Yêu cầu xử lý hoặc xóa thông tin trong trường hợp phù hợp.
              </li>
              <li>
                Đặt câu hỏi hoặc phản ánh liên quan đến việc bảo vệ thông tin
                cá nhân.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">
              8. Liên hệ về chính sách bảo mật
            </h2>

            <p className="mt-3">
              Nếu bạn có câu hỏi, yêu cầu hoặc phản ánh liên quan đến việc thu
              thập và sử dụng thông tin cá nhân, vui lòng liên hệ với Huyen
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
              9. Thay đổi chính sách
            </h2>

            <p className="mt-3">
              Chính sách bảo mật có thể được cập nhật khi website, dịch vụ
              hoặc quy định pháp luật có thay đổi. Phiên bản mới nhất sẽ được
              đăng tải trực tiếp trên trang này.
            </p>

            <p className="mt-3">
              Việc tiếp tục sử dụng website sau khi chính sách được cập nhật
              đồng nghĩa với việc bạn đã xem và tiếp tục sử dụng website theo
              chính sách hiện hành trong phạm vi pháp luật cho phép.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}