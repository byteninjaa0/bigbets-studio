import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma, type PackageType } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmation } from '@/lib/email';
import { computeBookingQuote } from '@/lib/booking-pricing';
import {
  BOOKING_CONFIRM_MAX_ATTEMPTS,
  isRetryableBookingConfirmError,
  runConfirmBookingInTransaction,
  SlotUnavailableError,
} from '@/lib/booking-confirm-slot';
import { PACKAGES, formatTimeSlot } from '@/lib/packages';
import { format } from 'date-fns';
import { getSessionUserId } from '@/lib/session-user';
import { jsonError, jsonOk, logApiError, parseJsonBody } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

const PATH = '/api/booking/confirm';

const MOCK_PAYMENT_ID = /^mock_[0-9a-f-]{36}$/i;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonError('Please sign in to complete your booking.', 401);
    }

    const parsed = await parseJsonBody<{
      mockPaymentId?: string;
      packageId?: string;
      date?: string;
      timeSlot?: string;
      couponCode?: string;
    }>(req);
    if (!parsed.ok) return parsed.response;

    const { mockPaymentId, packageId, date, timeSlot, couponCode } = parsed.data;

    if (!mockPaymentId || !MOCK_PAYMENT_ID.test(mockPaymentId)) {
      return jsonError('Invalid payment reference.', 400);
    }
    if (!packageId || !date || !timeSlot) {
      return jsonError('Missing booking fields.', 400);
    }

    const quote = await computeBookingQuote(packageId, date, couponCode);
    if (!quote) {
      return jsonError('Invalid package.', 400);
    }

    const pkg = PACKAGES[packageId as keyof typeof PACKAGES];
    if (!pkg) {
      return jsonError('Invalid package.', 400);
    }

    const userId = await getSessionUserId(session);
    if (!userId) {
      logApiError('POST', PATH, 'Could not resolve user id', { email: session.user?.email });
      return jsonError('Your session could not be linked to an account. Please sign in again.', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    let bookingIdOut: string | undefined;

    for (let attempt = 0; attempt < BOOKING_CONFIRM_MAX_ATTEMPTS; attempt++) {
      try {
        const booking = await prisma.$transaction(
          (tx) =>
            runConfirmBookingInTransaction(tx, {
              userId,
              userName: session.user?.name || 'Customer',
              userEmail: session.user?.email || '',
              userPhone: user?.phone ?? undefined,
              packageId: packageId as PackageType,
              packageName: pkg.name,
              date,
              timeSlot,
              quote: {
                amount: quote.amount,
                originalAmount: quote.originalAmount,
                discountApplied: quote.discountApplied,
                didApplyCoupon: quote.didApplyCoupon,
              },
              couponCode: couponCode?.trim() || undefined,
              mockPaymentId,
            }),
          { maxWait: 5000, timeout: 10000 }
        );
        bookingIdOut = booking.id;
        break;
      } catch (error) {
        if (error instanceof SlotUnavailableError) {
          return jsonError('This slot was just booked by someone else. Please choose another.', 409);
        }
        const retry =
          isRetryableBookingConfirmError(error) && attempt < BOOKING_CONFIRM_MAX_ATTEMPTS - 1;
        if (retry) {
          await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
          continue;
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
          return jsonError('Could not confirm this slot right now. Please try again.', 409);
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          return jsonError('This slot was just booked by someone else. Please choose another.', 409);
        }
        throw error;
      }
    }

    if (!bookingIdOut) {
      return jsonError('Could not confirm this slot right now. Please try again.', 409);
    }

    try {
      const email = session.user?.email;
      if (email) {
        await sendBookingConfirmation({
          userName: session.user?.name || 'Valued Customer',
          userEmail: email,
          packageName: pkg.name,
          date: format(new Date(date), 'EEEE, MMMM d, yyyy'),
          timeSlot: formatTimeSlot(timeSlot),
          amount: quote.amount,
          bookingId: bookingIdOut,
        });
      }
    } catch (emailError) {
      logApiError('POST', PATH, 'Email send failed (booking still saved)', emailError);
    }

    return jsonOk({
      bookingId: bookingIdOut,
      message: 'Booking confirmed!',
    });
  } catch (error) {
    logApiError('POST', PATH, 'Booking confirm error', error);
    return jsonError('Booking confirmation failed. Please contact support.', 500);
  }
}
