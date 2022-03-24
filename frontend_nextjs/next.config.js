const basepath = process.env.NEXT_BASE_PATH || '';
const nextConfig = {
  reactStrictMode: true,
  basePath: basepath,
  experimental: {
    outputStandalone: true,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
    NEXT_BASE_PATH: basepath,
  },
}

module.exports = nextConfig