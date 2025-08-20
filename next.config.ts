import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "react-markdown"],
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  // Reduce bundle size and improve compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Optimize for faster builds
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Enable SWC minification for faster builds
  swcMinify: true,
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Don't bundle server-side modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Optimize for development
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };

      // Reduce the number of files watched
      config.snapshot = {
        managedPaths: [/^(.+?[\\/]node_modules[\\/])/],
      };

      // Optimize module resolution
      config.resolve.modules = ["node_modules"];
      config.resolve.extensions = [".js", ".jsx", ".ts", ".tsx"];

      // Reduce bundle size
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
            },
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;
