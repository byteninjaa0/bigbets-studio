'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, ArrowRight, ShoppingCart } from 'lucide-react';
import { PACKAGES } from '@/lib/packages';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { PageContainer } from '@/components/layout/PageContainer';
import { AddPackageToCartModal } from '@/components/booking/AddPackageToCartModal';

const packageOrder = ['SET_A', 'SET_B', 'SET_C'];

export default function Packages() {
  const router = useRouter();
  const { data: session } = useSession();
  const [modalPkgId, setModalPkgId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'book' | 'cart'>('cart');

  const requireAuth = () => {
    if (!session) {
      toast('Please sign in to continue', { icon: '🔐' });
      router.push('/auth/signin?callbackUrl=/booking');
      return false;
    }
    return true;
  };

  const handleBookNow = (pkgId: string) => {
    if (!requireAuth()) return;
    setModalMode('book');
    setModalPkgId(pkgId);
  };

  const handleAddToCart = (pkgId: string) => {
    if (!requireAuth()) return;
    setModalMode('cart');
    setModalPkgId(pkgId);
  };

  return (
    <section id="packages" className="relative py-12 md:py-20 animated-bg">
      <AddPackageToCartModal
        packageId={modalPkgId}
        open={Boolean(modalPkgId)}
        onOpenChange={(o) => !o && setModalPkgId(null)}
        onAdded={() => {
          setModalPkgId(null);
          if (modalMode === 'book') {
            router.push('/booking');
          }
        }}
      />

      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center md:mb-16"
        >
          <span className="glass-gold mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-zinc-400">
            Our Packages
          </span>
          <h2 className="mb-5 font-sans text-3xl font-black text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Choose Your{' '}
            <span className="text-gradient-gold italic">Perfect</span>
            <br />
            Studio Package
          </h2>
          <p className="mx-auto max-w-xl text-base text-white/50 sm:text-lg">
            Every tier includes pro mics, treated room, lighting, and our ATEM Mini Pro multi-cam pipeline. Add editing where you need it.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6 lg:gap-8">
          {packageOrder.map((pkgId, i) => {
            const pkg = PACKAGES[pkgId as keyof typeof PACKAGES];
            const isPopular = pkgId === 'SET_B';
            const isPremium = pkgId === 'SET_C';

            return (
              <motion.div
                key={pkgId}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className={`card-package flex h-full flex-col ${isPopular ? 'popular md:-mt-2 md:mb-2 lg:-mt-4 lg:mb-4' : ''}`}
              >
                <div
                  className={`h-1 rounded-t-3xl ${
                    isPopular
                      ? 'bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-300'
                      : 'bg-gradient-to-r from-zinc-700 to-zinc-500'
                  }`}
                />

                <div className="flex flex-1 flex-col p-6 sm:p-7 md:p-8">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      {pkg.badge && (
                        <span
                          className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider ${
                            isPopular ? 'badge-popular' : isPremium ? 'badge-premium' : 'badge-fire'
                          }`}
                        >
                          {pkg.badge}
                        </span>
                      )}
                      <h3 className="font-sans text-2xl font-black text-white">{pkg.name}</h3>
                      <p className="mt-0.5 text-sm text-white/40">{pkg.tagline}</p>
                    </div>
                    {isPopular && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-500/20 bg-zinc-500/10">
                        <Zap className="h-5 w-5 text-zinc-400" />
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="font-sans text-4xl font-black text-gradient-gold">₹{pkg.price.toLocaleString('en-IN')}</span>
                      <span className="text-sm text-white/30">/session</span>
                    </div>
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-white/40">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-500/60" />
                      Weekends from ₹{pkg.weekendPrice.toLocaleString('en-IN')}
                    </p>
                    <p className="mt-1 text-sm text-white/50">{pkg.duration}</p>
                  </div>

                  <div className="mb-6 h-px bg-white/6" />

                  <ul className="mb-8 flex-1 space-y-3">
                    {pkg.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                            isPopular ? 'bg-zinc-500/20 text-zinc-400' : 'bg-white/6 text-white/40'
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm leading-snug text-white/70">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="glass mb-6 rounded-xl p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">You&apos;ll receive:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.deliverables.map((d) => (
                        <span
                          key={d}
                          className="glass-gold rounded-md border border-zinc-500/10 px-2 py-0.5 text-xs text-zinc-400/80"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleBookNow(pkgId)}
                      className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 sm:min-h-12 ${
                        isPopular
                          ? 'btn-primary'
                          : 'border border-zinc-500/30 text-zinc-400 hover:scale-[1.02] hover:border-zinc-500/50 hover:bg-zinc-500/10 active:scale-[0.98]'
                      }`}
                    >
                      Book Now
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(pkgId)}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/6 px-6 py-3 text-sm font-medium text-white/40 transition-all duration-200 hover:border-white/12 hover:text-white/70"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center text-sm text-white/30 md:mt-10"
        >
          All prices in INR. GST as applicable. Weekend pricing applies Sat & Sun. Cancellations accepted 24h before session.
        </motion.p>
      </PageContainer>
    </section>
  );
}
