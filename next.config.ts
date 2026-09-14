import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/videos/stream': ['./public/videos/**/*', './uploads/videos/**/*'],
  },
};

export default nextConfig;
