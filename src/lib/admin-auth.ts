import type { Session } from 'next-auth';

function adminEmailList(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** True if the session may access admin-only APIs (JWT flag or ADMIN_EMAILS allowlist). */
export function sessionIsAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  if (session.user.isAdmin) return true;
  const email = session.user.email?.toLowerCase().trim();
  if (!email) return false;
  return adminEmailList().includes(email);
}
