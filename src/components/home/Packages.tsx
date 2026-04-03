'use client';
import { motion } from 'framer-motion';
import { Check, Zap, ArrowRight, ShoppingCart } from 'lucide-react';
import { PACKAGES } from '@/lib/packages';
import { useCart } from '@/lib/cart-store';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { PageContainer } from '@/components/layout/PageContainer';

const packageOrder = ['SET_A', 'SET_B', 'SET_C'];

export default function Packages() {
  const { setItem } = useCart();
  const router = useRouter();
  const { data: session } = useSession();

  const handleBookNow = (pkgId: string) => {
    const pkg = PACKAGES[pkgId as keyof typeof PACKAGES];
    setItem({
      packageId: pkgId,
      packageName: pkg.name,
      price: pkg.price,
    });
    if (!session) {
      toast('Please sign in to continue booking', { icon: '🔐' });
      router.push('/auth/signin?callbackUrl=/booking');
      return;
    }
    router.push('/booking');
  };

  const handleAddToCart = (pkgId: string) => {
    const pkg = PACKAGES[pkgId as keyof typeof PACKAGES];
    setItem({ packageId: pkgId, packageName: pkg.name, price: pkg.price });
    toast.success(`${pkg.name} added to cart!`);
  };

  return (
    <section id="packages" className="relative py-12 md:py-20 animated-bg">
      <PageContainer>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center md:mb-16"
        >
          <span className="glass-gold text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full inline-block mb-4">
            Our Packages
          </span>
          <h2 className="mb-5 font-display text-3xl font-black text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Choose Your{' '}
            <span className="text-gradient-gold italic">Perfect</span>
            <br />Studio Package
          </h2>
          <p className="mx-auto max-w-xl text-base text-white/50 sm:text-lg">
            Every tier includes pro mics, treated room, lighting, and our ATEM Mini Pro multi-cam pipeline. Add editing where you need it.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        {/* Cards */}
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
                {/* Top accent bar */}
                <div
                  className={`h-1 rounded-t-3xl ${
                    isPopular
                      ? 'bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-300'
                      : isPremium
                      ? 'bg-gradient-to-r from-zinc-700 to-zinc-500'
                      : 'bg-gradient-to-r from-zinc-700 to-zinc-500'
                  }`}
                />

                <div className="flex flex-1 flex-col p-6 sm:p-7 md:p-8">
                  {/* Badge + Name */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      {pkg.badge && (
                        <span className={`inline-block mb-2 text-xs font-bold tracking-wider px-3 py-1 rounded-full ${
                          isPopular ? 'badge-popular' : isPremium ? 'badge-premium' : 'badge-fire'
                        }`}>
                          {pkg.badge}
                        </span>
                      )}
                      <h3 className="font-display font-black text-2xl text-white">{pkg.name}</h3>
                      <p className="text-white/40 text-sm mt-0.5">{pkg.tagline}</p>
                    </div>
                    {isPopular && (
                      <div className="w-10 h-10 rounded-xl bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-zinc-400" />
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black font-display text-gradient-gold">
                        ₹{pkg.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-white/30 text-sm">/session</span>
                    </div>
                    <p className="text-white/40 text-xs mt-1.5 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-500/60" />
                      Weekends from ₹{pkg.weekendPrice.toLocaleString('en-IN')}
                    </p>
                    <p className="text-white/50 text-sm mt-1">{pkg.duration}</p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/6 mb-6" />

                  {/* Features */}
                  <ul className="space-y-3 flex-1 mb-8">
                    {pkg.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          isPopular ? 'bg-zinc-500/20 text-zinc-400' : 'bg-white/6 text-white/40'
                        }`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-white/70 leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Deliverables */}
                  <div className="glass rounded-xl p-3 mb-6">
                    <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">You'll receive:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.deliverables.map((d) => (
                        <span key={d} className="text-xs glass-gold text-zinc-400/80 px-2 py-0.5 rounded-md border border-zinc-500/10">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
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
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(pkgId)}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/6 px-6 py-3 text-sm font-medium text-white/40 transition-all duration-200 hover:border-white/12 hover:text-white/70"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center text-sm text-white/30 md:mt-10"
        >
          All prices in INR. GST as applicable. Weekend pricing applies Sat & Sun.
          Cancellations accepted 24h before session.
        </motion.p>
      </PageContainer>
    </section>
  );
}
