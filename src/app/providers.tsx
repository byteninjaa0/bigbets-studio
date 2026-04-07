'use client';
import { SessionProvider } from 'next-auth/react';
import { CartSessionSync } from '@/components/layout/CartSessionSync';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus>
      <CartSessionSync />
      {children}
    </SessionProvider>
  );
}
