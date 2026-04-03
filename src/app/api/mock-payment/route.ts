import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { jsonError, jsonOk, logApiError, parseJsonBody } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

const PATH = '/api/mock-payment';

const MS_MIN = 2000;
const MS_MAX = 3000;

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseFailureRate(): number {
  const raw = process.env.MOCK_PAYMENT_FAILURE_RATE;
  if (!raw) return 0;
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n) || n < 0 || n > 1) return 0;
  return n;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonError('Please sign in to continue.', 401);
    }

    const parsed = await parseJsonBody<{ simulateFailure?: boolean }>(req);
    if (!parsed.ok) return parsed.response;

    const { simulateFailure } = parsed.data;
    const waitMs = MS_MIN + Math.floor(Math.random() * (MS_MAX - MS_MIN + 1));
    await delay(waitMs);

    const isDev = process.env.NODE_ENV === 'development';
    if (simulateFailure && isDev) {
      return jsonOk({
        success: false,
        message: 'Simulated payment failure.',
      });
    }

    const rate = parseFailureRate();
    if (rate > 0 && Math.random() < rate) {
      return jsonOk({
        success: false,
        message: 'Payment could not be completed. Please try again.',
      });
    }

    const paymentId = `mock_${randomUUID()}`;
    return jsonOk({
      success: true,
      paymentId,
      message: 'Payment authorized.',
    });
  } catch (error) {
    logApiError('POST', PATH, 'mock-payment error', error);
    return jsonError('Payment request failed.', 500);
  }
}
