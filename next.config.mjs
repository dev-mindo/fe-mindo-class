/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {              
              hostname: 'miro.medium.com',
            },
          ],
    }
};

export default nextConfig;
