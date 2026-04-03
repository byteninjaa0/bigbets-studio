import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bookingWithLegacyId } from '@/lib/booking-serialize';
import { getSessionUserId } from '@/lib/session-user';
import { jsonError, jsonOk, logApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

const ADMIN_ALL_CAP = 500;

function sessionIsAdmin(session: Session) {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) || [];
  const email = session.user?.email;
  return Boolean(session.user?.isAdmin || (email && adminEmails.includes(email)));
}

export async function GET(req: NextRequest) {
  const path = '/api/bookings';
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonError('Please sign in to view your bookings.', 401);
    }

    const { searchParams } = new URL(req.url);
    const wantAll =
      searchParams.get('all') === 'true' ||
      searchParams.get('scope') === 'all';

    if (wantAll) {
      if (!sessionIsAdmin(session)) {
        return jsonError('You do not have permission to view all bookings.', 403);
      }

      const bookings = await prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: ADMIN_ALL_CAP,
      });

      return jsonOk({ bookings: bookings.map(bookingWithLegacyId) });
    }

    const userId = await getSessionUserId(session);
    if (!userId) {
      logApiError('GET', path, 'Missing user id for session', { email: session.user?.email });
      return jsonError('Your profile could not be loaded. Try signing out and signing in again.', 401);
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return jsonOk({ bookings: bookings.map(bookingWithLegacyId) });
  } catch (error) {
    logApiError('GET', path, 'Prisma or server error', error);
    return jsonError('We could not load bookings right now. Please try again in a moment.', 500);
  }
}

export async function DELETE(req: NextRequest) {
  const path = '/api/bookings';
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonError('Please sign in.', 401);
    }

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('id');
    if (!bookingId) {
      return jsonError('Booking id is required.', 400);
    }

    const userId = await getSessionUserId(session);
    if (!userId) {
      logApiError('DELETE', path, 'Missing user id', { email: session.user?.email });
      return jsonError('Your profile could not be loaded. Try signing in again.', 401);
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId },
    });
    if (!booking) {
      return jsonError('Booking not found.', 404);
    }

    const bookingDate = new Date(booking.date);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 24) {
      return jsonError('Cancellations must be made at least 24 hours before the session.', 400);
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'cancelled' },
    });

    const dateStr = booking.date.toISOString().split('T')[0];
    await prisma.slot.updateMany({
      where: { date: dateStr, time: booking.timeSlot },
      data: { isBooked: false, bookingId: null },
    });

    return jsonOk({ message: 'Booking cancelled.' });
  } catch (error) {
    logApiError('DELETE', path, 'Unexpected error', error);
    return jsonError('Could not cancel this booking. Please try again.', 500);
  }
}
