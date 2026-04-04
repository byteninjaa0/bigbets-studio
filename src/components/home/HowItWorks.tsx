'use client';
import { motion } from 'framer-motion';
import { Search, Calendar, CreditCard, Mic2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

const steps = [
  { icon: Search, step: '01', title: 'Choose a Package', desc: 'Browse our packages and select one that matches your content goals and budget.', color: 'from-zinc-500 to-zinc-600' },
  { icon: Calendar, step: '02', title: 'Pick Date & Time', desc: 'Select your preferred date and time slot from our real-time availability calendar.', color: 'from-zinc-600 to-zinc-700' },
  { icon: CreditCard, step: '03', title: 'Secure Payment', desc: 'Complete demo checkout — feels like the real thing, no card required.', color: 'from-zinc-700 to-zinc-800' },
  { icon: Mic2, step: '04', title: 'Record & Shine', desc: 'Show up, plug in, and create. We handle the rest. Files delivered in 24h.', color: 'from-zinc-800 to-zinc-900' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-12 md:py-20 animated-bg">
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center md:mb-16"
        >
          <span className="glass-gold text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full inline-block mb-4">
            How It Works
          </span>
          <h2 className="mb-4 font-sans text-3xl font-black text-white sm:text-4xl md:text-5xl">
            Book in{' '}
            <span className="text-gradient-gold italic">4 Simple</span>
            {' '}Steps
          </h2>
          <div className="section-divider mt-6" />
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-zinc-500/30 to-transparent" />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative mb-6 inline-flex">
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-2xl transition-transform duration-200 hover:scale-[1.03]`}
                  >
                    <step.icon className="h-9 w-9 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-500/30 bg-[#111] font-sans text-xs font-black tabular-nums text-zinc-400">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-2 font-sans text-lg font-bold text-white">{step.title}</h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-white/50">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
