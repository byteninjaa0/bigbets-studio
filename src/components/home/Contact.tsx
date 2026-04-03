'use client';

import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, MessageCircle, Clock } from 'lucide-react';
import { getWhatsAppE164, siteConfig } from '@/config/site';
import { PageContainer } from '@/components/layout/PageContainer';

const waMsg = encodeURIComponent(
  'Hi BigBets Studio — I’d like to ask about booking a podcast session in Ghaziabad.'
);

export default function Contact() {
  const waUrl = `https://wa.me/${getWhatsAppE164()}?text=${waMsg}`;

  const contactRows = [
    {
      icon: MapPin,
      label: 'Studio address',
      value: siteConfig.address.full,
      href: siteConfig.address.mapsSearchUrl,
      external: true,
    },
    {
      icon: Mail,
      label: 'Email',
      value: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
      external: false,
    },
    {
      icon: Phone,
      label: 'Phone',
      value: siteConfig.phoneDisplay,
      href: `tel:+${siteConfig.phoneE164}`,
      external: false,
    },
    {
      icon: Clock,
      label: 'Studio hours',
      value: 'Mon–Fri: 9 AM – 7 PM  |  Sat: 9 AM – 5 PM  |  Sun: Closed',
      href: null as string | null,
      external: false,
    },
  ];

  return (
    <section id="contact" className="relative py-12 md:py-20 animated-bg">
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center md:mb-16"
        >
          <span className="glass-gold text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full inline-block mb-4">
            Get In Touch
          </span>
          <h2 className="mb-4 font-display text-3xl font-black text-white sm:text-4xl md:text-5xl">
            Find Us &{' '}
            <span className="text-gradient-gold italic">Say Hello</span>
          </h2>
          <p className="text-white/45 text-sm max-w-lg mx-auto">
            Call, email, or WhatsApp — we&apos;ll help you pick a package and a time slot.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {contactRows.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-4 card-dark p-5 sm:p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center flex-shrink-0">
                  <row.icon className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">{row.label}</p>
                  {row.href ? (
                    <a
                      href={row.href}
                      {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="text-white/85 text-sm hover:text-white transition-colors duration-200 break-words"
                    >
                      {row.value}
                    </a>
                  ) : (
                    <p className="text-white/85 text-sm">{row.value}</p>
                  )}
                </div>
              </motion.div>
            ))}

            <motion.a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-700 bg-zinc-950/50 hover:bg-zinc-900 hover:border-zinc-600 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Chat on WhatsApp</p>
                <p className="text-white/40 text-xs">Same number as call — {siteConfig.phoneDisplay}</p>
              </div>
              <div className="ml-auto text-zinc-600 group-hover:text-white transition-colors duration-200">→</div>
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex min-h-[300px] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 sm:min-h-[380px] lg:min-h-[420px]"
          >
            <iframe
              src={siteConfig.address.mapsEmbedUrl}
              title="BigBets Studio — Panchsheel Wellington, Crossing Republik, Ghaziabad"
              className="map-iframe-dark min-h-[300px] w-full flex-1 border-0 sm:min-h-[380px] lg:min-h-[420px]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </PageContainer>
    </section>
  );
}
