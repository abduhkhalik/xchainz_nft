import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL("https://xumm.app/sign/**")]
  }
};

export default nextConfig;
