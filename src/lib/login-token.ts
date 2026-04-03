import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';

const TOKEN_BYTES = 32;
const LOGIN_TOKEN_TTL_MS = 2 * 60 * 1000;

function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

/**
 * Creates a one-time login token after OTP success. Returns plaintext once for the client;
 * only SHA-256 hash is stored.
 */
export async function createEmailLoginToken(emailNorm: string): Promise<string> {
  const plain = randomBytes(TOKEN_BYTES).toString('base64url');
  const tokenHash = sha256Hex(plain);
  const expiresAt = new Date(Date.now() + LOGIN_TOKEN_TTL_MS);

  await prisma.emailLoginToken.create({
    data: {
      email: emailNorm,
      tokenHash,
      expiresAt,
    },
  });

  return plain;
}

/**
 * Validates token, marks row used, returns true if session should be issued.
 */
export async function consumeEmailLoginToken(emailNorm: string, plainToken: string): Promise<boolean> {
  if (!plainToken || plainToken.length < 20) return false;

  const tokenHash = sha256Hex(plainToken);
  const now = new Date();

  const row = await prisma.emailLoginToken.findFirst({
    where: {
      email: emailNorm,
      tokenHash,
      used: false,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!row) return false;

  const a = Buffer.from(row.tokenHash, 'utf8');
  const b = Buffer.from(tokenHash, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  await prisma.emailLoginToken.update({
    where: { id: row.id },
    data: { used: true },
  });

  return true;
}
