import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { computeBookingQuote } from '@/lib/booking-pricing';
import { getSessionUserId } from '@/lib/session-user';
import { jsonError, jsonOk, logApiError, parseJsonBody } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

const PATH = '/api/booking/quote';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonError('Please sign in to continue.', 401);
    }

    const userId = await getSessionUserId(session);
    if (!userId) {
      logApiError('POST', PATH, 'Could not resolve user id', { email: session.user?.email });
      return jsonError('Your session could not be linked to an account. Please sign in again.', 401);
    }

    const parsed = await parseJsonBody<{
      packageId?: string;
      date?: string;
      couponCode?: string;
    }>(req);
    if (!parsed.ok) return parsed.response;

    const { packageId, date, couponCode } = parsed.data;
    if (!packageId || !date) {
      return jsonError('packageId and date are required.', 400);
    }

    const quote = await computeBookingQuote(packageId, date, couponCode);
    if (!quote) {
      return jsonError('Invalid package selected.', 400);
    }

    return jsonOk({
      amount: quote.amount,
      originalAmount: quote.originalAmount,
      discountApplied: quote.discountApplied,
      currency: 'INR',
    });
  } catch (error) {
    logApiError('POST', PATH, 'Quote error', error);
    return jsonError('Could not calculate price. Please try again.', 500);
  }
}
