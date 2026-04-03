import { NextResponse } from 'next/server';

const PREFIX = '[api]';

/** Server-side debug log for route handlers */
export function logApiError(method: string, path: string, message: string, err?: unknown) {
  if (err !== undefined) {
    console.error(`${PREFIX} ${method} ${path} — ${message}`, err);
  } else {
    console.error(`${PREFIX} ${method} ${path} — ${message}`);
  }
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, message, error: message }, { status });
}

export function jsonOk(data: Record<string, unknown>, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export async function parseJsonBody<T>(req: Request): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  try {
    const data = (await req.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, response: jsonError('Invalid or empty JSON body.', 400) };
  }
}
