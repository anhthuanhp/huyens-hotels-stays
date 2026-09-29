"use client";

import dynamic from "next/dynamic";

// ssr: false chỉ dùng được trong client component, nên cần file bọc này.
// Hai widget nổi được tải sau khi trang đã hydrate xong, không nằm trong
// JS ban đầu của mọi trang.
const ContactFloat = dynamic(() => import("./ContactFloat"), { ssr: false });
const AIAssistant = dynamic(() => import("./AIAssistant"), { ssr: false });

export default function LazyWidgets() {
  return (
    <>
      <ContactFloat />
      <AIAssistant />
    </>
  );
}
