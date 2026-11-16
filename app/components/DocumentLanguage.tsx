"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DocumentLanguage() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) document.documentElement.lang = /^\/en(?:\/|$)/.test(pathname) ? "en" : "vi";
  }, [pathname]);

  return null;
}
