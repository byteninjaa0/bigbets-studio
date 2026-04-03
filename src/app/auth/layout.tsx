import type { Metadata } from 'next';
import Link from 'next/link';
import { Mic2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

export const metadata: Metadata = { title: 'Sign In – BigBets Studio' };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen hero-bg grid-pattern flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.06] py-5">
        <PageContainer>
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-400 to-zinc-600 flex items-center justify-center">
            <Mic2 className="w-4 h-4 text-black" />
          </div>
          <span className="font-display font-black text-lg">
            <span className="text-gradient-gold">BigBets</span>
            <span className="text-white/80"> Studio</span>
          </span>
        </Link>
        </PageContainer>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-lg">{children}</div>
      </main>

      <footer className="py-6 text-center">
        <PageContainer>
          <p className="text-xs text-white/20">© {new Date().getFullYear()} BigBets Studio · Ghaziabad</p>
        </PageContainer>
      </footer>
    </div>
  );
}
