'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-store';
import { PACKAGES, generateTimeSlots, formatTimeSlot, getPackagePrice, BUSINESS_HOURS } from '@/lib/packages';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import {
  Calendar, Clock, Package, CreditCard, Tag, ChevronRight,
  Loader2, CheckCircle2, AlertCircle, Zap, ArrowLeft, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import { apiMessage } from '@/lib/api-message';
import { MockPaymentModal } from '@/components/booking/MockPaymentModal';
import { PageContainer } from '@/components/layout/PageContainer';
import { FieldInput } from '@/components/ui/field-input';

type Step = 'package' | 'datetime' | 'checkout' | 'success';

interface SlotInfo {
  time: string;
  isBooked: boolean;
  isBlocked: boolean;
  isAvailable: boolean;
}

export default function BookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { item, setItem, updateSlot, clearCart } = useCart();

  const [step, setStep] = useState<Step>(item ? 'datetime' : 'package');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<{ discount: number; message: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin?callbackUrl=/booking');
  }, [status, router]);

  const fetchSlots = useCallback(async (date: Date) => {
    setSlotsLoading(true);
    setSelectedSlot('');
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const { data } = await axios.get(`/api/slots?date=${dateStr}`);
      if (data?.success === false) {
        toast.error(apiMessage(data, 'Failed to load slots.'));
        setSlots([]);
        return;
      }
      setSlots(Array.isArray(data?.slots) ? data.slots : []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(apiMessage(err.response?.data, 'Failed to load slots.'));
      } else {
        toast.error('Failed to load slots.');
      }
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  const handlePackageSelect = (pkgId: string) => {
    const pkg = PACKAGES[pkgId as keyof typeof PACKAGES];
    setItem({ packageId: pkgId, packageName: pkg.name, price: pkg.price });
    setStep('datetime');
  };

  const handleDateTimeConfirm = () => {
    if (!selectedDate || !selectedSlot) return toast.error('Please select a date and time slot.');
    const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
    const formattedTime = formatTimeSlot(selectedSlot);
    updateSlot(format(selectedDate, 'yyyy-MM-dd'), selectedSlot, formattedDate, formattedTime);
    setStep('checkout');
  };

  const applyCoupon = async () => {
    if (!couponCode.trim() || !item) return;
    setCouponLoading(true);
    try {
      const price = item.date ? getPackagePrice(item.packageId, new Date(item.date)) : item.price;
      const { data } = await axios.post('/api/bookings/coupon', {
        code: couponCode,
        packageId: item.packageId,
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
    setBookingId(id);
    clearCart();
    setStep('success');
    toast.success('Booking confirmed!');
  };

  // Disable past dates and Sunday
  const isDisabledDay = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return true;
    if (date.getDay() === 0) return true;
    return false;
  };

  const currentPrice = item?.date ? getPackagePrice(item.packageId, new Date(item.date)) : item?.price || 0;
  const finalPrice = couponResult ? currentPrice - couponResult.discount : currentPrice;
  const availableCount = slots.filter((s) => s.isAvailable).length;

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <PageContainer className="max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          {step !== 'package' && step !== 'success' && (
            <button
              onClick={() => setStep(step === 'checkout' ? 'datetime' : 'package')}
              className="w-9 h-9 rounded-xl glass border border-white/8 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
            {step === 'success' ? 'Booking Confirmed! 🎉' : 'Book Your Session'}
          </h1>
        </div>

        {/* Step progress */}
        {step !== 'success' && (
          <div className="flex items-center gap-2">
            {[
              { key: 'package', label: 'Package', icon: Package },
              { key: 'datetime', label: 'Date & Time', icon: Calendar },
              { key: 'checkout', label: 'Checkout', icon: CreditCard },
            ].map(({ key, label, icon: Icon }, i) => {
              const steps = ['package', 'datetime', 'checkout'];
              const currentIdx = steps.indexOf(step);
              const thisIdx = steps.indexOf(key);
              const isDone = currentIdx > thisIdx;
              const isCurrent = step === key;
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    isCurrent ? 'bg-zinc-500/15 border border-zinc-500/30 text-zinc-400' :
                    isDone ? 'text-white/40' : 'text-white/20'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400/60" /> : <Icon className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                  {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-white/15" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">

        {/* ─── STEP: Package Selection ─── */}
        {step === 'package' && (
          <motion.div key="package" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {['SET_A', 'SET_B', 'SET_C'].map((pkgId) => {
                const pkg = PACKAGES[pkgId as keyof typeof PACKAGES];
                const isPopular = pkgId === 'SET_B';
                return (
                  <div key={pkgId} className={`card-package p-6 cursor-pointer ${isPopular ? 'popular' : ''}`} onClick={() => handlePackageSelect(pkgId)}>
                    {pkg.badge && (
                      <span className={`inline-block mb-3 text-xs font-bold px-3 py-1 rounded-full ${isPopular ? 'badge-popular' : 'badge-premium'}`}>{pkg.badge}</span>
                    )}
                    <h3 className="font-display font-black text-2xl text-white mb-1">{pkg.name}</h3>
                    <p className="text-white/40 text-sm mb-4">{pkg.tagline}</p>
                    <div className="text-3xl font-black text-gradient-gold mb-4">₹{pkg.price.toLocaleString('en-IN')}</div>
                    <ul className="space-y-2 mb-6">
                      {pkg.features.slice(0, 5).map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400/60 flex-shrink-0" />{f}
                        </li>
                      ))}
                      {pkg.features.length > 5 && <li className="text-xs text-zinc-400/60">+{pkg.features.length - 5} more...</li>}
                    </ul>
                    <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${isPopular ? 'btn-primary' : 'border border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/10'}`}>
                      Select {pkg.name} →
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── STEP: Date & Time ─── */}
        {step === 'datetime' && (
          <motion.div key="datetime" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="card-dark p-6">
                <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-zinc-400" /> Select Date
                </h3>
                <div className="flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDisabledDay}
                    fromDate={new Date()}
                    toDate={addDays(new Date(), 60)}
                    className="text-white"
                    classNames={{
                      months: 'flex flex-col',
                      month: 'space-y-4',
                      caption: 'flex justify-between items-center mb-4 text-white font-semibold',
                      nav: 'flex items-center gap-1',
                      nav_button: 'w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/8 hover:text-white transition-all',
                      table: 'w-full border-collapse',
                      head_row: 'flex mb-2',
                      head_cell: 'w-10 text-center text-white/30 text-xs font-medium',
                      row: 'flex w-full mt-1',
                      cell: 'relative w-10 h-10 flex items-center justify-center',
                      day: 'w-9 h-9 rounded-xl text-sm font-medium text-white/70 hover:bg-zinc-500/15 hover:text-zinc-400 transition-all duration-150 cursor-pointer',
                      day_selected: 'bg-white text-black hover:bg-zinc-200 rounded-xl font-bold',
                      day_today: 'border border-zinc-500/40 text-zinc-400',
                      day_disabled: 'text-white/15 cursor-not-allowed hover:bg-transparent hover:text-white/15',
                      day_outside: 'text-white/15',
                    }}
                  />
                </div>

                {selectedDate && (
                  <div className="mt-4 glass-gold rounded-xl p-3 text-center">
                    <p className="text-zinc-400/80 text-sm font-medium">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {BUSINESS_HOURS[selectedDate.getDay()]
                        ? `Open ${BUSINESS_HOURS[selectedDate.getDay()]!.open} – ${BUSINESS_HOURS[selectedDate.getDay()]!.close}`
                        : 'Studio Closed'}
                    </p>
                  </div>
                )}
              </div>

              {/* Slots */}
              <div className="card-dark p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-zinc-400" /> Select Time Slot
                  </h3>
                  {selectedDate && !slotsLoading && slots.length > 0 && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${availableCount <= 3 ? 'bg-zinc-800 text-white border border-zinc-600' : 'bg-zinc-500/10 text-zinc-400/80 border border-zinc-500/15'}`}>
                      {availableCount <= 3 ? `Only ${availableCount} left` : `${availableCount} available`}
                    </span>
                  )}
                </div>

                {!selectedDate ? (
                  <div className="flex flex-col items-center justify-center h-48 text-white/25">
                    <Calendar className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">Select a date first</p>
                  </div>
                ) : slotsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400/40" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-white/25">
                    <AlertCircle className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">Studio is closed on this day</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`slot-btn ${!slot.isAvailable ? 'booked' : selectedSlot === slot.time ? 'selected' : ''}`}
                      >
                        <span className="font-medium">{formatTimeSlot(slot.time).split('–')[0].trim()}</span>
                        <span className="text-[10px] opacity-50 mt-0.5">
                          {!slot.isAvailable ? 'Booked' : '1 hour'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Legend */}
                <div className="flex gap-4 mt-5 pt-4 border-t border-white/5">
                  {[
                    { color: 'bg-zinc-500/15 border-zinc-500', label: 'Selected' },
                    { color: 'bg-white/3 border-white/8', label: 'Available' },
                    { color: 'bg-white/[0.02] border-zinc-700', label: 'Booked' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded border ${color}`} />
                      <span className="text-xs text-white/30">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-stretch sm:justify-end">
              <button
                type="button"
                onClick={handleDateTimeConfirm}
                disabled={!selectedDate || !selectedSlot}
                className="btn-primary w-full justify-center px-8 py-4 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Continue to Checkout <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── STEP: Checkout ─── */}
        {step === 'checkout' && item && (
          <motion.div key="checkout" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Summary */}
              <div className="lg:col-span-3 space-y-5">
                {/* Booking details */}
                <div className="card-dark p-6">
                  <h3 className="font-semibold text-white mb-5">Booking Summary</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Package', value: PACKAGES[item.packageId as keyof typeof PACKAGES]?.name, icon: Package },
                      { label: 'Date', value: item.formattedDate || '—', icon: Calendar },
                      { label: 'Time', value: item.formattedTime || '—', icon: Clock },
                      { label: 'Duration', value: '1 Hour', icon: Zap },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-500/8 border border-zinc-500/15 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-zinc-400/70" />
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">{label}</p>
                          <p className="text-white/90 text-sm font-medium">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coupon */}
                <div className="card-dark p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-zinc-400" /> Have a Coupon?
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
                        className="font-mono tracking-widest text-sm"
                        disabled={!!couponResult}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={!couponCode || couponLoading || !!couponResult}
                      className="min-h-[3rem] shrink-0 px-5 rounded-xl border border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/10 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : couponResult ? '✓ Applied' : 'Apply'}
                    </button>
                  </div>
                  {couponResult && (
                    <div className="mt-3 glass-gold rounded-xl px-4 py-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                      <span className="text-zinc-400/90 text-sm">{couponResult.message}</span>
                    </div>
                  )}
                </div>

                {/* Info note */}
                <div className="flex gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <Info className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/40 text-xs leading-relaxed">
                    Free cancellation up to 24 hours before your session. After that, no refunds are issued.
                    Checkout uses a demo payment flow — no real charge. A confirmation email is sent when you complete it.
                  </p>
                </div>
              </div>

              {/* Price card */}
              <div className="lg:col-span-2">
                <div className="card-dark p-6 sticky top-28">
                  <h3 className="font-semibold text-white mb-5">Order Total</h3>

                  <div className="space-y-3 mb-5">
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
                    disabled={!item.date || !item.timeSlot}
                    className="btn-primary w-full justify-center py-4 text-base disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <CreditCard className="w-5 h-5" />
                    Proceed to payment
                  </button>

                  <p className="mt-4 text-center text-white/25 text-xs leading-relaxed">
                    Demo checkout — simulates a real payment with a short processing delay.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── STEP: Success ─── */}
        {step === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="font-display font-black text-4xl text-white mb-3">You&apos;re Booked! 🎙️</h2>
            <p className="text-white/50 text-base leading-relaxed mb-8">
              Your studio session is confirmed. Check your email for the confirmation details.
              We can&apos;t wait to see you create!
            </p>
            <div className="glass-gold rounded-2xl p-5 mb-8">
              <p className="text-zinc-400/70 text-xs font-bold uppercase tracking-widest mb-2">Booking Reference</p>
              <p className="font-mono text-zinc-400 text-xl font-black tracking-widest">#{bookingId.slice(-8).toUpperCase()}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard" className="btn-primary px-8 py-3.5">View My Bookings</Link>
              <Link href="/" className="btn-outline px-8 py-3.5">Back to Home</Link>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {item && item.date && item.timeSlot && (
        <MockPaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          packageId={item.packageId}
          packageName={item.packageName}
          date={item.date}
          timeSlot={item.timeSlot}
          formattedDate={item.formattedDate ?? '—'}
          formattedTime={item.formattedTime ?? '—'}
          couponCode={couponResult ? couponCode : ''}
          onComplete={handlePaymentComplete}
        />
      )}
    </PageContainer>
  );
}
