/** @type {import('next').NextConfig} */

module.exports = {
  experimental: {
    optimizePackageImports: ['react-bootstrap'],
  },

  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  }
};