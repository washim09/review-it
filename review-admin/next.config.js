/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.riviewit.com' },
      { protocol: 'http', hostname: 'localhost', port: '3000' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.riviewit.com',
  },
};
module.exports = nextConfig;
