import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "functions/.next",
  // turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;