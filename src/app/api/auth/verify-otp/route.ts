import { NextRequest } from 'next/server';
import { OtpPurpose } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { jsonError, jsonOk, logApiError, parseJsonBody } from '@/lib/api-response';
import { OTP_MAX_ATTEMPTS, verifyOtpHash } from '@/lib/otp-auth';
import { createEmailLoginToken } from '@/lib/login-token';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit-memory';

export const dynamic = 'force-dynamic';

const PATH = '/api/auth/verify-otp';

const PURPOSE_LOGIN: OtpPurpose = 'login';

function adminEmailList(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function displayNameFromEmail(email: string, provided?: string): string {
  const t = provided?.trim();
  if (t) return t.slice(0, 120);
  const local = email.split('@')[0] || 'Guest';
  return local.slice(0, 80) || 'Guest';
}

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseJsonBody<{ email?: string; otp?: string; name?: string }>(req);
    if (!parsed.ok) return parsed.response;

    const { email: emailRaw, otp: otpRaw, name } = parsed.data;
    if (!emailRaw || !otpRaw) {
      return jsonError('Email and OTP are required.', 400);
    }

    const emailNorm = String(emailRaw).toLowerCase().trim();
    const otp = String(otpRaw).replace(/\D/g, '');
    if (otp.length !== 6) {
      return jsonError('Enter the 6-digit code.', 400);
    }

    const ip = getClientIp(req.headers);
    const rl = checkRateLimit(`otp-verify:ip:${ip}`, 30, 15 * 60 * 1000);
    if (!rl.ok) {
      return jsonError('Too many verification attempts. Try again later.', 429);
    }

    const otpRecord = await prisma.otp.findFirst({
      where: {
        email: emailNorm,
        purpose: PURPOSE_LOGIN,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return jsonError('Invalid or expired OTP.', 400);
    }

    const attempts = otpRecord.attempts + 1;

    if (attempts > OTP_MAX_ATTEMPTS) {
      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: { attempts, isUsed: true },
      });
      return jsonError('Too many failed attempts. Request a new code.', 400);
    }

    const match = await verifyOtpHash(otp, otpRecord.otpHash);
    if (!match) {
      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: { attempts },
      });
      const left = OTP_MAX_ATTEMPTS - attempts;
      return jsonError(`Invalid or expired OTP.${left > 0 ? ` ${left} attempt(s) left.` : ''}`, 400);
    }

    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true, attempts },
    });

    let user = await prisma.user.findUnique({ where: { email: emailNorm } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const grantAdmin = adminEmailList().includes(emailNorm);
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      user = await prisma.user.create({
        data: {
          email: emailNorm,
          name: displayNameFromEmail(emailNorm, name),
          authProvider: 'credentials',
          isEmailVerified: true,
          isAdmin: grantAdmin,
          referralCode,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          ...(name?.trim() ? { name: name.trim().slice(0, 120) } : {}),
        },
      });
      user = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    }

    const loginToken = await createEmailLoginToken(emailNorm);

    console.log('[api] POST /api/auth/verify-otp — success', { isNewUser });

    return jsonOk({
      message: 'Signed in successfully.',
      loginToken,
      isNewUser,
    });
  } catch (error) {
    logApiError('POST', PATH, 'verify-otp error', error);
    return jsonError('Verification failed. Please try again.', 500);
  }
}
