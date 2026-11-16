import type { Metadata } from "next";
import { DEFAULT_SHARE_IMAGE, SITE_NAME } from "../lib/seo";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { cache, type ReactNode } from "react";
import { HOME_FAQ_GROUPS } from "../data/home-faq";
import { languageAlternates, localizedHref } from "../lib/localized-path";

type Language = "vi" | "en";
type Copy = readonly [string, string];

const pages = {
  "cau-hoi-thuong-gap": {
    title: ["Câu hỏi thường gặp", "Frequently asked questions"],
    description: ["Giải đáp về đặt phòng, nhận phòng và lưu trú tại từng cơ sở của Huyen’s Hotels & Stays.", "Answers about booking, check-in and staying at each Huyen’s Hotels & Stays property."],
  },
  "huong-dan-dat-phong": {
    title: ["Hướng dẫn đặt phòng", "Booking guide"],
    description: ["Cách đặt phòng trực tiếp với Huyen’s Hotels & Stays hoặc qua các nền tảng đặt phòng online.", "How to book directly with Huyen’s Hotels & Stays or through an online booking platform."],
  },
  "huong-dan-thanh-toan": {
    title: ["Hướng dẫn thanh toán", "Payment guide"],
    description: ["Cách kiểm tra khoản cần thanh toán khi đặt phòng trực tiếp hoặc qua nền tảng đặt phòng online.", "How to check what you owe and pay for a direct or third-party booking."],
  },
} as const;

type PageKey = keyof typeof pages;

function localize(copy: Copy, language: Language) {
  return copy[language === "vi" ? 0 : 1];
}

export function supportMetadata(page: PageKey, language: Language): Metadata {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://huyenhotels.com").replace(/\/+$/, "");
  const path = `/${page}`;
  const title = `${localize(pages[page].title, language)} | Huyen’s Hotels & Stays`;
  const description = localize(pages[page].description, language);
  const canonical = origin + localizedHref(path, language);
  return {
    title,
    description,
    alternates: { ...languageAlternates(path, origin), canonical },
    openGraph: { type: "website", siteName: SITE_NAME, title, description, url: canonical, locale: language === "vi" ? "vi_VN" : "en_US", images: [DEFAULT_SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [DEFAULT_SHARE_IMAGE] },
  };
}

export function SupportPage({ page, language, children }: { page: PageKey; language: Language; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12 text-neutral-900 sm:px-6">
      <Link className="text-sm font-medium text-[#0b6c38] underline" href={localizedHref("/", language)}>
        {localize(["Về trang chủ", "Back to home"], language)}
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{localize(pages[page].title, language)}</h1>
      <p className="mt-3 leading-7 text-neutral-600">{localize(pages[page].description, language)}</p>
      <div className="mt-8 space-y-8">{children}</div>
    </article>
  );
}

function GuideSection({ title, steps, children, language }: { title: Copy; steps: Copy[]; children?: ReactNode; language: Language }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h2 className="text-xl font-semibold">{localize(title, language)}</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 leading-7 text-neutral-700">
        {steps.map((step) => <li key={step[0]}>{localize(step, language)}</li>)}
      </ol>
      {children}
    </section>
  );
}

const guideLink = "mt-4 inline-block font-semibold text-[#0b6c38] underline underline-offset-4";

export function BookingGuide({ language }: { language: Language }) {
  return (
    <SupportPage page="huong-dan-dat-phong" language={language}>
      <GuideSection language={language} title={["Đặt trực tiếp với Huyen’s", "Book directly with Huyen’s"]} steps={[
        ["Trên trang chủ, chọn cơ sở, ngày nhận và trả phòng, số khách rồi bấm Tìm phòng.", "On the homepage, select a property, check-in and check-out dates, and the number of guests. Then select Find a room."],
        ["Chọn phòng, kiểm tra tổng giá và điều kiện đặt phòng, rồi điền thông tin liên hệ và gửi yêu cầu.", "Choose a room, review the total and booking terms, then enter your contact details and submit the request."],
        ["Giữ mã yêu cầu và chờ xác nhận đặt phòng từ Huyen’s. Nếu cần hỗ trợ, liên hệ trực tiếp với cơ sở.", "Keep your request reference and wait for Huyen’s to confirm your booking. Contact the property directly if you need help."],
      ]}>
        <Link className={guideLink} href={localizedHref("/", language) + "#find-a-room"}>{localize(["Tìm phòng", "Find a room"], language)}</Link>
      </GuideSection>
      <GuideSection language={language} title={["Đặt qua nền tảng trung gian", "Book through an online travel platform"]} steps={[
        ["Trên trang chủ, chọn đúng cơ sở trong mục đặt qua các nền tảng và mở liên kết đang có.", "In the online booking section of the homepage, choose the property and open one of its available booking links."],
        ["Trên nền tảng đó, chọn ngày và loại phòng. Kiểm tra tổng giá, cách thanh toán và điều kiện hủy trước khi đặt.", "Select your dates and room on the platform. Review the total, payment terms and cancellation policy before booking."],
        ["Giữ mã xác nhận của nền tảng. Khi cần đổi hoặc hủy phòng, mở đơn trên nền tảng đã dùng để đặt.", "Keep the platform’s confirmation number. To change or cancel, open the reservation on the platform where you booked."],
      ]}>
        <Link className={guideLink} href={localizedHref("/", language) + "#ota-booking"}>{localize(["Xem các nền tảng đặt phòng", "View booking platforms"], language)}</Link>
      </GuideSection>
      <Link className={guideLink} href={localizedHref("/huong-dan-thanh-toan", language)}>{localize(pages["huong-dan-thanh-toan"].title, language)}</Link>
    </SupportPage>
  );
}

export function PaymentGuide({ language }: { language: Language }) {
  return (
    <SupportPage page="huong-dan-thanh-toan" language={language}>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <h2 className="text-xl font-semibold">{localize(["Phương thức thanh toán", "Accepted payment methods"], language)}</h2>
        <dl className="mt-3 space-y-3 leading-7 text-neutral-700">
          <div>
            <dt className="font-semibold">{localize(["Thẻ", "Cards"], language)}</dt>
            <dd>{localize(["Chấp nhận thanh toán bằng thẻ tại cơ sở. Nếu dùng thẻ quốc tế, bạn có thể hỏi cơ sở trước để xác nhận loại thẻ của mình.", "Card payments are accepted at the property. If you use an international card, you can check with the property in advance that your card is supported."], language)}</dd>
          </div>
          <div>
            <dt className="font-semibold">{localize(["Chuyển khoản ngân hàng", "Bank transfer"], language)}</dt>
            <dd>{localize(["Chuyển khoản theo thông tin người nhận và nội dung chuyển khoản do cơ sở xác nhận.", "Use the bank details and payment reference confirmed by the property."], language)}</dd>
          </div>
          <div>
            <dt className="font-semibold">{localize(["Tiền mặt", "Cash"], language)}</dt>
            <dd>{localize(["Thanh toán bằng tiền mặt tại cơ sở theo điều kiện đặt phòng.", "You can pay in cash at the property in accordance with your booking terms."], language)}</dd>
          </div>
        </dl>
      </section>
      <GuideSection language={language} title={["Khi đặt trực tiếp", "For direct bookings"]} steps={[
        ["Website không thu tiền khi bạn gửi yêu cầu đặt phòng. Kiểm tra xác nhận để biết tổng tiền, số tiền cần trả và hạn thanh toán.", "The website does not charge you when you submit a booking request. Check your confirmation for the total, amount due and payment deadline."],
        ["Nếu cần đặt cọc hoặc trả trước, xác nhận số tiền, phương thức và thông tin người nhận qua kênh chính thức của cơ sở. Khi chuyển khoản, ghi mã đặt phòng theo hướng dẫn và lưu biên nhận.", "If a deposit or advance payment is required, confirm the amount, payment method and recipient through the property’s official channel. If paying by bank transfer, use your booking reference as instructed and keep the receipt."],
        ["Nếu xác nhận ghi thanh toán tại cơ sở, hỏi cơ sở về phương thức được chấp nhận và số tiền còn lại trước khi đến.", "If your confirmation says to pay at the property, check accepted payment methods and the outstanding balance before arrival."],
      ]} />
      <GuideSection language={language} title={["Khi đặt qua nền tảng trung gian", "For third-party bookings"]} steps={[
        ["Mở xác nhận trên nền tảng đã đặt để xem khoản đã thu, khoản còn phải trả và bên thu tiền.", "Open the confirmation on your booking platform to see what has been paid, the balance due and who collects it."],
        ["Làm theo hướng dẫn thanh toán của nền tảng. Nếu có yêu cầu thanh toán khác với xác nhận, kiểm tra lại qua kênh hỗ trợ chính thức trước khi trả tiền.", "Follow the platform’s payment instructions. If a payment request differs from your confirmation, check with official support before paying."],
      ]} />
      <Link className={guideLink} href={localizedHref("/huong-dan-dat-phong", language)}>{localize(pages["huong-dan-dat-phong"].title, language)}</Link>
    </SupportPage>
  );
}

const loadHotelFaqs = cache(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);
  const [hotels, faqs] = await Promise.all([
    supabase.from("hotels").select("id, slug, name_vi, name_en").eq("status", "active").order("id"),
    supabase.from("hotel_faqs").select("id, hotel_id, question_vi, question_en, answer_vi, answer_en")
      .eq("is_active", true).order("sort_order").order("id"),
  ]);
  if (hotels.error || faqs.error) {
    console.error("Could not load public hotel FAQs", hotels.error?.message, faqs.error?.message);
    return [];
  }
  return hotels.data.map((hotel) => ({
    ...hotel,
    faqs: faqs.data.filter((faq) => faq.hotel_id === hotel.id),
  })).filter((hotel) => hotel.faqs.length > 0);
});

function Answer({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="border-b border-neutral-200 py-3">
      <summary className="cursor-pointer font-medium">{question}</summary>
      <p className="mt-2 whitespace-pre-line leading-7 text-neutral-700">{answer}</p>
    </details>
  );
}

export async function FaqPage({ language }: { language: Language }) {
  const hotels = await loadHotelFaqs();
  const isVi = language === "vi";
  return (
    <SupportPage page="cau-hoi-thuong-gap" language={language}>
      {HOME_FAQ_GROUPS.filter((group) => group.titleEn !== "Long stays").map((group) => (
        <section key={group.titleEn}>
          <h2 className="mb-2 text-xl font-semibold">{isVi ? group.titleVi : group.titleEn}</h2>
          {group.items.map((item) => (
            <Answer key={item.questionEn} question={isVi ? item.questionVi : item.questionEn} answer={isVi ? item.answerVi : item.answerEn} />
          ))}
        </section>
      ))}
      {hotels.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-xl font-semibold">{localize(["Câu hỏi theo từng cơ sở", "Questions by property"], language)}</h2>
          {hotels.map((hotel) => {
            const faqs = hotel.faqs.flatMap((faq) => {
              const question = isVi ? faq.question_vi : faq.question_en;
              const answer = isVi ? faq.answer_vi : faq.answer_en;
              return question?.trim() && answer?.trim() ? [{ id: faq.id, question, answer }] : [];
            });
            if (faqs.length === 0) return null;
            return (
              <section key={hotel.id}>
                <h3 className="text-lg font-semibold">
                  <Link className="text-[#0b6c38] underline" href={localizedHref(`/khach-san/${hotel.slug}`, language)}>
                    {isVi ? hotel.name_vi : hotel.name_en || hotel.name_vi}
                  </Link>
                </h3>
                {faqs.map((faq) => <Answer key={faq.id} question={faq.question} answer={faq.answer} />)}
              </section>
            );
          })}
        </section>
      )}
    </SupportPage>
  );
}
