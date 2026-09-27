"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Bot,
  CircleHelp,
  X,
} from "lucide-react";

export default function ContactFloat() {
  const [isOpen, setIsOpen] = useState(false);

  function openAI() {
    window.dispatchEvent(
      new CustomEvent("open-ai-assistant")
    );

    setIsOpen(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9998]">
      {/* Các nút con */}
      <div
        className={`absolute bottom-14 right-0 flex flex-col items-end gap-2 transition-all duration-200 ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        {/* AI */}
        <button
          type="button"
          onClick={openAI}
          aria-label="AI"
          className="group flex items-center gap-1.5"
        >
          <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-medium text-gray-500 shadow-sm ring-1 ring-black/5">
            AI
          </span>

          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
            <Bot size={21} />
          </span>
        </button>

        {/* Zalo */}
        <a
          href="https://zalo.me/0902095669"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Zalo"
          className="group flex items-center gap-1.5"
        >
          <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-medium text-gray-500 shadow-sm ring-1 ring-black/5">
            Zalo
          </span>

          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg ring-1 ring-black/10 transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
            <Image
              src="/icons/zalo.svg"
              alt=""
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          </span>
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/84902095669"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="group flex items-center gap-1.5"
        >
          <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-medium text-gray-500 shadow-sm ring-1 ring-black/5">
            WhatsApp
          </span>

          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg ring-1 ring-black/10 transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
            <Image
              src="/icons/whatsapp.svg"
              alt=""
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          </span>
        </a>
      </div>

      {/* Nút Help chính */}
      <button
        type="button"
        onClick={() =>
          setIsOpen((prev) => !prev)
        }
        aria-label={
          isOpen
            ? "Đóng trợ giúp"
            : "Mở trợ giúp"
        }
        aria-expanded={isOpen}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-white shadow-xl ring-1 ring-black/10 transition-all duration-200 hover:scale-105 hover:bg-slate-700 active:scale-95"
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <CircleHelp size={25} />
        )}
      </button>
    </div>
  );
}