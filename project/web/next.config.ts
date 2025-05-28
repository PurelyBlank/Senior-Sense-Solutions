import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, 
};

module.exports = {
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',
  },
};

export default nextConfig;
