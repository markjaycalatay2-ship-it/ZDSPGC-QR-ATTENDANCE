import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: ".next",
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
};

export default nextConfig;
