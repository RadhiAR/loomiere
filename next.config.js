/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            // Add your CDN host here later if needed.
            // { protocol: "https", hostname: "cdn.yoursite.com" }
        ]
    }
};

module.exports = nextConfig;