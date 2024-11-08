/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        port: "",
        pathname: "/**",
      },
    ],
  },
  env: {
    HELIUS_API_KEY: process.env.HELIUS_API_KEY,
  },
};

export default nextConfig;
