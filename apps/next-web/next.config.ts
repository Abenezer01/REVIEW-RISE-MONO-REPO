import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone', // Enable standalone output for Docker
  basePath: process.env.BASEPATH,

  // ⚡ Performance Optimizations
  reactStrictMode: true,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', '@mui/lab'],
    webpackMemoryOptimizations: true,
  },

  // Production optimizations
  poweredByHeader: false,
  compress: true,

  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: true,
        locale: false
      }
    ]
  },

  async rewrites() {
    return [
      {
        source: '/api/brands',
        destination: 'http://localhost:3004/api/v1/brand-profiles',
      },
      {
        source: '/api/brands/:path*',
        destination: 'http://localhost:3004/api/v1/brand-profiles/:path*',
      },
    ]
  },

  transpilePackages: ['@platform/utils', '@platform/contracts', '@platform/i18n', '@platform/db'],
  serverExternalPackages: ['@prisma/client', '@prisma/client-runtime-utils']
}

export default withNextIntl(nextConfig)


