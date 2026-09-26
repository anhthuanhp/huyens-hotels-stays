"use client";

export default function ContactFloat() {
  return (
    <div
      className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-3 sm:right-5"
      aria-label="Liên hệ"
    >
      {/* Zalo */}
      <a
        href="https://zalo.me/0902095669"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat với Huyen's Hotels & Stays qua Zalo"
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg ring-1 ring-black/10 transition-transform duration-200 hover:scale-110 sm:h-12 sm:w-12"
      >
        <img
          src="/icons/zalo.svg"
          alt=""
          className="h-full w-full object-cover"
        />
      </a>

      {/* WhatsApp */}
      <a
        href="https://wa.me/84902095669"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat với Huyen's Hotels & Stays qua WhatsApp"
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg ring-1 ring-black/10 transition-transform duration-200 hover:scale-110 sm:h-12 sm:w-12"
      >
        <img
          src="/icons/whatsapp.svg"
          alt=""
          className="h-full w-full object-cover"
        />
      </a>
    </div>
  );
}