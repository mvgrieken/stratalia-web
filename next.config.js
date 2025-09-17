const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'img.youtube.com',
      'i.ytimg.com',
      'via.placeholder.com',
      'picsum.photos',
      'trrsgvxoylhcudtiimvb.supabase.co', // Supabase storage
      'stratalia.nl',
      'www.stratalia.nl'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    // optimizeCss: true, // Disabled due to critters dependency issue
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = withBundleAnalyzer(nextConfig)
