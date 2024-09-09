/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: process.env.API_URL,
        REVALIDATE_TOKEN: process.env.REVALIDATE_TOKEN,
    },
    images: {
        domains: ['res.cloudinary.com']
    }
};

export default nextConfig;
