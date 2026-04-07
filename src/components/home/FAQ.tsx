'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { paymentFaqInstallmentsAnswer } from '@/config/payment-mode';

const faqs = [
  {
    q: 'What is included in every package?',
    a: 'Every booking includes professional microphones, a 4K video pipeline, Blackmagic ATEM Mini Pro switching for multi-cam setups, studio lighting, podcast table, acoustically treated room, headphones, and monitoring. SET B and SET C add editing and extra deliverables.',
  },
  {
    q: 'Do you use an ATEM Mini Pro?',
    a: 'Yes. We use a Blackmagic ATEM Mini Pro for live multi-camera switching and recording, so you get a clean program feed and flexibility if you bring more than one camera angle.',
  },
  {
    q: 'How do I receive my recorded files?',
    a: 'Raw files are shared via Google Drive or WeTransfer within 24 hours. Edited files (SET B & C) are delivered within 48–72 hours after the session.',
  },
  {
    q: 'Can I cancel or reschedule my booking?',
    a: 'Yes! Cancellations and reschedules are free if done at least 24 hours before your session. After that, no refunds are issued.',
  },
  {
    q: 'Is parking available at the studio?',
    a: 'Yes, ample parking is available at Panchsheel Wellington complex. The studio is on the 8th floor of Tower 2A.',
  },
  {
    q: 'Do you offer weekend slots?',
    a: 'Yes! We are open Monday–Saturday. Note that weekend slots are slightly higher in price due to high demand. Sunday is closed.',
  },
  {
    q: 'Can I pay in installments or via UPI?',
    a: paymentFaqInstallmentsAnswer(),
  },
  {
    q: 'Do you provide teleprompter or script support?',
    a: 'We have a basic teleprompter available on request. For scripting support, contact us in advance and we can connect you with our content partners.',
  },
  {
    q: 'What happens if there is a technical issue during recording?',
    a: 'In the unlikely event of a technical failure on our end, we will reschedule your session for free or issue a full refund.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative bg-[#0a0a0a] py-12 md:py-20">
      <PageContainer>
        <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center md:mb-14"
        >
          <span className="section-eyebrow">FAQ</span>
          <h2 className="heading-section mb-4">
            Got <span className="text-gradient-gold italic">Questions?</span>
          </h2>
          <p className="text-section-lead text-center">Everything you need to know before booking.</p>
          <div className="section-divider mt-6" />
        </motion.div>

        <div className="space-y-3 pb-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                openIndex === i
                  ? 'border-zinc-500/30 bg-zinc-500/5'
                  : 'border-white/6 bg-white/[0.02] hover:border-white/10'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span
                  className={`pr-2 text-left text-sm font-semibold transition-colors duration-200 sm:text-base ${
                    openIndex === i ? 'text-zinc-400' : 'text-white/80'
                  }`}
                >
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 ml-4 transition-all duration-300 ${
                    openIndex === i ? 'rotate-180 text-zinc-400' : 'text-white/30'
                  }`}
                />
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-400 break-words">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        </div>
      </PageContainer>
    </section>
  );
}
