/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Remote image patterns for external images (Firebase Storage, Unsplash, etc.)
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.firebasestorage.app',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com', // Google profile photos
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
                pathname: '/**',
            },
        ],
        // Enable image optimization
        formats: ['image/avif', 'image/webp'],
    },
    // Optimize font loading
    optimizeFonts: true,
};

export default nextConfig;
