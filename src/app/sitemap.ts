import type { MetadataRoute } from 'next';
import { mainNavLinks } from '@/config/navigation';

function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

const EXTRA_PATHS = ['/booking'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const paths = Array.from(
    new Set<string>(['', ...mainNavLinks.map((l) => l.href), ...EXTRA_PATHS])
  );

  return paths.map((path) => ({
    url: path === '' ? base : `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }));
}
