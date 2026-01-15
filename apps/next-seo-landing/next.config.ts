/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output disabled for local development to avoid Windows symlink permission errors
  // Docker builds will set NEXT_OUTPUT=standalone via environment variable
  output: (() => {
    // Debug logging to see what's happening during build
    console.log('----------------------------------------');
    console.log('DEBUG (next-seo-landing): Configuring output');
    console.log('DEBUG: NODE_ENV:', process.env.NODE_ENV);
    console.log('DEBUG: NEXT_OUTPUT:', process.env.NEXT_OUTPUT);
    console.log('----------------------------------------');
    return process.env.NEXT_OUTPUT as 'standalone' | undefined;
  })(),
  basePath: process.env.BASEPATH,
  transpilePackages: ['@platform/utils', '@platform/contracts', '@platform/i18n', '@platform/db'],
  serverExternalPackages: ['@prisma/client', '@prisma/client-runtime-utils']
}

export default nextConfig
