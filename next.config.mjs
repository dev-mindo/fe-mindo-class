/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "miro.medium.com",
      },
      {
        protocol: 'https',
        hostname: 'classroom-mindo.b-cdn.net'
      }
    ],
  },
  experimental: {
    serverActions: true,
  },
  // experimental: {
  //   authInterrupts: true,
  // },
};

export default nextConfig;
