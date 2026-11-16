import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const copy = {
  vi: {
    title: "Không tìm thấy trang | Huyen’s Hotels & Stays",
    description: "Trang bạn tìm có thể đã chuyển hoặc địa chỉ chưa đúng.",
    home: "Về trang chủ",
  },
  en: {
    title: "Page not found | Huyen’s Hotels & Stays",
    description: "This page may have moved or the address may be incorrect.",
    home: "Back to home",
  },
};

async function getLanguage() {
  return (await headers()).get("x-huyen-route-language") === "en" ? "en" : "vi";
}

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = copy[await getLanguage()];
  return { title, description, robots: { index: false, follow: false } };
}

export default async function GlobalNotFound() {
  const language = await getLanguage();
  const { description, home } = copy[language];
  return (
    <html lang={language}>
      <body className="bg-white text-slate-900">
        <main className="mx-auto max-w-xl px-6 py-24">
          <h1 className="text-3xl font-semibold">{language === "en" ? "Page not found" : "Không tìm thấy trang"}</h1>
          <p className="mt-4">{description}</p>
          <a href={language === "en" ? "/en" : "/"} className="mt-6 inline-block text-sky-800 underline">{home}</a>
        </main>
      </body>
    </html>
  );
}
