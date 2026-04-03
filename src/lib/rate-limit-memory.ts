/**
 * Lightweight in-memory rate limits (per server instance).
 * For multi-instance production, add Redis or edge rate limiting.
 */

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

function prune(key: string, now: number) {
  const b = store.get(key);
  if (b && now > b.resetAt) store.delete(key);
}

export function checkRateLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  prune(key, now);

  let b = store.get(key);
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    store.set(key, b);
  }

  if (b.count >= max) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }

  b.count += 1;
  return { ok: true };
}

export function getClientIp(headers: Headers): string {
  const xf = headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0]?.trim() || 'unknown';
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
