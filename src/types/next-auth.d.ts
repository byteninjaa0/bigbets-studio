import 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      isAdmin?: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    isAdmin?: boolean;
    /** Last time id/isAdmin were loaded from DB (ms). Used to throttle Prisma reads in jwt callback. */
    profileRefreshedAt?: number;
  }
}
