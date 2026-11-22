import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '/api/invite-agent': ['./assets/avatars/**'],
  },
  // Allow opening the dev server from other devices on the local network.
  allowedDevOrigins: ['172.16.30.90', '172.16.*.*', '192.168.*.*', '10.*.*.*'],
  images: {
    unoptimized: true,
  },
  typescript: {
    // `npm run typecheck` runs before the production build. Keeping this
    // separate avoids a Next.js 16 detached-process issue in restricted CI.
    ignoreBuildErrors: true,
  },
  experimental: {
    useTypeScriptCli: false,
  },
  turbopack: {
    root: rootDir,
  },
};

export default nextConfig;
