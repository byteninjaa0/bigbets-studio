import type { Session } from 'next-auth';
import { prisma } from './prisma';

/** Resolves app User.id for API routes (JWT may omit id right after OAuth). */
export async function getSessionUserId(session: Session | null): Promise<string | null> {
  if (!session?.user) return null;
  const direct = session.user.id;
  if (direct) return direct;
  const email = session.user.email?.toLowerCase().trim();
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}
