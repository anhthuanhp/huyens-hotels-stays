"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Language = "vi" | "en";

type FormData = {
name: string;
phone: string;
email: string;
message: string;
};

const initialForm: FormData = {
name: "",
phone: "",
email: "",
message: "",
};

export default function LienHePage() {
const [language, setLanguage] = useState<Language>("vi");
const [form, setForm] = useState<FormData>(initialForm);
const [sending, setSending] = useState(false);
const [success, setSuccess] = useState("");
const [error, setError] = useState("");

const isVi = language === "vi";

const updateField = (field: keyof FormData, value: string) => {
setForm((prev) => ({
...prev,
[field]: value,
}));
};

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
event.preventDefault();

setSuccess("");
setError("");

if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
  setError(
    isVi
      ? "Vui lòng nhập họ tên, số điện thoại và nội dung cần hỗ trợ."
      : "Please enter your name, phone number and message."
  );
  return;
}

setSending(true);

try {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      message: form.message.trim(),
      language,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        (isVi
          ? "Không thể gửi thông tin."
          : "Unable to send your message.")
    );
  }

  setForm(initialForm);

  setSuccess(
    isVi
      ? "Tin nhắn của bạn đã được gửi. Huyen's Hotels & Stays sẽ liên hệ lại sớm nhất."
      : "Your message has been sent. Huyen's Hotels & Stays will contact you soon."
  );
} catch (err) {
  console.error("Contact form error:", err);

  setError(
    err instanceof Error
      ? err.message
      : isVi
        ? "Không thể gửi tin nhắn lúc này. Vui lòng thử lại."
        : "Unable to send your message. Please try again."
  );
} finally {
  setSending(false);
}

};

return (
<main className="min-h-screen bg-neutral-50">
<section className="border-b border-neutral-200 bg-white">
<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">


      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Huyen's Hotels & Stays
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {isVi ? "Liên hệ" : "Contact us"}
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600">
            {isVi
              ? "Bạn cần hỗ trợ đặt phòng, tìm phòng phù hợp hoặc muốn biết thêm thông tin về các điểm lưu trú của Huyen's? Hãy liên hệ với chúng tôi."
              : "Need help with a booking, looking for a suitable room, or want to learn more about Huyen's stays? Get in touch with us."}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 p-1">
          <button
            type="button"
            onClick={() => setLanguage("vi")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              language === "vi"
                ? "bg-sky-500 text-white"
                : "text-neutral-600 hover:bg-white"
            }`}
          >
            VI
          </button>

          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              language === "en"
                ? "bg-sky-500 text-white"
                : "text-neutral-600 hover:bg-white"
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </div>
  </section>

  <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-3xl border border-sky-100 bg-sky-50 p-7 shadow-sm sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
          {isVi ? "Thông tin liên hệ" : "Contact information"}
        </p>

        <h2 className="mt-3 text-2xl font-bold text-neutral-900">
          {isVi
            ? "Chúng tôi luôn sẵn sàng hỗ trợ bạn"
            : "We are here to help"}
        </h2>

        <p className="mt-4 leading-7 text-neutral-600">
          {isVi
            ? "Liên hệ trực tiếp với Huyen's Hotels & Stays để được hỗ trợ nhanh về phòng nghỉ, đặt phòng và thông tin lưu trú."
            : "Contact Huyen's Hotels & Stays directly for help with rooms, bookings and accommodation information."}
        </p>

        <div className="mt-8 space-y-4">
          <a
            href="tel:0902095669"
            className="block rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition hover:border-sky-300 hover:shadow-md"
          >
            <div className="text-sm text-neutral-500">Hotline</div>
            <div className="mt-1 text-lg font-semibold text-neutral-900">
              0902 095 669
            </div>
          </a>

          <a
            href="https://zalo.me/0902095669"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition hover:border-sky-300 hover:shadow-md"
          >
            <div className="text-sm text-neutral-500">Zalo</div>
            <div className="mt-1 text-lg font-semibold text-neutral-900">
              0902 095 669
            </div>
          </a>

          <a
            href="https://wa.me/84902095669"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition hover:border-sky-300 hover:shadow-md"
          >
            <div className="text-sm text-neutral-500">WhatsApp</div>
            <div className="mt-1 text-lg font-semibold text-neutral-900">
              +84 902 095 669
            </div>
          </a>

          <a
            href="mailto:buihongnhung83@gmail.com"
            className="block rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition hover:border-sky-300 hover:shadow-md"
          >
            <div className="text-sm text-neutral-500">Email</div>
            <div className="mt-1 break-all text-lg font-semibold text-neutral-900">
              buihongnhung83@gmail.com
            </div>
          </a>
        </div>

        <div className="mt-8">
          <Link
            href="/tim-phong"
            className="inline-flex w-full items-center justify-center rounded-xl bg-sky-500 px-5 py-3.5 font-semibold text-white transition hover:bg-sky-600"
          >
            {isVi ? "Đặt phòng trực tiếp" : "Book directly"}
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm sm:p-9">
        <h2 className="text-2xl font-bold text-neutral-900">
          {isVi ? "Gửi yêu cầu cho chúng tôi" : "Send us a message"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          {isVi
            ? "Điền thông tin bên dưới, đội ngũ Huyen's Hotels & Stays sẽ tiếp nhận và liên hệ lại."
            : "Fill in the form below and the Huyen's Hotels & Stays team will get back to you."}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-800">
              {isVi ? "Họ và tên" : "Full name"}{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                updateField("name", event.target.value)
              }
              placeholder={isVi ? "Nhập họ và tên" : "Your full name"}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-800">
                {isVi ? "Số điện thoại" : "Phone number"}{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                placeholder={
                  isVi ? "Nhập số điện thoại" : "Your phone number"
                }
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-800">
                Email
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                placeholder={
                  isVi ? "Email của bạn" : "Your email address"
                }
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-800">
              {isVi ? "Nội dung cần hỗ trợ" : "Message"}{" "}
              <span className="text-red-500">*</span>
            </label>

            <textarea
              value={form.message}
              onChange={(event) =>
                updateField("message", event.target.value)
              }
              rows={7}
              placeholder={
                isVi
                  ? "Ví dụ: Tôi muốn hỏi về phòng, giá phòng hoặc đặt phòng..."
                  : "For example: I would like to ask about rooms, rates or booking..."
              }
              className="w-full resize-y rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-xl bg-sky-500 px-5 py-3.5 font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending
              ? isVi
                ? "Đang gửi..."
                : "Sending..."
              : isVi
                ? "Gửi liên hệ"
                : "Send message"}
          </button>
        </form>
      </div>
    </div>
  </section>
</main>

);
}