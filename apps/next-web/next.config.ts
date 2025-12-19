import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
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
  transpilePackages: ['@platform/utils', '@platform/contracts', '@platform/i18n']
}

export default withNextIntl(nextConfig)

