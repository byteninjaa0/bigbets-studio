'use client';

import { motion } from 'framer-motion';
import { Mic2, Video, Volume2, Lightbulb, Headphones, Wifi, Coffee, Clock } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { PageContainer } from '@/components/layout/PageContainer';

const features = [
  { icon: Mic2, title: 'Pro microphones', desc: 'Condenser and dynamic mics tuned for voice and dialogue.', color: 'from-zinc-500/15 to-zinc-600/5' },
  {
    icon: Video,
    title: 'ATEM Mini Pro & 4K',
    desc: `Blackmagic ${siteConfig.equipment[0]} for multi-camera switching plus a 4K capture pipeline for crisp video.`,
    color: 'from-zinc-600/12 to-zinc-700/5',
  },
  { icon: Volume2, title: 'Treated room', desc: 'Acoustic treatment for controlled reflections and cleaner audio.', color: 'from-zinc-400/10 to-zinc-500/5' },
  { icon: Lightbulb, title: 'Studio lighting', desc: 'Key and fill lighting so you look consistent on camera.', color: 'from-zinc-500/18 to-zinc-600/5' },
  { icon: Headphones, title: 'Monitoring', desc: 'Headphones and interface so you hear exactly what we record.', color: 'from-zinc-700/12 to-zinc-800/5' },
  { icon: Clock, title: 'Fast handoff', desc: 'Raw files shared within 24 hours; edited cuts follow per package.', color: 'from-zinc-300/10 to-zinc-500/5' },
  { icon: Wifi, title: 'Reliable connectivity', desc: 'Stable internet for backups, live notes, or light streaming workflows.', color: 'from-zinc-600/15 to-zinc-700/5' },
  { icon: Coffee, title: 'Hospitality', desc: 'Coffee and water on the house during your session.', color: 'from-zinc-500/10 to-zinc-600/5' },
];

export default function Features() {
  return (
    <section className="relative bg-[#0a0a0a] py-12 md:py-20">
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center md:mb-12"
        >
          <span className="glass-gold text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full inline-block mb-4">
            Studio Features
          </span>
          <h2 className="mb-4 font-display text-3xl font-black text-white sm:text-4xl md:text-5xl">
            Everything You Need
            <br />
            <span className="text-gradient-gold italic">In One Place</span>
          </h2>
          <p className="mx-auto max-w-xl text-base text-white/50 sm:text-lg">
            {siteConfig.shortDescription}
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        {/* Equipment — badge row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-14"
        >
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Kit we run</p>
          <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
            {siteConfig.equipmentDetails.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-950/80 px-3.5 py-1.5 text-xs text-zinc-300"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group flex h-full flex-col card-dark p-5 sm:p-6"
            >
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feat.color} transition-transform duration-200 group-hover:scale-[1.06]`}
              >
                <feat.icon className="h-5 w-5 text-white/80" />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-white">{feat.title}</h3>
              <p className="flex-1 text-xs leading-relaxed text-white/40">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
