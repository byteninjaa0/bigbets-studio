import { NextRequest } from 'next/server';
import { OtpPurpose } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendLoginCodeEmail } from '@/lib/email-login';
import { jsonError, jsonOk, logApiError, parseJsonBody } from '@/lib/api-response';
import { generateNumericOtp, hashOtp, OTP_EXPIRY_MS } from '@/lib/otp-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit-memory';

export const dynamic = 'force-dynamic';

const PATH = '/api/auth/send-otp';

const PURPOSE_LOGIN: OtpPurpose = 'login';

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseJsonBody<{ email?: string }>(req);
    if (!parsed.ok) return parsed.response;

    const emailRaw = parsed.data.email;
    if (!emailRaw || typeof emailRaw !== 'string') {
      return jsonError('Email is required.', 400);
    }

    const emailNorm = emailRaw.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return jsonError('Enter a valid email address.', 400);
    }

    const ip = getClientIp(req.headers);
    const rlEmail = checkRateLimit(`otp-send:email:${emailNorm}`, 5, 15 * 60 * 1000);
    if (!rlEmail.ok) {
      return jsonError(`Too many requests. Try again in ${rlEmail.retryAfterSec ?? 60} seconds.`, 429);
    }
    const rlIp = checkRateLimit(`otp-send:ip:${ip}`, 40, 60 * 60 * 1000);
    if (!rlIp.ok) {
      return jsonError('Too many requests from this network. Try again later.', 429);
    }

    await prisma.otp.updateMany({
      where: { email: emailNorm, purpose: PURPOSE_LOGIN, isUsed: false },
      data: { isUsed: true },
    });

    const plain = generateNumericOtp();
    const otpHash = await hashOtp(plain);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    const otpRow = await prisma.otp.create({
      data: {
        email: emailNorm,
        otpHash,
        purpose: PURPOSE_LOGIN,
        expiresAt,
      },
    });

    try {
      await sendLoginCodeEmail(emailNorm, plain);
    } catch (mailErr) {
      await prisma.otp.delete({ where: { id: otpRow.id } }).catch(() => {});
      logApiError('POST', PATH, 'SMTP send failed', mailErr);
      return jsonError('Could not send email. Check SMTP configuration.', 502);
    }

    return jsonOk({ message: 'OTP sent successfully.' });
  } catch (error) {
    logApiError('POST', PATH, 'send-otp error', error);
    return jsonError('Something went wrong. Please try again.', 500);
  }
}
