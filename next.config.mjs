/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  })({
    reactStrictMode: true,
    experimental: {
      appDir: false,
    },
  });

export default nextConfig;