/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["i1.sndcdn.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
    ],
  },
};

export default nextConfig;
