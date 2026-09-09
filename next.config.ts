import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "host", value: "shop.wavedomethod.com" }],
          destination: "/shop",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
