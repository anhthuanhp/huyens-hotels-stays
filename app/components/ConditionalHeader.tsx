"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Chỉ hiển thị Header ở trang chủ
  if (pathname !== "/") {
    return null;
  }

  return <Header />;
}