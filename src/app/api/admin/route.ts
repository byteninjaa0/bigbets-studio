import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, BookingStatus } from '@prisma/client';
import { bookingWithLegacyId } from '@/lib/booking-serialize';
import { jsonError, jsonOk, logApiError, parseJsonBody } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

const PATH = '/api/admin';

function sessionIsAdmin(session: Session) {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) || [];
  const email = session.user?.email;
  return Boolean(session.user?.isAdmin || (email && adminEmails.includes(email)));
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonError('Please sign in to access the admin dashboard.', 401);
    }
    if (!sessionIsAdmin(session)) {
      return jsonError('You do not have permission to access the admin dashboard.', 403);
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'stats';

    if (type === 'stats') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [totalBookings, confirmedBookings, totalUsers, revenueAgg, todayBookings, monthlyRows, packageStats] =
        await Promise.all([
          prisma.booking.count(),
          prisma.booking.count({ where: { status: 'confirmed' } }),
          prisma.user.count(),
          prisma.booking.aggregate({
            where: { paymentStatus: 'paid', status: { not: 'cancelled' } },
            _sum: { amount: true },
          }),
          prisma.booking.count({ where: { createdAt: { gte: today } } }),
          prisma.$queryRaw<
            { month: number; year: number; revenue: unknown; count: number }[]
          >(
            Prisma.sql`
              SELECT
                EXTRACT(MONTH FROM "createdAt")::int AS month,
                EXTRACT(YEAR FROM "createdAt")::int AS year,
                SUM(amount) AS revenue,
                COUNT(*)::int AS count
              FROM "Booking"
              WHERE "paymentStatus" = 'paid' AND "status" <> 'cancelled' AND "createdAt" >= ${sixMonthsAgo}
              GROUP BY EXTRACT(MONTH FROM "createdAt"), EXTRACT(YEAR FROM "createdAt")
              ORDER BY year, month
            `
          ),
          prisma.booking.groupBy({
            by: ['package'],
            where: { paymentStatus: 'paid', status: { not: 'cancelled' } },
            _sum: { amount: true },
            _count: { _all: true },
          }),
        ]);

      const monthlyRevenue = monthlyRows.map((m) => ({
        _id: { month: m.month, year: m.year },
        revenue: Number(m.revenue ?? 0),
        count: m.count,
      }));

      const packageStatsOut = packageStats.map((p) => ({
        _id: p.package,
        revenue: p._sum.amount ?? 0,
        count: p._count._all,
      }));

      return jsonOk({
        totalBookings,
        confirmedBookings,
        totalUsers,
        totalRevenue: revenueAgg._sum.amount ?? 0,
        todayBookings,
        monthlyRevenue,
        packageStats: packageStatsOut,
      });
    }

    if (type === 'bookings') {
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = 20;
      const skip = (page - 1) * limit;

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.booking.count(),
      ]);

      return jsonOk({
        bookings: bookings.map(bookingWithLegacyId),
        total,
        pages: Math.ceil(total / limit),
      });
    }

    return jsonError('Invalid type parameter. Use stats or bookings.', 400);
  } catch (error) {
    logApiError('GET', PATH, 'Admin API error', error);
    return jsonError('We could not load admin data. Please try again.', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonError('Please sign in.', 401);
    }
    if (!sessionIsAdmin(session)) {
      return jsonError('You do not have permission to perform this action.', 403);
    }

    const parsed = await parseJsonBody<{
      date?: string;
      time?: string;
      isBlocked?: boolean;
      reason?: string;
    }>(req);
    if (!parsed.ok) return parsed.response;

    const { date, time, isBlocked, reason } = parsed.data;
    if (!date || !time) {
      return jsonError('Date and time are required.', 400);
    }

    await prisma.slot.upsert({
      where: { date_time: { date, time } },
      create: {
        date,
        time,
        isBlocked: Boolean(isBlocked),
        blockedReason: reason || 'Blocked by admin',
      },
      update: {
        isBlocked: Boolean(isBlocked),
        blockedReason: reason || 'Blocked by admin',
      },
    });

    return jsonOk({ message: 'Slot updated.' });
  } catch (error) {
    logApiError('POST', PATH, 'Failed to update slot', error);
    return jsonError('Failed to update slot. Please try again.', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonError('Please sign in.', 401);
    }
    if (!sessionIsAdmin(session)) {
      return jsonError('You do not have permission to perform this action.', 403);
    }

    const parsed = await parseJsonBody<{ bookingId?: string; status?: string }>(req);
    if (!parsed.ok) return parsed.response;

    const { bookingId, status } = parsed.data;
    if (!bookingId || !status) {
      return jsonError('bookingId and status are required.', 400);
    }

    const allowed: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status as BookingStatus)) {
      return jsonError('Invalid booking status.', 400);
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: status as BookingStatus },
    });
    return jsonOk({ message: 'Booking status updated.' });
  } catch (error) {
    logApiError('PATCH', PATH, 'Failed to update booking', error);
    return jsonError('Failed to update booking. Check the booking id and try again.', 500);
  }
}
