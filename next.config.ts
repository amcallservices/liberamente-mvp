import type { NextConfig } from 'next';

const supabaseHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname; } catch { return ''; }
})();

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: '8mb' } },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Cover paths are reused when an author replaces a cover, so keep the cache short.
    minimumCacheTTL: 3600,
    remotePatterns: [
      { protocol: 'https', hostname: supabaseHost || '*.supabase.co', pathname: '/storage/v1/object/public/covers/**' },
    ],
  },
};
export default nextConfig;
