import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next",
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
};

export default nextConfig;
