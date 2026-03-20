/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  distDir: '.nextL',
  experimental: {
    serverComponentsExternalPackages: ['bcrypt', 'jsonwebtoken'],
  },
}
module.exports = nextConfig
