
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";

function getDeviceType() {
  if (typeof window === "undefined") {
    return "desktop";
  }

  return window.innerWidth < 768 ? "mobile" : "desktop";
}

function getSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  const key = "huyen-visitor-session";

  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

function getHotelSlug(pathname: string) {
  const match = pathname.match(/^\/khach-san\/([^/]+)/);

  return match?.[1] ?? null;
}

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Không thống kê khu vực Admin
    if (pathname.startsWith("/admin")) {
      return;
    }

    const recordVisit = async () => {
      try {
        const sessionId = getSessionId();

        if (!sessionId) return;

        await supabase.from("website_visits").insert({
          session_id: sessionId,
          page_path: pathname,
          hotel_slug: getHotelSlug(pathname),
          device_type: getDeviceType(),
        });
      } catch (error) {
        console.error("Visitor tracking error:", error);
      }
    };

    recordVisit();
  }, [pathname]);

  return null;
}

