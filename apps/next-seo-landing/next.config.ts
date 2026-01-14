/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Enable standalone output for Docker
  basePath: process.env.BASEPATH,
  transpilePackages: ['@platform/utils', '@platform/contracts', '@platform/i18n', '@platform/db'],
  serverExternalPackages: ['@prisma/client', '@prisma/client-runtime-utils']
}

export default nextConfig
