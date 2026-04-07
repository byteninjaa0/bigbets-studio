import { Prisma, type PackageType } from '@prisma/client';

/** How many times to retry the confirm transaction on unique / serialization conflicts. */
export const BOOKING_CONFIRM_MAX_ATTEMPTS = 3;

export class SlotUnavailableError extends Error {
  constructor() {
    super('SLOT_UNAVAILABLE');
    this.name = 'SlotUnavailableError';
  }
}

/**
 * PostgreSQL: one in-flight confirm per (date, time) at a time, without relying on a pre-existing Slot row.
 * Lock is released automatically when the transaction ends.
 */
export async function acquireSlotBookingAdvisoryLock(
  tx: Prisma.TransactionClient,
  date: string,
  time: string
): Promise<void> {
  const key = `${date}|${time}`;
  await tx.$executeRawUnsafe(
    'SELECT pg_advisory_xact_lock((abs(hashtext($1::text)))::bigint)',
    key
  );
}

export function isRetryableBookingConfirmError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === 'P2002' || error.code === 'P2034')
  );
}

export type ConfirmBookingTxArgs = {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string | undefined;
  packageId: PackageType;
  packageName: string;
  date: string;
  timeSlot: string;
  quote: {
    amount: number;
    originalAmount: number;
    discountApplied: number;
    didApplyCoupon: boolean;
  };
  couponCode: string | undefined;
  mockPaymentId: string;
};

export async function runConfirmBookingInTransaction(
  tx: Prisma.TransactionClient,
  args: ConfirmBookingTxArgs
): Promise<{ id: string }> {
  const {
    userId,
    userName,
    userEmail,
    userPhone,
    packageId,
    packageName,
    date,
    timeSlot,
    quote,
    couponCode,
    mockPaymentId,
  } = args;

  await acquireSlotBookingAdvisoryLock(tx, date, timeSlot);

  const existing = await tx.slot.findUnique({
    where: { date_time: { date, time: timeSlot } },
  });
  if (existing && (existing.isBooked || existing.isBlocked)) {
    throw new SlotUnavailableError();
  }

  const booking = await tx.booking.create({
    data: {
      userId,
      userName,
      userEmail,
      userPhone: userPhone ?? undefined,
      package: packageId,
      packageName,
      date: new Date(date),
      timeSlot,
      amount: quote.amount,
      originalAmount: quote.originalAmount,
      discountApplied: quote.discountApplied,
      couponCode,
      status: 'confirmed',
      paymentId: mockPaymentId,
      paymentOrderId: `mock_order_${mockPaymentId.replace(/^mock_/, '')}`,
      paymentStatus: 'paid',
    },
  });

  await tx.slot.upsert({
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

  if (quote.didApplyCoupon && couponCode) {
    await tx.coupon.updateMany({
      where: { code: couponCode.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  }

  return booking;
}
