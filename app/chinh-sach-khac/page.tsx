"use client";

import { useEffect, useState } from "react";

type Language = "vi" | "en";

declare global {
  interface WindowEventMap {
    "language-change": CustomEvent<Language>;
  }
}

const policySections = {
  vi: [
    {
      id: "gia-va-thanh-toan",
      title: "Chính sách giá và thanh toán",
      paragraphs: [
        "Giá phòng được áp dụng theo mức giá được Huyen's Hotels & Stays công bố tại thời điểm khách thực hiện đặt phòng. Giá có thể thay đổi tùy theo loại phòng, thời gian lưu trú, số lượng khách, thời điểm đặt phòng và các chương trình ưu đãi đang áp dụng.",
        "Giá phòng được xác nhận tại thời điểm đặt phòng và áp dụng theo thông tin đặt phòng mà khách đã lựa chọn. Các khoản phí hoặc dịch vụ phát sinh ngoài nội dung đặt phòng, nếu có, sẽ được thông báo cho khách trước khi thực hiện.",
        "Khách có trách nhiệm thanh toán đầy đủ các khoản tiền theo thông tin và điều kiện của đặt phòng. Thời điểm và phương thức thanh toán có thể khác nhau tùy theo loại phòng, hình thức thuê và phương thức đặt phòng.",
        "Đối với các khoản thanh toán trực tiếp tại cơ sở lưu trú, khách có thể thanh toán bằng các phương thức mà cơ sở lưu trú chấp nhận tại thời điểm nhận phòng hoặc trong thời gian lưu trú.",
        "Trong trường hợp có sai sót rõ ràng về giá hoặc thông tin thanh toán do lỗi hệ thống, Huyen's Hotels & Stays có quyền kiểm tra và xác nhận lại thông tin với khách trước khi hoàn tất việc cung cấp dịch vụ.",
      ],
    },
    {
      id: "khieu-nai",
      title: "Chính sách khiếu nại",
      paragraphs: [
        "Huyen's Hotels & Stays luôn cố gắng cung cấp dịch vụ đúng với thông tin đã công bố và nội dung đặt phòng đã được xác nhận.",
        "Nếu khách có bất kỳ khiếu nại hoặc vấn đề nào liên quan đến phòng, dịch vụ, thanh toán hoặc trải nghiệm lưu trú, khách vui lòng thông báo cho nhân viên tại cơ sở lưu trú hoặc liên hệ với Huyen's Hotels & Stays trong thời gian sớm nhất để được hỗ trợ.",
        "Khi gửi khiếu nại, khách nên cung cấp các thông tin liên quan như họ tên, thông tin đặt phòng, thời gian lưu trú, nội dung vấn đề và hình ảnh hoặc tài liệu liên quan nếu có. Những thông tin này giúp Huyen's Hotels & Stays kiểm tra và xử lý vấn đề nhanh chóng, chính xác hơn.",
        "Huyen's Hotels & Stays sẽ tiếp nhận, kiểm tra thông tin và trao đổi với khách để đưa ra phương án xử lý phù hợp dựa trên tình trạng thực tế, chính sách áp dụng và quyền lợi của các bên.",
        "Đối với các vấn đề phát sinh trong thời gian lưu trú, khách nên thông báo ngay cho cơ sở lưu trú để Huyen's Hotels & Stays có cơ hội hỗ trợ hoặc khắc phục trong thời gian sớm nhất.",
      ],
    },
    {
      id: "hoan-doi-cham-dut",
      title: "Chính sách hoàn, đổi và chấm dứt thuê phòng",
      paragraphs: [
        "Việc hoàn tiền, thay đổi thông tin đặt phòng hoặc chấm dứt thời gian thuê phòng được thực hiện theo điều kiện của từng loại đặt phòng và các chính sách đã được thông báo cho khách tại thời điểm đặt phòng.",
        "Nếu khách muốn thay đổi ngày nhận phòng, ngày trả phòng, loại phòng, số lượng khách hoặc các thông tin khác trong đặt phòng, khách cần liên hệ với Huyen's Hotels & Stays trong thời gian sớm nhất. Việc thay đổi phụ thuộc vào tình trạng phòng và điều kiện đặt phòng tại thời điểm yêu cầu.",
        "Đối với các đặt phòng có chính sách không hoàn tiền hoặc có điều kiện hạn chế thay đổi, yêu cầu hoàn hoặc đổi có thể không được chấp nhận hoặc có thể phát sinh chi phí theo điều kiện đặt phòng đã được xác nhận.",
        "Trường hợp khách chấm dứt việc thuê phòng trước thời hạn, khoản tiền được hoàn lại hoặc không được hoàn lại sẽ được xác định dựa trên hình thức thuê, thời gian đã sử dụng, điều kiện đặt phòng và các khoản phát sinh thực tế.",
        "Nếu việc hủy, thay đổi hoặc chấm dứt thuê phòng xuất phát từ phía Huyen's Hotels & Stays, chúng tôi sẽ thông báo cho khách và phối hợp để đưa ra phương án xử lý phù hợp.",
        "Các khoản tiền được hoàn lại, nếu có, sẽ được thực hiện theo phương thức thanh toán ban đầu hoặc phương thức khác được hai bên thống nhất.",
      ],
    },
  ],

  en: [
    {
      id: "pricing-payment",
      title: "Pricing and Payment Policy",
      paragraphs: [
        "Room rates are based on the prices published by Huyen's Hotels & Stays at the time of booking. Rates may vary depending on the room type, length of stay, number of guests, booking time and applicable promotions.",
        "The room rate is confirmed at the time of booking and applies to the booking details selected by the guest. Any additional charges or services outside the confirmed booking, if applicable, will be communicated to the guest before they are provided.",
        "Guests are responsible for paying all amounts according to the booking information and applicable terms. Payment timing and methods may vary depending on the room type, rental arrangement and booking method.",
        "For payments made directly at the property, guests may use the payment methods accepted by the property at check-in or during their stay.",
        "If there is an obvious pricing or payment error caused by a system issue, Huyen's Hotels & Stays reserves the right to verify and reconfirm the information with the guest before completing the service.",
      ],
    },
    {
      id: "complaints",
      title: "Complaint Policy",
      paragraphs: [
        "Huyen's Hotels & Stays strives to provide services in accordance with the information published and the confirmed booking details.",
        "If a guest has any complaint or issue relating to the room, service, payment or stay experience, the guest should notify the property staff or contact Huyen's Hotels & Stays as soon as possible for assistance.",
        "When submitting a complaint, guests are encouraged to provide relevant information such as their name, booking information, stay dates, details of the issue and any relevant photos or documents. This information helps Huyen's Hotels & Stays investigate and handle the matter more efficiently.",
        "Huyen's Hotels & Stays will receive and review the information and discuss the matter with the guest in order to determine an appropriate resolution based on the actual circumstances, applicable policies and the interests of the parties involved.",
        "For issues occurring during a stay, guests are encouraged to notify the property immediately so that Huyen's Hotels & Stays has an opportunity to provide assistance or resolve the issue as soon as possible.",
      ],
    },
    {
      id: "refund-change-termination",
      title: "Refund, Change and Termination Policy",
      paragraphs: [
        "Refunds, booking changes and early termination of a stay are handled according to the conditions of the relevant booking and the policies communicated to the guest at the time of booking.",
        "If a guest wishes to change the check-in date, check-out date, room type, number of guests or other booking information, the guest should contact Huyen's Hotels & Stays as soon as possible. Changes are subject to room availability and the applicable booking conditions at the time of the request.",
        "For non-refundable bookings or bookings with restrictions on changes, a refund or change request may not be accepted or may be subject to applicable charges under the confirmed booking terms.",
        "If a guest terminates a stay before the originally agreed departure date, any refundable amount will be determined based on the rental arrangement, period already used, booking conditions and actual applicable charges.",
        "If a cancellation, change or termination is initiated by Huyen's Hotels & Stays, we will notify the guest and work with the guest to determine an appropriate resolution.",
        "Any applicable refund will be processed through the original payment method or another method mutually agreed by the parties.",
      ],
    },
  ],
};

export default function OtherPoliciesPage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "vi";
    }

    const savedLanguage = localStorage.getItem("huyen-language");

    return savedLanguage === "vi" || savedLanguage === "en"
      ? savedLanguage
      : "vi";
  });

  useEffect(() => {
    const handleLanguageChange = (
      event: CustomEvent<Language>
    ) => {
      if (
        event.detail === "vi" ||
        event.detail === "en"
      ) {
        setLanguage(event.detail);
      }
    };

    window.addEventListener(
      "language-change",
      handleLanguageChange
    );

    return () => {
      window.removeEventListener(
        "language-change",
        handleLanguageChange
      );
    };
  }, []);

  const isVi = language === "vi";

  const sections = isVi
    ? policySections.vi
    : policySections.en;

  return (
    <main className="min-h-screen bg-white">
      {/* HEADER */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {isVi
              ? "Các chính sách khác"
              : "Other Policies"}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {isVi
              ? "Các chính sách liên quan đến giá, thanh toán, khiếu nại, hoàn, đổi và chấm dứt thuê phòng tại Huyen's Hotels & Stays."
              : "Policies relating to pricing, payment, complaints, refunds, changes and termination of stays at Huyen's Hotels & Stays."}
          </p>
        </div>
      </section>

      {/* NỘI DUNG */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-12">
          {sections.map((section) => (
            <article
              key={section.id}
              id={section.id}
              className="scroll-mt-24"
            >
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {section.title}
              </h2>

              <div className="mt-5 space-y-4 text-[15px] leading-7 text-slate-700">
                {section.paragraphs.map(
                  (paragraph, index) => (
                    <p key={index}>
                      {paragraph}
                    </p>
                  )
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}