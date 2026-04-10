'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Mic2, Star, Zap, Play, Phone } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { PageContainer } from '@/components/layout/PageContainer';

const statCards = [
  { icon: Mic2, label: 'Ghaziabad', sub: 'Crossing Republik' },
  { icon: Star, label: 'Packages', sub: 'SET A · B · C' },
  { icon: Zap, label: 'Switching', sub: siteConfig.equipment[0] },
] as const;

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16 sm:pt-20 hero-bg grid-pattern">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-2xl bg-zinc-500/5 blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-2xl bg-zinc-600/4 blur-[100px]" />
        <motion.div
          className="absolute right-[5%] top-[15%] w-80 h-80 opacity-[0.07]"
          animate={{ rotate: [0, 5, 0, -5, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 200 300" fill="currentColor" className="text-zinc-400 w-full h-full">
            <rect x="75" y="20" width="50" height="120" rx="25" />
            <path
              d="M40 130 Q40 200 100 200 Q160 200 160 130"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <line x1="100" y1="200" x2="100" y2="250" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
            <line x1="70" y1="250" x2="130" y2="250" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>

      <div className="relative z-10 w-full py-12 sm:py-16 lg:py-24">
        <PageContainer>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,15.5rem)] lg:gap-12">
            <div className="min-w-0 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full glass-gold px-3 py-2 sm:mb-8 sm:gap-3 sm:px-4"
          >
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded h-2 w-2 bg-zinc-400" />
            </span>
            <span className="text-zinc-300/90 text-sm font-medium">Crossing Republik · Ghaziabad</span>
            <span className="text-white/20">•</span>
            <span className="text-white/50 text-xs">Book online</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="heading-hero mb-6"
          >
            <span className="text-white">Book Your</span>
            <br />
            <span className="text-gradient-gold">Podcast Studio</span>
            <br />
            <span className="text-white">in Minutes</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-section-lead mb-8 max-w-2xl"
          >
            Professional podcast and video recording at Panchsheel Wellington. We run a{' '}
            <span className="text-white/90 font-medium">{siteConfig.equipment[0]}</span> switching setup with a 4K
            pipeline, treated room, and editing options. Sessions from{' '}
            <span className="text-zinc-400 font-semibold">₹2,500</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-10 flex flex-wrap gap-2"
          >
            {[`${siteConfig.equipment[0]}`, '4K pipeline', 'Treated room', 'Pro mics', 'Edit packages'].map((feat) => (
              <span
                key={feat}
                className="flex items-center gap-2 text-sm text-white/60 glass border border-white/6 rounded-full px-3 py-2"
              >
                <Zap className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                {feat}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12 flex w-full max-w-md flex-col gap-4 sm:max-w-none sm:flex-row sm:items-center"
          >
            <a href="#packages" className="btn-primary group w-full justify-center focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 sm:w-auto">
              Book Your Session
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
            <a
              href="#how-it-works"
              className="flex items-center gap-3 text-white/60 hover:text-white transition-colors duration-200 group focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <div className="w-11 h-11 rounded-lg border border-white/10 flex items-center justify-center group-hover:border-zinc-500/30 group-hover:bg-zinc-500/5 transition-all duration-200">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <span className="text-sm font-medium">See how it works</span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-md rounded-2xl border border-zinc-800 glass-gold p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-semibold text-white">Talk to the studio</span>
            </div>
            <p className="text-white/55 text-sm mb-3">
              Prefer to confirm a slot or ask about gear before you pay? Call or WhatsApp — we&apos;re on{' '}
              <a href={`tel:+${siteConfig.phoneE164}`} className="text-white font-medium hover:underline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2">
                {siteConfig.phoneDisplay}
              </a>
              .
            </p>
            <Link href="/#contact" className="text-xs font-medium text-zinc-400 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2">
              Full address & map →
            </Link>
          </motion.div>
            </div>

            <div className="hidden min-w-0 flex-col gap-4 lg:flex">
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + i * 0.12 }}
                  className="glass w-full rounded-xl border border-white/8 p-4 transition-all duration-200 hover:scale-[1.02] hover:border-zinc-500/25"
                  style={{ animation: `float ${6 + i}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-500/20 bg-zinc-500/10">
                      <stat.icon className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-tight text-white">{stat.label}</p>
                      <p className="break-words text-xs text-white/40">{stat.sub}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </PageContainer>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-xl border-2 border-white/10 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/20 rounded" />
        </div>
      </motion.div>
    </section>
  );
}
