import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  compress: true,
  poweredByHeader: false,
  images: {
    loader: "custom",
    loaderFile: "./app/lib/image-loader.ts",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lltfkvpgzxybvzpqpjqk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.huyenhotels.com" }],
        destination: "https://huyenhotels.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
      { source: "/icons/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
  cleanDistDir: false, // Tắt hẳn việc tự động xóa thư mục
  output: "standalone", // Giảm thiểu việc ghi/xóa file
};

export default nextConfig;