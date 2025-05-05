import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['react-bootstrap'],
  },

  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
