import type { Metadata } from 'next';
import { Abel } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

const abel = Abel({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BigBets Studio – Professional Podcast Recording Studio in Ghaziabad',
  description:
    'Book your podcast recording session in Ghaziabad. Professional 4K setup, soundproof rooms, expert editing. Starting ₹2500. Book online in minutes.',
  keywords: ['podcast studio', 'recording studio', 'Ghaziabad', 'podcast recording', 'professional studio booking'],
  openGraph: {
    title: 'BigBets Studio – Book Your Podcast Session',
    description:
      'Professional podcast recording studio in Crossing Republik, Ghaziabad. 4K cameras, soundproof rooms, editing included.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={abel.variable}>
      <body className="min-h-screen bg-black font-sans text-white antialiased">
        <Providers>
          {children}
          <WhatsAppButton />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                fontFamily: 'var(--font-sans), Abel, ui-sans-serif, sans-serif',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: 'var(--color-primary)', secondary: 'var(--color-bg)' },
              },
              error: {
                iconTheme: { primary: 'var(--color-text-secondary)', secondary: 'var(--color-bg)' },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
