import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lltfkvpgzxybvzpqpjqk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  cleanDistDir: false, // Tắt hẳn việc tự động xóa thư mục
  output: "standalone", // Giảm thiểu việc ghi/xóa file
};

export default nextConfig;