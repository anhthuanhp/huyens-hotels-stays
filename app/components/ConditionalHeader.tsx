"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Chỉ hiện Header đầy đủ ở trang chủ
  if (pathname === "/") {
    return <Header />;
  }

  // Các trang con chỉ hiện nút quay về trang chủ
  return (
    <div className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex min-h-[64px] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-medium text-blue-700 transition hover:text-blue-900"
        >
          ← Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}