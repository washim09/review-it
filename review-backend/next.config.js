/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal configuration for Next.js 15.1.7
  reactStrictMode: false,
  
  // For SSE stream handling
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add fixes for stream handling in API routes
      config.externals = [...config.externals, 'bufferutil', 'utf-8-validate'];
    }
    return config;
  },

  // Configure headers for CORS and security
  async headers() {
    return [
      {
        // Matching all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://riviewit.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
      {
        // Matching all static files
        source: '/uploads/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://riviewit.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET' },
        ],
      },
    ];
  },
};

// Use CommonJS export for maximum compatibility
module.exports = nextConfig;