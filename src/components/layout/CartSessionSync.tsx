'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/lib/cart-store';

/**
 * Clears persisted cart when there is no authenticated session.
 * Deferred one tick so zustand/persist can rehydrate before we clear for guests.
 */
export function CartSessionSync() {
  const { status } = useSession();
  const clearCart = useCart((s) => s.clearCart);

  useEffect(() => {
    if (status !== 'unauthenticated') return;
    const id = setTimeout(() => {
      clearCart();
    }, 0);
    return () => clearTimeout(id);
  }, [status, clearCart]);

  return null;
}
