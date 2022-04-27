const basepath = process.env.NEXT_BASE_PATH;
const nextConfig = {
  reactStrictMode: true,
  basePath: basepath,
  experimental: {
    outputStandalone: true,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_BASE_PATH: basepath,
    NEXT_API_URL: process.env.NEXT_API_URL,
    NEXT_INTERNAL_API_URL: process.env.NEXT_INTERNAL_API_URL || process.env.NEXT_API_URL,
  },
}

module.exports = nextConfig