'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-store';
import { PACKAGES, getPackagePrice } from '@/lib/packages';
import {
  Calendar,
  Clock,
  Package,
  CreditCard,
  Tag,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Info,
  ArrowLeft,
  Trash2,
  Plus,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import { apiMessage } from '@/lib/api-message';
import { MockPaymentModal } from '@/components/booking/MockPaymentModal';
import { AddPackageToCartModal } from '@/components/booking/AddPackageToCartModal';
import { PageContainer } from '@/components/layout/PageContainer';
import { FieldInput } from '@/components/ui/field-input';
import { scrollIntoViewSmooth } from '@/lib/scroll-into-view-smooth';

type Step = 'cart' | 'package' | 'checkout' | 'success';

export default function BookingPage() {
  const { status } = useSession();
  const router = useRouter();
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);

  const [step, setStep] = useState<Step>('package');
  const [checkoutLineId, setCheckoutLineId] = useState<string | null>(null);
  const [addModalPackageId, setAddModalPackageId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<{ discount: number; message: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [successMeta, setSuccessMeta] = useState<{ moreInCart: number } | null>(null);

  const cartRef = useRef<HTMLDivElement>(null);
  const checkoutStepRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef<Step | null>(null);

  const activeLine = checkoutLineId ? items.find((i) => i.id === checkoutLineId) : undefined;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin?callbackUrl=/booking');
  }, [status, router]);

  useEffect(() => {
    return useCart.persist.onFinishHydration(() => {
      if (useCart.getState().items.length > 0) {
        setStep((s) => (s === 'package' ? 'cart' : s));
      }
    });
  }, []);

  useEffect(() => {
    if (items.length === 0 && step === 'cart') {
      setStep('package');
    }
  }, [items.length, step]);

  useEffect(() => {
    if (step === 'checkout' && checkoutLineId && !items.some((i) => i.id === checkoutLineId)) {
      setCheckoutLineId(null);
      setCouponCode('');
      setCouponResult(null);
      setStep(items.length > 0 ? 'cart' : 'package');
    }
  }, [items, step, checkoutLineId]);

  useEffect(() => {
    const prev = prevStepRef.current;
    prevStepRef.current = step;
    if (prev === null) return;
    if (prev === 'cart' && step === 'checkout') {
      scrollIntoViewSmooth(checkoutStepRef.current, { delayMs: 220, block: 'start' });
    }
    if (prev !== 'success' && step === 'success') {
      scrollIntoViewSmooth(successRef.current, { delayMs: 260, block: 'start' });
    }
  }, [step]);

  const startCheckout = (lineId: string) => {
    setCheckoutLineId(lineId);
    setCouponCode('');
    setCouponResult(null);
    setStep('checkout');
  };

  const goBack = () => {
    if (step === 'checkout') {
      setCheckoutLineId(null);
      setCouponCode('');
      setCouponResult(null);
      setStep(items.length > 0 ? 'cart' : 'package');
      return;
    }
    if (step === 'cart') {
      setStep('package');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim() || !activeLine) return;
    setCouponLoading(true);
    try {
      const price = getPackagePrice(activeLine.packageId, new Date(activeLine.date));
      const { data } = await axios.post('/api/bookings/coupon', {
        code: couponCode,
        packageId: activeLine.packageId,
        amount: price,
      });
      if (data?.success === false) {
        toast.error(apiMessage(data, 'Invalid coupon.'));
        setCouponResult(null);
        return;
      }
      setCouponResult({ discount: data.discount, message: data.message });
      toast.success(typeof data.message === 'string' ? data.message : 'Coupon applied.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(apiMessage(err.response?.data, 'Invalid coupon.'));
      } else {
        toast.error('Invalid coupon.');
      }
      setCouponResult(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePaymentComplete = (id: string) => {
    if (!checkoutLineId) return;
    const moreInCart = items.filter((i) => i.id !== checkoutLineId).length;
    removeItem(checkoutLineId);
    setCheckoutLineId(null);
    setCouponCode('');
    setCouponResult(null);
    setBookingId(id);
    setSuccessMeta({ moreInCart });
    setStep('success');
    toast.success('Booking confirmed!');
  };

  const currentPrice = activeLine ? getPackagePrice(activeLine.packageId, new Date(activeLine.date)) : 0;
  const finalPrice = couponResult ? currentPrice - couponResult.discount : currentPrice;

  const progressStep = step === 'checkout' ? 2 : 1;

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <PageContainer className="max-w-5xl">
      <AddPackageToCartModal
        packageId={addModalPackageId}
        open={Boolean(addModalPackageId)}
        onOpenChange={(o) => !o && setAddModalPackageId(null)}
        onAdded={() => {
          setAddModalPackageId(null);
          setStep('cart');
          scrollIntoViewSmooth(cartRef.current, { delayMs: 200, block: 'start' });
        }}
      />

      <div className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          {step !== 'package' && step !== 'success' && (
            <button
              type="button"
              onClick={goBack}
              className="glass flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 text-white/50 transition-all hover:border-white/20 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h1 className="font-sans text-3xl font-black text-white sm:text-4xl">
            {step === 'success' ? 'Booking Confirmed! 🎉' : 'Book Your Session'}
          </h1>
        </div>

        {step !== 'success' && (
          <div className="flex flex-wrap items-center gap-2">
            {[
              { n: 1, label: 'Cart', icon: Package },
              { n: 2, label: 'Payment', icon: CreditCard },
            ].map(({ n, label, icon: Icon }, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                    progressStep === n
                      ? 'border-zinc-500/30 bg-zinc-500/15 text-zinc-400'
                      : progressStep > n
                        ? 'text-white/40'
                        : 'text-white/20'
                  }`}
                >
                  {progressStep > n ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400/60" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < 1 && <ChevronRight className="h-3.5 w-3.5 text-white/15" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 'cart' && (
          <motion.div
            key="cart"
            ref={cartRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="scroll-mt-24 space-y-6"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <p className="text-sm text-white/50">
                {items.length} session{items.length !== 1 ? 's' : ''} in your cart. Pay for each booking separately.
              </p>
              <button
                type="button"
                onClick={() => setStep('package')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-900"
              >
                <Plus className="h-4 w-4" />
                Add another package
              </button>
            </div>

            <div className="space-y-4">
              {items.map((line) => (
                <div key={line.id} className="card-dark flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="font-semibold text-white">{line.packageName}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {line.formattedDate}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {line.formattedTime}
                      </span>
                      <span className="font-semibold text-zinc-300">
                        ₹{getPackagePrice(line.packageId, new Date(line.date)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => removeItem(line.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                    <button type="button" onClick={() => startCheckout(line.id)} className="btn-primary px-5 py-2.5 text-sm">
                      Pay now
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'package' && (
          <motion.div key="package" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <p className="mb-6 text-center text-sm text-white/45">
              Choose a package, then pick date &amp; time in the next step. Everything is saved to your cart.
            </p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {(['SET_A', 'SET_B', 'SET_C'] as const).map((pkgId) => {
                const pkg = PACKAGES[pkgId];
                const isPopular = pkgId === 'SET_B';
                return (
                  <div
                    key={pkgId}
                    role="button"
                    tabIndex={0}
                    onClick={() => setAddModalPackageId(pkgId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setAddModalPackageId(pkgId);
                      }
                    }}
                    className={`card-package cursor-pointer p-6 ${isPopular ? 'popular' : ''}`}
                  >
                    {pkg.badge && (
                      <span
                        className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${isPopular ? 'badge-popular' : 'badge-premium'}`}
                      >
                        {pkg.badge}
                      </span>
                    )}
                    <h3 className="mb-1 font-sans text-2xl font-black text-white">{pkg.name}</h3>
                    <p className="mb-4 text-sm text-white/40">{pkg.tagline}</p>
                    <div className="mb-4 text-3xl font-black text-gradient-gold">₹{pkg.price.toLocaleString('en-IN')}</div>
                    <ul className="mb-6 space-y-2">
                      {pkg.features.slice(0, 5).map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400/60" />
                          {f}
                        </li>
                      ))}
                      {pkg.features.length > 5 && <li className="text-xs text-zinc-400/60">+{pkg.features.length - 5} more...</li>}
                    </ul>
                    <div className={`w-full rounded-xl py-3 text-center text-sm font-semibold ${isPopular ? 'btn-primary' : 'border border-zinc-500/30 text-zinc-400'}`}>
                      Select date &amp; time →
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 'checkout' && activeLine && (
          <motion.div
            key="checkout"
            ref={checkoutStepRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="scroll-mt-24"
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="space-y-5 lg:col-span-3">
                <div className="card-dark p-6">
                  <h3 className="mb-5 font-semibold text-white">Booking Summary</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Package', value: activeLine.packageName, icon: Package },
                      { label: 'Date', value: activeLine.formattedDate, icon: Calendar },
                      { label: 'Time', value: activeLine.formattedTime, icon: Clock },
                      { label: 'Duration', value: '1 Hour', icon: Zap },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-500/15 bg-zinc-500/8">
                          <Icon className="h-4 w-4 text-zinc-400/70" />
                        </div>
                        <div>
                          <p className="text-xs text-white/40">{label}</p>
                          <p className="text-sm font-medium text-white/90">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-dark p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                    <Tag className="h-4 w-4 text-zinc-400" /> Have a Coupon?
                  </h3>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                    <div className="min-w-0 flex-1">
                      <FieldInput
                        type="text"
                        icon={Tag}
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponResult(null);
                        }}
                        className="font-sans text-sm tabular-nums tracking-widest"
                        disabled={!!couponResult}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={!couponCode || couponLoading || !!couponResult}
                      className="min-h-[3rem] shrink-0 whitespace-nowrap rounded-xl border border-zinc-500/30 px-5 text-sm font-medium text-zinc-400 transition-all duration-200 hover:bg-zinc-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : couponResult ? '✓ Applied' : 'Apply'}
                    </button>
                  </div>
                  {couponResult && (
                    <div className="glass-gold mt-3 flex items-center gap-2 rounded-xl px-4 py-3">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                      <span className="text-sm text-zinc-400/90">{couponResult.message}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-500" />
                  <p className="text-xs leading-relaxed text-white/40">
                    Free cancellation up to 24 hours before your session. Demo payment — no real charge.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="card-dark sticky top-28 p-6">
                  <h3 className="mb-5 font-semibold text-white">Order Total</h3>
                  <div className="mb-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Package Price</span>
                      <span className="text-white/80">₹{currentPrice.toLocaleString('en-IN')}</span>
                    </div>
                    {couponResult && (
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Coupon Discount</span>
                        <span className="text-zinc-300">-₹{couponResult.discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="h-px bg-white/6" />
                    <div className="flex justify-between">
                      <span className="font-bold text-white">Total</span>
                      <span className="font-black text-2xl text-gradient-gold">₹{finalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(true)}
                    className="btn-primary w-full justify-center py-4 text-base"
                  >
                    <CreditCard className="h-5 w-5" />
                    Proceed to payment
                  </button>
                  <p className="mt-4 text-center text-xs leading-relaxed text-white/25">Demo checkout with a short delay.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            ref={successRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-xl scroll-mt-24 py-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-zinc-700 bg-zinc-900"
            >
              <CheckCircle2 className="h-12 w-12 text-white" />
            </motion.div>
            <h2 className="mb-3 font-sans text-4xl font-black text-white">You&apos;re Booked! 🎙️</h2>
            <p className="mb-8 text-base leading-relaxed text-white/50">
              Your studio session is confirmed. Check your email for details.
            </p>
            <div className="glass-gold mb-8 rounded-2xl p-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400/70">Booking Reference</p>
              <p className="font-sans text-xl font-black tabular-nums tracking-widest text-zinc-400">#{bookingId.slice(-8).toUpperCase()}</p>
            </div>
            {successMeta && successMeta.moreInCart > 0 && (
              <p className="mb-4 text-sm text-zinc-400">
                You have {successMeta.moreInCart} more session{successMeta.moreInCart !== 1 ? 's' : ''} in your cart.
              </p>
            )}
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              {successMeta && successMeta.moreInCart > 0 ? (
                <button type="button" onClick={() => { setSuccessMeta(null); setStep('cart'); }} className="btn-primary px-8 py-3.5">
                  Continue to cart
                </button>
              ) : null}
              <Link href="/dashboard" className="btn-primary px-8 py-3.5">
                View My Bookings
              </Link>
              <Link href="/" className="btn-outline px-8 py-3.5">
                Back to Home
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeLine && (
        <MockPaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          packageId={activeLine.packageId}
          packageName={activeLine.packageName}
          date={activeLine.date}
          timeSlot={activeLine.timeSlot}
          formattedDate={activeLine.formattedDate}
          formattedTime={activeLine.formattedTime}
          couponCode={couponResult ? couponCode : ''}
          onComplete={handlePaymentComplete}
        />
      )}
    </PageContainer>
  );
}
