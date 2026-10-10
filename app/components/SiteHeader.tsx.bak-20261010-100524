"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type BackLink = { href: string; label: string };

function getBackLink(pathname: string): BackLink {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "khach-san" && segments[2] === "phong") {
    return { href: `/khach-san/${segments[1]}`, label: "Quay lại khách sạn" };
  }

  if (segments[0] === "khach-san" && segments[1]) {
    return { href: "/#hotels", label: "Quay về trang chủ" };
  }

  if (segments[0] === "blog" && segments[1]) {
    return { href: "/blog", label: "Quay lại Blog" };
  }

  if (segments[0] === "tim-phong" || segments[0] === "dat-phong") {
    return { href: "/#booking-search", label: "Quay lại" };
  }

  return { href: "/", label: "Quay về trang chủ" };
}

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";

  if (
    pathname === "/" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  ) {
    return null;
  }

  const back = getBackLink(pathname);

  return (
    <header className="relative z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Huyen's Hotels & Stays"
          className="flex shrink-0 items-center"
        >
          <Image
            src="/images/huyen-hotel-logo-v1.png"
            alt="Huyen's Hotels & Stays"
            width={180}
            height={60}
            priority
            className="h-auto w-[90px] sm:w-[105px] lg:w-[120px]"
          />
        </Link>

        <Link
          href={back.href}
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
        >
          <span aria-hidden="true">←</span>
          <span>{back.label}</span>
        </Link>
      </div>
    </header>
  );
}