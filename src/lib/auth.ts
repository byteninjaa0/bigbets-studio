import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { consumeEmailLoginToken } from './login-token';

const isDev = process.env.NODE_ENV === 'development';

function adminEmailList(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function resolveIsAdmin(email: string | undefined, dbIsAdmin: boolean): boolean {
  if (!email) return dbIsAdmin;
  const norm = email.toLowerCase().trim();
  return Boolean(dbIsAdmin || adminEmailList().includes(norm));
}

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...( { trustHost: true } as any ),

  /** HTTPS (Vercel / production): secure session cookies. Local http:// keeps cookies usable. */
  useSecureCookies: process.env.NEXTAUTH_URL?.startsWith('https://') === true,

  debug: isDev,

  providers: [
    CredentialsProvider({
      id: 'email-otp',
      name: 'email-otp',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otpLoginToken: { label: 'Login token', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const token = credentials?.otpLoginToken?.trim();
        if (!email || !token) return null;

        const consumed = await consumeEmailLoginToken(email, token);
        if (!consumed) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        if (isDev) {
          console.log('[next-auth][email-otp] session issued', { email, isAdmin: user.isAdmin });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image ?? undefined,
          isAdmin: resolveIsAdmin(email, user.isAdmin),
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user?.email) {
        token.email = user.email.toLowerCase().trim();
      }

      const email = typeof token.email === 'string' ? token.email : undefined;
      if (email) {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.isAdmin = resolveIsAdmin(email, dbUser.isAdmin);
        } else {
          token.isAdmin = resolveIsAdmin(email, false);
        }
      }

      if (isDev) {
        console.log('[next-auth][jwt]', { hasUser: !!user, trigger, sub: token.sub, id: token.id });
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string | undefined;
        session.user.isAdmin = Boolean(token.isAdmin);
      }
      if (isDev) {
        console.log('[next-auth][session]', { userId: session.user?.id });
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      try {
        const parsed = new URL(url);
        const base = new URL(baseUrl);
        if (parsed.origin === baseUrl) return url;
        const local =
          (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
          (base.hostname === 'localhost' || base.hostname === '127.0.0.1');
        if (local) {
          return `${base.origin}${parsed.pathname}${parsed.search}`;
        }
      } catch {
        /* ignore */
      }
      return `${baseUrl}/dashboard`;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};
