/** @type {import('next').NextConfig} */

const basepath = process.env.NEXT_BASE_PATH || '';
const nextConfig = {
  reactStrictMode: true,
  basePath: basepath,
}

module.exports = nextConfig
