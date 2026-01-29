import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  turbopack: {},
  allowedDevOrigins: ["192.168.18.185:3000"],
};

export default withPWA(nextConfig);
