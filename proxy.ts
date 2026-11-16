import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  canonicalRoomSlug,
} from "./app/lib/room-seo-slugs";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const headers = new Headers(request.headers);
  headers.set("x-huyen-route-language", /^\/en(?:\/|$)/.test(url.pathname) ? "en" : "vi");
  const next = () => NextResponse.next({ request: { headers } });

  let decoded: string;

  try {
    decoded = decodeURIComponent(url.pathname);
  } catch {
    return next();
  }

  const match = decoded.match(
    /^\/(en\/)?khach-san\/([^/]+)\/phong\/([^/]+)\/?$/
  );

  if (!match) return next();

  const prefix = match[1] ?? "";
  const hotel = match[2];
  const slug = match[3];

  const canonical = canonicalRoomSlug(hotel, slug);

  if (canonical !== slug) {
    url.pathname =
      "/" + prefix + "khach-san/" +
      hotel + "/phong/" + canonical;

    return NextResponse.redirect(url, 308);
  }

  return next();
}

export const config = {
  matcher: [
    "/en/:path*",
    "/khach-san/:path*",
    "/((?!api/|_next/|.*\\..*).*)",
  ],
};
