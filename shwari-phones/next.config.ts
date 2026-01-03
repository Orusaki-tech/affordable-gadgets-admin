import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  output: 'standalone', // For optimized production builds
  compress: true,
  poweredByHeader: false,
  
  images: {
    // Enable optimization in production, disable in development
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      // Development patterns (only in development)
      ...(process.env.NODE_ENV === 'development' ? [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '8000',
          pathname: '/**',
        },
        {
          protocol: 'http',
          hostname: '127.0.0.1',
          port: '8000',
          pathname: '/**',
        },
      ] : []),
      // Production patterns
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary CDN
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.railway.app', // Railway backend
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.herokuapp.com', // Heroku backend
        pathname: '/**',
      },
      // Allow custom domains (configure in production)
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_BRAND_CODE: process.env.NEXT_PUBLIC_BRAND_CODE,
    NEXT_PUBLIC_BRAND_NAME: process.env.NEXT_PUBLIC_BRAND_NAME,
  },
};

export default nextConfig;
