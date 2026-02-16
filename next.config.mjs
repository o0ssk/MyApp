import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    workboxOptions: {
        disableDevLogs: true,
        runtimeCaching: [
            {
                // Cache Google Fonts stylesheets
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: "StaleWhileRevalidate",
                options: {
                    cacheName: "google-fonts-stylesheets",
                    expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 },
                },
            },
            {
                // Cache Google Fonts webfont files
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: "CacheFirst",
                options: {
                    cacheName: "google-fonts-webfonts",
                    expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 },
                },
            },
            {
                // Cache static images
                urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
                handler: "StaleWhileRevalidate",
                options: {
                    cacheName: "static-images",
                    expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
                },
            },
            {
                // Cache CSS and JS bundles
                urlPattern: /\.(?:js|css)$/i,
                handler: "StaleWhileRevalidate",
                options: {
                    cacheName: "static-resources",
                    expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 30 },
                },
            },
        ],
    },
});

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

export default withPWA(nextConfig);
