import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = { title: 'Book a Session – BigBets Studio' };

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <main className="pb-12 pt-20 sm:pb-16 sm:pt-24">{children}</main>
    </div>
  );
}
