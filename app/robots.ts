
import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenhotels.com";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteUrl.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/test-route",
        ],
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
