import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PageContainer } from '@/components/layout/PageContainer';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = { title: 'Sign In – BigBets Studio' };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen hero-bg grid-pattern flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.06] py-5">
        <PageContainer>
        <Link
          href="/"
          aria-label={`${siteConfig.name} home`}
          className="group inline-flex items-center gap-2"
        >
          <Image
            src={siteConfig.logoPath}
            alt=""
            width={280}
            height={112}
            className="h-11 w-auto max-h-11 max-w-[12.5rem] object-contain object-left transition-opacity group-hover:opacity-90 sm:h-12 sm:max-h-12 sm:max-w-[17rem] md:h-14 md:max-h-14 md:max-w-[19rem]"
            priority
          />
        </Link>
        </PageContainer>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-lg">{children}</div>
      </main>

      <footer className="py-6 text-center">
        <PageContainer>
          <p className="text-xs text-zinc-500">© {new Date().getFullYear()} BigBets Studio · Ghaziabad</p>
        </PageContainer>
      </footer>
    </div>
  );
}
