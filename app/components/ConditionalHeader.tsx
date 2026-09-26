"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Chỉ hiện Header đầy đủ ở trang chủ
  if (pathname === "/") {
    return <Header />;
  }

  // Các trang con không hiển thị thêm nút quay về trang chủ
  return null;
}