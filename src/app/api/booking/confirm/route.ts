import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmation } from '@/lib/email';
import { computeBookingQuote } from '@/lib/booking-pricing';
import { PACKAGES, formatTimeSlot } from '@/lib/packages';
import { format } from 'date-fns';
import type { PackageType } from '@prisma/client';
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

    const existingSlot = await prisma.slot.findFirst({
      where: {
        date,
        time: timeSlot,
        OR: [{ isBooked: true }, { isBlocked: true }],
      },
    });
    if (existingSlot) {
      return jsonError('This slot was just booked by someone else. Please choose another.', 409);
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

    const booking = await prisma.booking.create({
      data: {
        userId,
        userName: session.user?.name || 'Customer',
        userEmail: session.user?.email || '',
        userPhone: user?.phone ?? undefined,
        package: packageId as PackageType,
        packageName: pkg.name,
        date: new Date(date),
        timeSlot,
        amount: quote.amount,
        originalAmount: quote.originalAmount,
        discountApplied: quote.discountApplied,
        couponCode: couponCode?.trim() || undefined,
        status: 'confirmed',
        paymentId: mockPaymentId,
        paymentOrderId: `mock_order_${mockPaymentId.replace(/^mock_/, '')}`,
        paymentStatus: 'paid',
      },
    });

    await prisma.slot.upsert({
      where: { date_time: { date, time: timeSlot } },
      create: {
        date,
        time: timeSlot,
        isBooked: true,
        bookingId: booking.id,
      },
      update: {
        isBooked: true,
        bookingId: booking.id,
      },
    });

    if (couponCode?.trim()) {
      await prisma.coupon.updateMany({
        where: { code: String(couponCode).toUpperCase() },
        data: { usedCount: { increment: 1 } },
      });
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
          bookingId: booking.id,
        });
      }
    } catch (emailError) {
      logApiError('POST', PATH, 'Email send failed (booking still saved)', emailError);
    }

    return jsonOk({
      bookingId: booking.id,
      message: 'Booking confirmed!',
    });
  } catch (error) {
    logApiError('POST', PATH, 'Booking confirm error', error);
    return jsonError('Booking confirmation failed. Please contact support.', 500);
  }
}
