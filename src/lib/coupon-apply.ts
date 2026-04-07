import type { Coupon } from '@prisma/client';

export function computeDiscountFromCoupon(coupon: Coupon, baseAmount: number): number {
  if (coupon.discountType === 'percentage') {
    return Math.round((baseAmount * coupon.discountValue) / 100);
  }
  return coupon.discountValue;
}

/** Same rules as POST /api/bookings/coupon — keep pricing and validation aligned. */
export function couponEligibleForPackageAndAmount(
  coupon: Coupon,
  packageId: string,
  baseAmount: number
): { ok: true } | { ok: false; message: string } {
  if (coupon.usedCount >= coupon.maxUses) {
    return { ok: false, message: 'Invalid or expired coupon code.' };
  }
  if (coupon.applicablePackages.length > 0 && !coupon.applicablePackages.includes(String(packageId))) {
    return { ok: false, message: 'This coupon is not applicable for the selected package.' };
  }
  if (baseAmount < coupon.minAmount) {
    return { ok: false, message: `Minimum order amount ₹${coupon.minAmount} required.` };
  }
  return { ok: true };
}
