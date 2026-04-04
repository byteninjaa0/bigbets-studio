'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, AlertCircle, Package, Calendar, Clock, CreditCard } from 'lucide-react';
import axios from 'axios';
import { apiMessage } from '@/lib/api-message';
import { simulatePayment } from '@/lib/mock-payment';

type Phase = 'summary' | 'processing' | 'success' | 'failure';

export type MockPaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string;
  packageName: string;
  date: string;
  timeSlot: string;
  formattedDate: string;
  formattedTime: string;
  couponCode: string;
  onComplete: (bookingId: string) => void;
};

export function MockPaymentModal({
  open,
  onOpenChange,
  packageId,
  packageName,
  date,
  timeSlot,
  formattedDate,
  formattedTime,
  couponCode,
  onComplete,
}: MockPaymentModalProps) {
  const [phase, setPhase] = useState<Phase>('summary');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [originalAmount, setOriginalAmount] = useState<number | null>(null);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const isDev = process.env.NODE_ENV === 'development';

  const loadQuote = useCallback(async () => {
    setQuoteLoading(true);
    setQuoteError(null);
    try {
      const { data } = await axios.post<{
        success?: boolean;
        amount?: number;
        originalAmount?: number;
        discountApplied?: number;
        message?: string;
      }>('/api/booking/quote', {
        packageId,
        date,
        couponCode: couponCode.trim() || undefined,
      });
      if (data?.success === false) {
        setQuoteError(apiMessage(data, 'Could not load price.'));
        setAmount(null);
        return;
      }
      if (typeof data.amount === 'number') {
        setAmount(data.amount);
        setOriginalAmount(typeof data.originalAmount === 'number' ? data.originalAmount : data.amount);
        setDiscountApplied(typeof data.discountApplied === 'number' ? data.discountApplied : 0);
        setQuoteError(null);
      } else {
        setQuoteError('Could not load price.');
        setAmount(null);
      }
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setQuoteError(apiMessage(e.response?.data, 'Could not load price.'));
      } else {
        setQuoteError('Could not load price.');
      }
      setAmount(null);
    } finally {
      setQuoteLoading(false);
    }
  }, [packageId, date, couponCode]);

  useEffect(() => {
    if (!open) {
      setPhase('summary');
      setSimulateFailure(false);
      setQuoteError(null);
      return;
    }
    loadQuote();
  }, [open, loadQuote]);

  const handlePay = async () => {
    if (amount === null) return;
    setPhase('processing');
    try {
      const payment = await simulatePayment({ simulateFailure: isDev && simulateFailure });
      if (!payment.success || !payment.paymentId) {
        setPhase('failure');
        return;
      }

      const { data } = await axios.post<{
        success?: boolean;
        bookingId?: string;
        message?: string;
      }>('/api/booking/confirm', {
        mockPaymentId: payment.paymentId,
        packageId,
        date,
        timeSlot,
        couponCode: couponCode.trim() || undefined,
      });

      if (data?.success === false || !data?.bookingId) {
        setPhase('failure');
        return;
      }

      setPhase('success');
      window.setTimeout(() => {
        onComplete(data.bookingId!);
        onOpenChange(false);
        setPhase('summary');
      }, 1600);
    } catch {
      setPhase('failure');
    }
  };

  const handleRetry = () => {
    setPhase('summary');
    loadQuote();
  };

  const displayTotal = amount ?? 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => phase !== 'processing' && onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mock-payment-title"
            className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-zinc-950/95 shadow-2xl shadow-black/60 overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <h2 id="mock-payment-title" className="font-sans text-xl font-black tracking-tight text-white">
                Complete payment
              </h2>
              {phase !== 'processing' && (
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl p-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="px-6 pb-6">
              <AnimatePresence mode="wait">
                {phase === 'summary' && (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="space-y-5"
                  >
                    <p className="text-xs text-white/35 leading-relaxed border border-white/[0.06] rounded-2xl px-4 py-3 bg-white/[0.02]">
                      This is a demo payment. No real transaction will occur.
                    </p>

                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3">
                      {[
                        { icon: Package, label: 'Package', value: packageName },
                        { icon: Calendar, label: 'Date', value: formattedDate },
                        { icon: Clock, label: 'Time', value: formattedTime },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-zinc-500" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-white/35">{label}</p>
                            <p className="text-sm font-medium text-white/90">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {quoteLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                      </div>
                    ) : quoteError ? (
                      <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-200/90">
                        {quoteError}
                      </div>
                    ) : (
                      <div className="space-y-3 pt-1">
                        {discountApplied > 0 && originalAmount !== null && (
                          <div className="flex justify-between text-sm text-white/45">
                            <span>Original</span>
                            <span className="line-through">₹{originalAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {discountApplied > 0 && (
                          <div className="flex justify-between text-sm text-zinc-400">
                            <span>Discount</span>
                            <span>-₹{discountApplied.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-baseline pt-2 border-t border-white/[0.06]">
                          <span className="text-sm font-medium text-white/50">Total due</span>
                          <span className="font-sans text-3xl font-black text-white">
                            ₹{displayTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    )}

                    {isDev && (
                      <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={simulateFailure}
                          onChange={(e) => setSimulateFailure(e.target.checked)}
                          className="rounded border-zinc-600 bg-zinc-900"
                        />
                        Simulate payment failure (dev)
                      </label>
                    )}

                    <button
                      type="button"
                      disabled={quoteLoading || amount === null || quoteError !== null}
                      onClick={handlePay}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white text-black font-bold py-4 text-base hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <CreditCard className="w-5 h-5" />
                      Pay ₹{displayTotal.toLocaleString('en-IN')}
                    </button>
                  </motion.div>
                )}

                {phase === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center py-14"
                  >
                    <Loader2 className="w-12 h-12 animate-spin text-zinc-400 mb-4" />
                    <p className="text-white/60 text-sm font-medium">Processing payment…</p>
                    <p className="text-white/30 text-xs mt-2">Please do not close this window</p>
                  </motion.div>
                )}

                {phase === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-12 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                      className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center mb-5"
                    >
                      <CheckCircle2 className="w-9 h-9" />
                    </motion.div>
                    <h3 className="mb-2 font-sans text-2xl font-black text-white">Payment successful 🎉</h3>
                    <p className="text-white/45 text-sm">Your booking is confirmed.</p>
                  </motion.div>
                )}

                {phase === 'failure' && (
                  <motion.div
                    key="failure"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center py-10 text-center space-y-5"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                      <AlertCircle className="w-7 h-7 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-sans text-lg font-bold text-white">Payment failed</h3>
                      <p className="text-white/45 text-sm">Please try again.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="w-full rounded-2xl border border-white/15 text-white py-3.5 text-sm font-semibold hover:bg-white/5 transition-colors"
                    >
                      Try again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
