import type { Booking } from '@prisma/client';

/** Keeps API shape compatible with previous Mongo `_id` field. */
export function bookingWithLegacyId<T extends Booking>(b: T) {
  return { ...b, _id: b.id };
}
