/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "miro.medium.com",
      },
    ],
  },
  // experimental: {
  //   authInterrupts: true,
  // },
};

export default nextConfig;
