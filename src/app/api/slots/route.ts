import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTimeSlots } from '@/lib/packages';
import { jsonError, jsonOk, logApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

const PATH = '/api/slots';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return jsonError('Date is required.', 400);
    }

    const dayOfWeek = new Date(date).getDay();
    const allSlots = generateTimeSlots(dayOfWeek);

    if (allSlots.length === 0) {
      return jsonOk({
        slots: [],
        message: 'Studio is closed on this day.',
        availableCount: 0,
        totalSlots: 0,
      });
    }

    const bookedSlots = await prisma.slot.findMany({ where: { date } });
    const bookedMap = new Map(bookedSlots.map((s) => [s.time, s]));

    const slotsWithStatus = allSlots.map((time) => {
      const slotRecord = bookedMap.get(time);
      return {
        time,
        isBooked: slotRecord?.isBooked || false,
        isBlocked: slotRecord?.isBlocked || false,
        isAvailable: !slotRecord?.isBooked && !slotRecord?.isBlocked,
      };
    });

    const availableCount = slotsWithStatus.filter((s) => s.isAvailable).length;

    return jsonOk({
      slots: slotsWithStatus,
      availableCount,
      totalSlots: allSlots.length,
    });
  } catch (error) {
    logApiError('GET', PATH, 'Slots fetch error', error);
    return jsonError('Failed to fetch slots. Please try again.', 500);
  }
}
