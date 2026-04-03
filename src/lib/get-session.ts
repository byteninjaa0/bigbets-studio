import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

/** Use in Server Components, Route Handlers, and server actions. */
export function getSession() {
  return getServerSession(authOptions);
}
