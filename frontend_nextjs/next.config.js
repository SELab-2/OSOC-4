const basepath = process.env.NEXT_BASE_PATH || '';
const nextConfig = {
  reactStrictMode: true,
  basePath: basepath,
  experimental: {
    outputStandalone: true,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
  },
}

module.exports = nextConfig