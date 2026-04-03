import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, jsonOk, logApiError, parseJsonBody } from '@/lib/api-response';

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

    if (!coupon || coupon.usedCount >= coupon.maxUses) {
      return jsonError('Invalid or expired coupon code.', 400);
    }

    if (coupon.applicablePackages.length > 0 && !coupon.applicablePackages.includes(String(packageId))) {
      return jsonError('This coupon is not applicable for the selected package.', 400);
    }

    if (numAmount < coupon.minAmount) {
      return jsonError(`Minimum order amount ₹${coupon.minAmount} required.`, 400);
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((numAmount * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountValue;
    }

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
