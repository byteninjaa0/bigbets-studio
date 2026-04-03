import { prisma } from '@/lib/prisma';
import { getPackagePrice, PACKAGES } from '@/lib/packages';

export type BookingQuote = {
  amount: number;
  originalAmount: number;
  discountApplied: number;
  packageName: string;
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

  if (couponCode?.trim()) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: String(couponCode).toUpperCase(),
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (coupon && coupon.usedCount < coupon.maxUses && amount >= coupon.minAmount) {
      if (coupon.discountType === 'percentage') {
        discountApplied = Math.round((amount * coupon.discountValue) / 100);
      } else {
        discountApplied = coupon.discountValue;
      }
      amount = Math.max(0, amount - discountApplied);
    }
  }

  return {
    amount,
    originalAmount,
    discountApplied,
    packageName: pkg.name,
  };
}
