'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  packageId: string;
  packageName: string;
  price: number;
  date?: string;
  timeSlot?: string;
  formattedDate?: string;
  formattedTime?: string;
}

interface CartStore {
  item: CartItem | null;
  setItem: (item: CartItem) => void;
  updateSlot: (date: string, timeSlot: string, formattedDate: string, formattedTime: string) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      item: null,
      setItem: (item) => set({ item }),
      updateSlot: (date, timeSlot, formattedDate, formattedTime) =>
        set((state) => ({
          item: state.item ? { ...state.item, date, timeSlot, formattedDate, formattedTime } : null,
        })),
      clearCart: () => set({ item: null }),
    }),
    { name: 'bigbets-cart' }
  )
);
