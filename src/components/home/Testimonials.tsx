'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

const testimonials = [
  {
    initials: 'A.K.',
    name: 'Aditya K.',
    role: 'B2B podcast, Delhi NCR',
    rating: 5,
    text: 'Clean audio, straightforward booking, and the video side looked sharp on our YouTube release. Team was on time and easy to work with.',
    package: 'SET B',
  },
  {
    initials: 'R.M.',
    name: 'Riya M.',
    role: 'Independent creator',
    rating: 5,
    text: 'First time in a proper treated room — huge difference from recording at home. They walked me through levels and made the session relaxed.',
    package: 'SET A',
  },
  {
    initials: 'S.P.',
    name: 'Siddharth P.',
    role: 'Finance commentary',
    rating: 5,
    text: 'We needed a tight turnaround on raw files for our editor. Got the drive link the same evening. Will book again for the next episode.',
    package: 'SET B',
  },
  {
    initials: 'N.V.',
    name: 'Neha V.',
    role: 'Health & wellness channel',
    rating: 5,
    text: 'Lighting and framing were consistent across episodes — important for our brand. Communication on WhatsApp was quick.',
    package: 'SET C',
  },
  {
    initials: 'K.D.',
    name: 'Karan D.',
    role: 'Tech interviews',
    rating: 5,
    text: 'Multi-cam setup with switching saved us time in post. Sound is priority for us; mics and room delivered.',
    package: 'SET B',
  },
  {
    initials: 'P.S.',
    name: 'Pooja S.',
    role: 'Storytelling podcast',
    rating: 5,
    text: 'Ghaziabad location was easy for our guests coming from East Delhi. Parking at the society was hassle-free.',
    package: 'SET A',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden bg-[#0a0a0a] py-12 md:py-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-zinc-500/4 blur-[120px]" />
      </div>

      <PageContainer className="relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center md:mb-16"
        >
          <span className="section-eyebrow">Testimonials</span>
          <h2 className="heading-section mb-4">
            From Recent{' '}
            <span className="text-gradient-gold italic">Sessions</span>
          </h2>
          <p className="text-section-lead mx-auto max-w-xl">
            Paraphrased feedback from guests who recorded at our Crossing Republik studio. Names initials only for privacy.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative flex h-full flex-col card-dark p-6 sm:p-8"
            >
              <Quote className="absolute top-5 right-5 w-8 h-8 text-zinc-500/10 group-hover:text-zinc-500/20 transition-colors duration-300" />

              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-zinc-400 fill-zinc-500" />
                ))}
              </div>

              <p className="mb-6 flex-1 text-sm leading-relaxed text-white/70">{t.text}</p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-500 to-zinc-700 flex items-center justify-center text-black font-black text-xs flex-shrink-0">
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-white/40 text-xs truncate">{t.role}</p>
                </div>
                <div className="text-right">
                  <span className="glass-gold text-zinc-400/80 text-xs px-2 py-0.5 rounded-lg">{t.package}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
