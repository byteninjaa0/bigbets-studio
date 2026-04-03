/** Reads a user-facing message from standardized API JSON (`message` or legacy `error`). */
export function apiMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const o = data as Record<string, unknown>;
  if (typeof o.message === 'string' && o.message.trim()) return o.message;
  if (typeof o.error === 'string' && o.error.trim()) return o.error;
  return fallback;
}
