import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, jsonOk, logApiError, parseJsonBody } from '@/lib/api-response';
import { computeDiscountFromCoupon, couponEligibleForPackageAndAmount } from '@/lib/coupon-apply';

export const dynamic = 'force-dynamic';

const PATH = '/api/bookings/coupon';

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseJsonBody<{
      code?: string;
      packageId?: string;
      amount?: number;
    }>(req);
    if (!parsed.ok) return parsed.response;

    const { code, packageId, amount } = parsed.data;
    if (code == null || code === '' || packageId == null || packageId === '' || amount == null) {
      return jsonError('code, packageId, and amount are required.', 400);
    }

    const numAmount = Number(amount);
    if (Number.isNaN(numAmount) || numAmount < 0) {
      return jsonError('Invalid amount.', 400);
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: String(code).toUpperCase(),
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!coupon) {
      return jsonError('Invalid or expired coupon code.', 400);
    }

    const eligible = couponEligibleForPackageAndAmount(coupon, String(packageId), numAmount);
    if (!eligible.ok) {
      return jsonError(eligible.message, 400);
    }

    const discount = computeDiscountFromCoupon(coupon, numAmount);

    const message = `Coupon applied! You save ₹${discount.toLocaleString('en-IN')}`;

    return jsonOk({
      valid: true,
      discount,
      finalAmount: Math.max(0, numAmount - discount),
      message,
    });
  } catch (error) {
    logApiError('POST', PATH, 'Coupon validation error', error);
    return jsonError('Failed to validate coupon. Please try again.', 500);
  }
}
