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
      // Google Translate widget hosts (translate.google.com, translate.googleapis.com,
      // *.googleapis.com, www.gstatic.com / *.gstatic.com) are allowlisted additively
      // so the language switcher loads and can fetch/translate without being blocked.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://*.clarity.ms https://translate.google.com https://translate.googleapis.com https://*.googleapis.com https://www.gstatic.com https://*.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://translate.googleapis.com https://*.googleapis.com https://www.gstatic.com https://*.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://www.google-analytics.com https://*.clarity.ms https://translate.google.com https://translate.googleapis.com https://*.googleapis.com https://www.gstatic.com https://*.gstatic.com https://www.google.com",
      "font-src 'self' data: https://fonts.gstatic.com https://www.gstatic.com https://*.gstatic.com",
      "media-src 'self' blob: data: https://videos.pexels.com https://res.cloudinary.com",
      "connect-src 'self' https://*.mongodb.net https://api.cloudinary.com https://api.resend.com https://www.google-analytics.com https://*.clarity.ms https://translate.google.com https://translate.googleapis.com https://*.googleapis.com https://www.gstatic.com https://*.gstatic.com",
      "frame-src 'self' https://www.google.com https://translate.google.com https://translate.googleapis.com",
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
    // @react-pdf/renderer (quotation PDF) ships native-ish deps (fontkit/yoga);
    // keep it external so it's required from node_modules at runtime instead of
    // being bundled — the supported setup for serverless route handlers.
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
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
      // Legacy PHP-era routes → new routes
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/Home", destination: "/", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/about.php", destination: "/about", permanent: true },
      { source: "/services.php", destination: "/services", permanent: true },
      { source: "/projects.php", destination: "/projects", permanent: true },
      { source: "/blogs.php", destination: "/blog", permanent: true },
      { source: "/blogdetail.php", destination: "/blog", permanent: true },
      { source: "/refund-and-cancellation-policy.php", destination: "/legal/refund", permanent: true },
      // Real legacy PHP filenames confirmed on the old server → new routes
      { source: "/about-us.php", destination: "/about", permanent: true },
      { source: "/contact-us.php", destination: "/contact", permanent: true },
      { source: "/website-designing.php", destination: "/services/website-designing", permanent: true },
      { source: "/why-mobile-responsive.php", destination: "/services/mobile-first-design", permanent: true },
      { source: "/privacy-policy.php", destination: "/legal/privacy-policy", permanent: true },
      { source: "/term-and-conditions.php", destination: "/legal/terms", permanent: true },
      { source: "/msme-registration.php", destination: "/", permanent: true },
      { source: "/12a-and-80g-registeration.php", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
