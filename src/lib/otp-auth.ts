import bcrypt from 'bcryptjs';

const OTP_SALT_ROUNDS = 10;

export function generateNumericOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashOtp(plain: string): Promise<string> {
  return bcrypt.hash(plain, OTP_SALT_ROUNDS);
}

export async function verifyOtpHash(plain: string, hash: string): Promise<boolean> {
  if (!plain || !hash) return false;
  return bcrypt.compare(plain, hash);
}

export const OTP_EXPIRY_MS = 5 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
