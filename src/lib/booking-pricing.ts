import { prisma } from '@/lib/prisma';
import { getPackagePrice, PACKAGES } from '@/lib/packages';
import { computeDiscountFromCoupon, couponEligibleForPackageAndAmount } from '@/lib/coupon-apply';

export type BookingQuote = {
  amount: number;
  originalAmount: number;
  discountApplied: number;
  packageName: string;
  /** True when a valid coupon row was applied (used for incrementing usedCount on confirm). */
  didApplyCoupon: boolean;
};

export async function computeBookingQuote(
  packageId: string,
  date: string,
  couponCode?: string
): Promise<BookingQuote | null> {
  const pkg = PACKAGES[packageId as keyof typeof PACKAGES];
  if (!pkg) return null;

  const originalAmount = getPackagePrice(packageId, new Date(date));
  let amount = originalAmount;
  let discountApplied = 0;
  let didApplyCoupon = false;

  if (couponCode?.trim()) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: String(couponCode).toUpperCase(),
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (coupon) {
      const eligible = couponEligibleForPackageAndAmount(coupon, packageId, originalAmount);
      if (eligible.ok) {
        discountApplied = computeDiscountFromCoupon(coupon, originalAmount);
        amount = Math.max(0, originalAmount - discountApplied);
        didApplyCoupon = true;
      }
    }
  }

  return {
    amount,
    originalAmount,
    discountApplied,
    packageName: pkg.name,
    didApplyCoupon,
  };
}
