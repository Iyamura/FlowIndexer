import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@flow-indexer/shared"],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
