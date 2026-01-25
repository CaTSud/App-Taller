import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ["192.168.88.9:3000"],
  },
  turbopack: {},
};

export default withPWA(nextConfig);
