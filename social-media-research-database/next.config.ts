import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['react-bootstrap'],
  },

  output: 'standalone',
};

export default nextConfig;
