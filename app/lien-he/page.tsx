"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Footer from "../components/Footer";

type Language = "vi" | "en";

// ✅ Thêm khai báo kiểu
declare global {
  interface WindowEventMap {
    "language-change": CustomEvent<Language>;
  }
}

export default function LienHePage() {
  const [language, setLanguage] = useState<Language>("vi");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isVi = language === "vi";

  // Đồng bộ ngôn ngữ
  useEffect(() => {
    const saved = localStorage.getItem("huyen-language");
    if (saved === "vi" || saved === "en") setLanguage(saved);

    const handler = (e: CustomEvent<Language>) => {
      if (e.detail === "vi" || e.detail === "en") setLanguage(e.detail);
    };
    window.addEventListener("language-change", handler);
    return () => window.removeEventListener("language-change", handler);
  }, []);

  // ✅ Kiểm tra định dạng
  const validatePhone = (val: string) => /^(0\d{9}|\+84\d{9})$/.test(val.trim());
  const validateEmail = (val: string | null) => {
    if (!val) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim() || null;
    const cleanMessage = message.trim();

    // ✅ Kiểm tra dữ liệu
    if (!validatePhone(cleanPhone)) {
      setErrorMessage(
        isVi
          ? "Số điện thoại không hợp lệ. Vui lòng nhập 10 số bắt đầu bằng 0 hoặc +84xxxxxxxxx."
          : "Invalid phone number. Please enter 10 digits starting with 0 or +84xxxxxxxxx."
      );
      setLoading(false);
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMessage(
        isVi
          ? "Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại."
          : "Invalid email address. Please check it again."
      );
      setLoading(false);
      return;
    }

    // Lưu vào Supabase
    const { error } = await supabase.from("contact_messages").insert({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      message: cleanMessage,
      language,
      status: "new",
    });

    if (error) {
      console.error("Lỗi lưu thông tin liên hệ:", error);
      setErrorMessage(
        isVi
          ? "Không thể gửi thông tin. Vui lòng thử lại sau."
          : "Unable to send your message. Please try again later."
      );
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setMessage("");
    setErrorMessage("");
    setSubmitted(false);
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* BACK TO HOME */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center px-6 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-sky-600"
          >
            <span aria-hidden="true">←</span>
            <span>{isVi ? "Quay về trang chính" : "Back to Main"}</span>
          </Link>
        </div>
      </div>

      {/* CONTACT SECTION */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
            {/* LEFT — CONTACT INFO */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-500">
                {isVi ? "Liên hệ" : "Contact"}
              </p>
              <h1
                className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-blue-900 md:text-5xl"
                style={{ fontFamily: 'Arial, "Helvetica Neue", "Segoe UI", sans-serif' }}
              >
                {isVi ? "Chúng tôi luôn sẵn sàng hỗ trợ bạn" : "We are here to help"}
              </h1>
              <p className="mt-5 text-base leading-7 text-neutral-500">
                {isVi
                  ? "Hãy để lại thông tin và nội dung bạn muốn liên hệ. Huyen's sẽ tiếp nhận và phản hồi trong thời gian sớm nhất."
                  : "Leave your contact details and message. Huyen's will get back to you as soon as possible."}
              </p>
              <div className="mt-8 space-y-5 text-sm text-neutral-600">
                {/* HOTLINE */}
                <div>
                  <p className="font-semibold text-neutral-900">Hotline</p>
                  <a href="tel:+84902095669" className="mt-1 block transition hover:text-blue-900">
                    +84 902095669
                  </a>
                </div>
                {/* WHATSAPP */}
                <div>
                  <p className="font-semibold text-neutral-900">WhatsApp</p>
                  <a
                    href="https://wa.me/84902095669"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block transition hover:text-blue-900"
                  >
                    +84 902095669
                  </a>
                </div>
                {/* ZALO */}
                <div>
                  <p className="font-semibold text-neutral-900">Zalo</p>
                  <a
                    href="https://zalo.me/84902095669"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block transition hover:text-blue-900"
                  >
                    +84 902095669
                  </a>
                </div>
                {/* EMAIL */}
                <div>
                  <p className="font-semibold text-neutral-900">Email</p>
                  <a
                    href="mailto:buihongnhung83@gmail.com"
                    className="mt-1 block break-all transition hover:text-blue-900"
                  >
                    buihongnhung83@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT — FORM */}
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 md:p-8">
              {submitted ? (
                <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-2xl text-sky-600">
                    ✓
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold text-neutral-900">
                    {isVi ? "Đã gửi thông tin" : "Message sent"}
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
                    {isVi
                      ? "Cảm ơn bạn đã liên hệ với Huyen's. Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất."
                      : "Thank you for contacting Huyen's. We will get back to you as soon as possible."}
                  </p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-6 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                  >
                    {isVi ? "Gửi thông tin khác" : "Send another message"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-2xl font-semibold text-neutral-900">
                    {isVi ? "Thông tin liên hệ" : "Contact information"}
                  </h2>

                  {/* HỌ VÀ TÊN */}
                  <div className="mt-7">
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      {isVi ? "Họ và tên" : "Full name"}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder={isVi ? "Nhập họ và tên" : "Enter your full name"}
                      className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* PHONE + EMAIL */}
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">
                        {isVi ? "Số điện thoại" : "Phone number"}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder={isVi ? "0901234567" : "+84901234567"}
                        className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={isVi ? "email@example.com" : "email@example.com"}
                        className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                  </div>

                  {/* MESSAGE */}
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      {isVi ? "Nội dung liên hệ" : "Message"}
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={6}
                      placeholder={isVi ? "Nhập nội dung bạn muốn liên hệ..." : "Enter your message..."}
                      className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* ERROR */}
                  {errorMessage && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {errorMessage}
                    </div>
                  )}

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 h-12 w-full rounded-xl bg-sky-600 px-6 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? isVi ? "ĐANG GỬI..." : "SENDING..."
                      : isVi ? "GỬI LIÊN HỆ" : "SEND MESSAGE"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Không truyền language nữa */}
      <Footer language={language} />
    </main>
  );
}