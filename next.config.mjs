/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://*.clarity.ms",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://www.google-analytics.com https://*.clarity.ms",
      "font-src 'self' data: https://fonts.gstatic.com",
      "media-src 'self' blob: data: https://videos.pexels.com https://res.cloudinary.com",
      "connect-src 'self' https://*.mongodb.net https://api.cloudinary.com https://api.resend.com https://www.google-analytics.com https://*.clarity.ms",
      "frame-src 'self' https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    minimumCacheTTL: 60,
  },

  experimental: {
    // framer-motion is intentionally omitted: optimizePackageImports + Next 14.2.x
    // produces "options.factory is undefined" runtime errors in dev when many client
    // components import from it. Tree-shaking still works without this hint.
    optimizePackageImports: [
      "lucide-react",
      "@tabler/icons-react",
      "date-fns",
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Static assets — long cache
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Legacy → new routes (if needed later)
      // { source: "/old-blog", destination: "/blog", permanent: true },
    ];
  },
};

export default nextConfig;
