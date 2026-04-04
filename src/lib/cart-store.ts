'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartLine {
  id: string;
  packageId: string;
  packageName: string;
  price: number;
  date: string;
  timeSlot: string;
  formattedDate: string;
  formattedTime: string;
}

function newLineId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `cart_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function slotKey(p: Pick<CartLine, 'packageId' | 'date' | 'timeSlot'>): string {
  return `${p.packageId}|${p.date}|${p.timeSlot}`;
}

type CartStore = {
  items: CartLine[];
  /** Returns duplicate if same package + date + time already in cart */
  addItem: (payload: Omit<CartLine, 'id'>) => { ok: true; id: string } | { ok: false; reason: 'duplicate' };
  removeItem: (id: string) => void;
  clearCart: () => void;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (payload) => {
        const key = slotKey(payload);
        const taken = new Set(get().items.map((i) => slotKey(i)));
        if (taken.has(key)) {
          return { ok: false as const, reason: 'duplicate' as const };
        }
        const id = newLineId();
        set({ items: [...get().items, { ...payload, id }] });
        return { ok: true as const, id };
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'bigbets-cart',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      migrate: (persisted, fromVersion) => {
        type Legacy = { items?: CartLine[]; item?: Partial<CartLine> & { packageId?: string } };
        const p = (persisted as Legacy | undefined) ?? {};

        if (fromVersion >= 2 && Array.isArray(p.items)) {
          return {
            items: p.items.map((row) => (row.id ? row : { ...row, id: newLineId() })),
          };
        }

        if (Array.isArray(p.items) && p.items.length > 0) {
          return {
            items: p.items.map((row) => (row.id ? row : { ...row, id: newLineId() })),
          };
        }

        const it = p.item;
        if (
          it?.packageId &&
          it?.packageName &&
          typeof it.price === 'number' &&
          it.date &&
          it.timeSlot &&
          it.formattedDate &&
          it.formattedTime
        ) {
          return {
            items: [
              {
                id: newLineId(),
                packageId: it.packageId,
                packageName: it.packageName,
                price: it.price,
                date: it.date,
                timeSlot: it.timeSlot,
                formattedDate: it.formattedDate,
                formattedTime: it.formattedTime,
              },
            ],
          };
        }

        return { items: [] };
      },
    }
  )
);
