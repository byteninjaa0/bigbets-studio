'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PACKAGES, formatTimeSlot, getPackagePrice, BUSINESS_HOURS } from '@/lib/packages';
import { apiMessage } from '@/lib/api-message';
import { useCart, type CartLine } from '@/lib/cart-store';

interface SlotInfo {
  time: string;
  isBooked: boolean;
  isBlocked: boolean;
  isAvailable: boolean;
}

type Props = {
  packageId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful add (modal still open until you close in handler) */
  onAdded?: (line: CartLine) => void;
};

export function AddPackageToCartModal({ packageId, open, onOpenChange, onAdded }: Props) {
  const { status } = useSession();
  const addItem = useCart((s) => s.addItem);
  const addInFlight = useRef(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pkg = packageId ? PACKAGES[packageId as keyof typeof PACKAGES] : null;

  const reset = useCallback(() => {
    setSelectedDate(undefined);
    setSelectedSlot('');
    setSlots([]);
    setSlotsLoading(false);
    setSlotsError(null);
    setSubmitting(false);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  useEffect(() => {
    if (open && status === 'unauthenticated') {
      toast.error('Sign in to add sessions to your cart.');
      onOpenChange(false);
    }
  }, [open, status, onOpenChange]);

  const fetchSlots = useCallback(async (date: Date) => {
    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedSlot('');
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const { data } = await axios.get(`/api/slots?date=${dateStr}`);
      if (data?.success === false) {
        const message = apiMessage(data, 'Failed to load slots.');
        toast.error(message);
        setSlotsError(message);
        setSlots([]);
        return;
      }
      setSlots(Array.isArray(data?.slots) ? data.slots : []);
    } catch {
      const message = 'Failed to load slots.';
      toast.error(message);
      setSlotsError(message);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  const isDisabledDay = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return true;
    if (date.getDay() === 0) return true;
    return false;
  };

  const handleAdd = () => {
    if (addInFlight.current || submitting) return;
    if (status !== 'authenticated') {
      toast.error('Sign in to add sessions to your cart.');
      return;
    }
    if (!packageId || !pkg || !selectedDate || !selectedSlot) {
      toast.error('Choose a date and time slot.');
      return;
    }
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
    const formattedTime = formatTimeSlot(selectedSlot);
    const price = getPackagePrice(packageId, selectedDate);

    addInFlight.current = true;
    setSubmitting(true);
    try {
      const result = addItem({
        packageId,
        packageName: pkg.name,
        price,
        date: dateStr,
        timeSlot: selectedSlot,
        formattedDate,
        formattedTime,
      });

      if (!result.ok) {
        toast.error('This date & time is already in your cart for that package.');
        return;
      }

      const line: CartLine = {
        id: result.id,
        packageId,
        packageName: pkg.name,
        price,
        date: dateStr,
        timeSlot: selectedSlot,
        formattedDate,
        formattedTime,
      };
      toast.success(`${pkg.name} added to cart`);
      onAdded?.(line);
      onOpenChange(false);
    } finally {
      addInFlight.current = false;
      setSubmitting(false);
    }
  };

  if (!pkg) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[140] flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-cart-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-white/10 bg-zinc-950 shadow-2xl sm:rounded-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 id="add-cart-title" className="heading-dialog text-lg sm:text-xl">
                Add {pkg.name}
              </h2>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
              <p className="mb-4 text-sm text-white/45">
                Pick a session date and time. The same slot cannot be added twice for this package.
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="card-dark p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                    <Calendar className="h-4 w-4 text-zinc-400" /> Date
                  </h3>
                  <div className="rdp-booking-calendar flex justify-center overflow-x-auto">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={isDisabledDay}
                      fromDate={new Date()}
                      toDate={addDays(new Date(), 60)}
                      classNames={{
                        root: 'rdp !m-0 !p-0 text-white',
                        months: 'rdp-months',
                        month: 'rdp-month !mx-auto !my-0',
                        caption: 'rdp-caption mb-2 text-white',
                        caption_label: 'rdp-caption_label !text-sm font-semibold text-white',
                        nav: 'rdp-nav',
                        nav_button:
                          'rdp-nav_button !h-8 !w-8 rounded text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
                        nav_button_previous: 'rdp-nav_button_previous',
                        nav_button_next: 'rdp-nav_button_next',
                        table: 'rdp-table w-full border-collapse',
                        head: 'rdp-head',
                        head_row: 'rdp-head_row',
                        head_cell:
                          'rdp-head_cell !h-9 !w-9 text-center text-xs font-semibold uppercase tracking-wide text-white/35',
                        tbody: 'rdp-tbody',
                        row: 'rdp-row',
                        cell: 'rdp-cell !p-0',
                        day: 'rdp-day !text-xs font-medium text-white/75',
                        day_selected: 'rdp-day_selected !font-bold',
                        day_today: 'rdp-day_today !font-semibold !text-zinc-300',
                        day_disabled: 'rdp-day_disabled !cursor-not-allowed !text-white/20',
                        day_outside: 'rdp-day_outside text-white/20',
                        button: 'rdp-button',
                        button_reset: 'rdp-button_reset',
                      }}
                    />
                  </div>
                  {selectedDate && (
                    <p className="mt-2 text-center text-xs text-white/40">
                      {BUSINESS_HOURS[selectedDate.getDay()] ? 'Open that day' : 'Closed — pick another date'}
                    </p>
                  )}
                </div>

                <div className="card-dark p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                    <Clock className="h-4 w-4 text-zinc-400" /> Time
                  </h3>
                  {selectedDate && slotsError && (
                    <div className="mb-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300/90" />
                        <div className="min-w-0">
                          <p className="text-xs text-red-200/90">{slotsError}</p>
                          <button
                            type="button"
                            onClick={() => void fetchSlots(selectedDate)}
                            className="mt-2 text-xs font-medium text-red-200 underline decoration-red-300/70 underline-offset-2 hover:text-red-100 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {!selectedDate ? (
                    <div className="flex h-40 flex-col items-center justify-center text-white/25">
                      <Calendar className="mb-2 h-10 w-10 opacity-30" />
                      <p className="text-xs">Select a date first</p>
                    </div>
                  ) : slotsLoading ? (
                    <div className="flex h-40 items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center text-white/25">
                      <AlertCircle className="mb-2 h-10 w-10 opacity-30" />
                      <p className="text-xs">No slots this day</p>
                    </div>
                  ) : (
                    <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-1">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`slot-btn rounded-lg px-2 py-2 text-left text-xs focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                            !slot.isAvailable ? 'booked' : selectedSlot === slot.time ? 'selected' : ''
                          }`}
                        >
                          <span className="font-medium">{formatTimeSlot(slot.time).split('–')[0].trim()}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedDate && selectedSlot && (
                <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-sm text-white/70">
                  <span className="text-zinc-400">Price for this slot: </span>
                  <span className="font-semibold text-white">
                    ₹{getPackagePrice(pkg.id, selectedDate).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-5">
              <button
                type="button"
                disabled={!selectedDate || !selectedSlot || submitting}
                onClick={handleAdd}
                className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-base focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                Add to cart
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
