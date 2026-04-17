import type { NextConfig } from 'next';

const isGitHubPages = process.env.NEXT_PUBLIC_BASE_PATH === '/rekikan';

const nextConfig: NextConfig = {
  output: 'export',
  ...(isGitHubPages && {
    basePath: '/rekikan',
    assetPrefix: '/rekikan',
  }),
};

export default nextConfig;
