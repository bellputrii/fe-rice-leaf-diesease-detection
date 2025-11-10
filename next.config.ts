import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '103.103.20.102',
        port: '',
        pathname: '/files/public/**',
      },
    ],
  },

  eslint: {
    // Warning: this allows production builds to succeed even if there are ESLint errors.
    ignoreDuringBuilds: true,
  },
  
};

export default nextConfig;
