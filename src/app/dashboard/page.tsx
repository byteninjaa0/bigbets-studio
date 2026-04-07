'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import {
  Calendar, Clock, Package, Loader2, AlertCircle,
  CheckCircle2, XCircle, RefreshCw, Mic2, ArrowRight, Gift
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import { apiMessage } from '@/lib/api-message';
import { PageContainer } from '@/components/layout/PageContainer';

interface Booking {
  _id: string;
  package: string;
  packageName: string;
  date: string;
  timeSlot: string;
  amount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  confirmed:  { label: 'Confirmed',  color: 'text-white bg-white/10 border-white/25',  icon: CheckCircle2 },
  pending:    { label: 'Pending',    color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/25',   icon: Clock },
  cancelled:  { label: 'Cancelled',  color: 'text-zinc-500 bg-zinc-900/80 border-zinc-700',         icon: XCircle },
  completed:  { label: 'Completed',  color: 'text-zinc-300 bg-zinc-800/40 border-zinc-600/40',      icon: CheckCircle2 },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin?callbackUrl=/dashboard');
    }
  }, [status, router]);

  const fetchBookings = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await axios.get('/api/bookings');
      if (data?.success === false) {
        const msg =
          typeof data.message === 'string'
            ? data.message
            : 'We could not load your bookings.';
        console.error('[dashboard] bookings API rejected:', msg, data);
        setLoadError(msg);
        setBookings([]);
        toast.error(msg);
        return;
      }
      const list = Array.isArray(data?.bookings) ? data.bookings : [];
      setBookings(list);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data;
        const msg =
          (body ? apiMessage(body, '') : '') ||
          (err.response?.status === 401
            ? 'Please sign in again to view your bookings.'
            : 'We could not reach the server. Check your connection and try again.');
        console.error('[dashboard] fetchBookings failed', err.response?.status, body ?? err);
        setLoadError(msg);
        setBookings([]);
        toast.error(
          err.response?.status === 401 ? msg : 'Something went wrong while loading bookings.'
        );
      } else {
        console.error('[dashboard] fetchBookings failed', err);
        setLoadError('We could not reach the server. Check your connection and try again.');
        setBookings([]);
        toast.error('Something went wrong while loading bookings.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchBookings();
  }, [session]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure? Cancellations must be 24h before your session.')) return;
    setCancellingId(id);
    try {
      const { data } = await axios.delete(`/api/bookings?id=${id}`);
      if (data?.success === false) {
        const msg = typeof data.message === 'string' ? data.message : 'Cancellation failed.';
        toast.error(msg);
        return;
      }
      toast.success(data?.message || 'Booking cancelled.');
      fetchBookings();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = apiMessage(err.response?.data, 'Cancellation failed.');
        console.error('[dashboard] cancel booking', err.response?.data);
        toast.error(msg);
      } else {
        toast.error('Cancellation failed.');
      }
    } finally {
      setCancellingId(null);
    }
  };

  const upcoming = bookings.filter((b) => b.status !== 'cancelled' && new Date(b.date) >= new Date());
  const past = bookings.filter((b) => b.status === 'cancelled' || new Date(b.date) < new Date());
  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'paid' && b.status !== 'cancelled')
    .reduce((s, b) => s + b.amount, 0);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen animated-bg">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <main className="pb-12 pt-24 sm:pb-16 sm:pt-28">
        <PageContainer>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-400 to-zinc-600 flex items-center justify-center text-black font-black text-lg overflow-hidden">
              {session?.user?.image
                ? <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                : session?.user?.name?.[0]?.toUpperCase()
              }
            </div>
            <div>
              <h1 className="heading-page">Hey, {session?.user?.name?.split(' ')[0]}!</h1>
              <p className="text-sm text-zinc-500">{session?.user?.email}</p>
            </div>
          </div>
        </motion.div>

        {loadError && !loading && (
          <div className="mb-8 rounded-2xl border border-zinc-700 bg-zinc-950/80 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Couldn&apos;t load bookings</p>
                <p className="text-sm text-white/50 mt-1">{loadError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchBookings()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white/90 text-sm font-medium hover:bg-white/15 transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Sessions', value: bookings.length, icon: Mic2, color: 'from-zinc-500/20 to-zinc-600/5' },
            { label: 'Upcoming', value: upcoming.length, icon: Calendar, color: 'from-zinc-600/18 to-zinc-700/5' },
            { label: 'Completed', value: past.filter((b) => b.status === 'completed').length, icon: CheckCircle2, color: 'from-zinc-500/15 to-zinc-600/5' },
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: Package, color: 'from-zinc-400/12 to-zinc-500/5' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card-dark p-5"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white/70" />
              </div>
              <p className="font-sans font-black text-2xl text-white">{stat.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Book CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-gold rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <h3 className="heading-sub mb-1">Ready for your next session?</h3>
            <p className="text-sm text-zinc-500">Slots are filling fast. Book yours now!</p>
          </div>
          <Link href="/booking" className="btn-primary w-full justify-center whitespace-nowrap sm:w-auto">
            Book a Session <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Bookings list */}
        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <Mic2 className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="mb-2 text-lg font-semibold text-zinc-500">No bookings yet</h3>
            <p className="mb-6 text-sm text-zinc-600">Your first session is just a click away.</p>
            <Link href="/booking" className="btn-primary mx-auto inline-flex w-full max-w-xs justify-center sm:w-auto">
              Book Your First Session
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <section>
                <h2 className="heading-list-label mb-4">Upcoming Sessions</h2>
                <div className="space-y-3">
                  {upcoming.map((booking, i) => (
                    <BookingCard key={booking._id} booking={booking} onCancel={handleCancel} cancellingId={cancellingId} index={i} />
                  ))}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 className="heading-list-label mb-4">Past Sessions</h2>
                <div className="space-y-3 opacity-70">
                  {past.map((booking, i) => (
                    <BookingCard key={booking._id} booking={booking} onCancel={handleCancel} cancellingId={cancellingId} index={i} isPast />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
        </PageContainer>
      </main>
    </div>
  );
}

function BookingCard({ booking, onCancel, cancellingId, index, isPast = false }: any) {
  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const bookingDate = new Date(booking.date);
  const canCancel = !isPast && booking.status === 'confirmed' &&
    (bookingDate.getTime() - Date.now()) > 24 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="card-dark p-5"
    >
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-500/20 bg-zinc-500/10">
            <Mic2 className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <p className="font-semibold text-white break-words">{booking.packageName}</p>
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
                <StatusIcon className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-white/50 text-sm flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {format(bookingDate, 'MMM d, yyyy')}
              </span>
              <span className="text-white/50 text-sm flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {booking.timeSlot}
              </span>
              <span className="text-zinc-400/80 text-sm font-semibold">
                ₹{booking.amount.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="mt-1 font-sans text-xs tabular-nums tracking-wide text-white/25">#{booking._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {canCancel && (
          <button
            onClick={() => onCancel(booking._id)}
            disabled={cancellingId === booking._id}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs font-medium transition-colors px-3 py-2 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-700 whitespace-nowrap"
          >
            {cancellingId === booking._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
}
