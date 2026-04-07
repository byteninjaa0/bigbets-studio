/**
 * Canonical public site origin for emails, redirects, and absolute links.
 * Prefer NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_BASE_URL in production (never rely on localhost).
 */
export function getPublicSiteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    '';

  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  if (process.env.VERCEL_URL) {
    const host = process.env.VERCEL_URL.replace(/^https?:\/\//, '');
    return `https://${host}`;
  }

  return 'http://localhost:3000';
}
