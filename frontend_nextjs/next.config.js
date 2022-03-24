/** @type {import('next').NextConfig} */

const basepath = process.env.NEXT_BASE_PATH || '';
const nextConfig = {
  reactStrictMode: true,
  basePath: basepath,
  experimental: {
    outputStandalone: true,
  },
}

module.exports = nextConfig
