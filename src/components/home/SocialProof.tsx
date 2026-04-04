'use client';

import { motion } from 'framer-motion';
import { CalendarCheck, MapPin, ShieldCheck, Wallet, Headphones, Video } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { PageContainer } from '@/components/layout/PageContainer';

const pillars = [
  { icon: MapPin, label: 'Ghaziabad NCR', sub: 'Crossing Republik studio' },
  { icon: Video, label: siteConfig.equipment[0], sub: 'Multi-cam switching' },
  { icon: CalendarCheck, label: 'Book online', sub: 'Pick date & time' },
  { icon: Wallet, label: 'Secure checkout', sub: 'Demo payment · instant confirm' },
  { icon: Headphones, label: 'Pro audio chain', sub: 'Treated room & mics' },
  { icon: ShieldCheck, label: 'Clear policies', sub: '24h cancellation window' },
];

export default function SocialProof() {
  return (
    <section className="relative overflow-hidden border-y border-zinc-800 bg-[#0a0a0a] py-10 md:py-14">
      <PageContainer>
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 md:mb-8">
          Why creators book with us
        </p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6"
        >
          {pillars.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-2 py-4 text-center transition-all duration-200 hover:border-zinc-700/90 hover:bg-zinc-950/60 sm:px-3"
            >
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-900/50">
                <p.icon className="h-4 w-4 text-zinc-400" />
              </div>
              <p className="font-sans text-xs font-bold leading-tight text-white sm:text-sm">{p.label}</p>
              <p className="mt-1 break-words text-[11px] leading-snug text-white/35 sm:text-xs">{p.sub}</p>
            </motion.div>
          ))}
        </motion.div>
      </PageContainer>
    </section>
  );
}
