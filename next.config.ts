import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Your existing rewrites configuration
  async rewrites() {
    return [
      {
        source: '/api/v3/:path*',
        destination: `${process.env.API_BASE_URL}/:path*`,
      },
    ]
  },

  // Your existing strict mode setting
  reactStrictMode: false,

  // Add the images configuration here
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**', // Allows any path on this hostname
      },
      // You can add more trusted hostnames here in the future
    ],
  },
};

export default nextConfig;