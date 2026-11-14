import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  canonicalRoomSlug,
} from "./app/lib/room-seo-slugs";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  let decoded: string;

  try {
    decoded = decodeURIComponent(url.pathname);
  } catch {
    return NextResponse.next();
  }

  const match = decoded.match(
    /^\/(en\/)?khach-san\/([^/]+)\/phong\/([^/]+)\/?$/
  );

  if (!match) return NextResponse.next();

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/khach-san/:path*",
    "/en/khach-san/:path*",
  ],
};
