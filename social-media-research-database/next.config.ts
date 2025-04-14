import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['react-bootstrap'],
  },
};

export default nextConfig;

