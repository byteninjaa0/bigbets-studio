'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import {
  BarChart3, Users, Calendar, DollarSign, TrendingUp,
  Loader2, CheckCircle2, XCircle, Clock, RefreshCw, Lock, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apiMessage } from '@/lib/api-message';
import { PageContainer } from '@/components/layout/PageContainer';

interface Stats {
  totalBookings: number;
  confirmedBookings: number;
  totalUsers: number;
  totalRevenue: number;
  todayBookings: number;
  monthlyRevenue: { _id: { month: number; year: number }; revenue: number; count: number }[];
  packageStats: { _id: string; count: number; revenue: number }[];
}

interface Booking {
  _id: string;
  userName: string;
  userEmail: string;
  package: string;
  packageName: string;
  date: string;
  timeSlot: string;
  amount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'slots'>('overview');
  const [blockDate, setBlockDate] = useState('');
  const [blockTime, setBlockTime] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockLoading, setBlockLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin?callbackUrl=/admin');
      return;
    }
    if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.replace('/dashboard');
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        axios.get('/api/admin?type=stats'),
        axios.get('/api/admin?type=bookings'),
      ]);
      const sd = statsRes.data;
      const bd = bookingsRes.data;
      if (sd?.success === false) {
        toast.error(typeof sd.message === 'string' ? sd.message : 'Failed to load stats.');
        return;
      }
      if (bd?.success === false) {
        toast.error(typeof bd.message === 'string' ? bd.message : 'Failed to load bookings.');
        return;
      }
      const { success: _s1, ...statsPayload } = sd;
      setStats(statsPayload as Stats);
      setBookings(Array.isArray(bd.bookings) ? bd.bookings : []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = apiMessage(err.response?.data, 'Failed to load admin data.');
        if (status === 401) router.push('/auth/signin');
        else if (status === 403) router.push('/dashboard');
        else toast.error(msg);
      } else {
        toast.error('Failed to load admin data.');
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { if (session) fetchData(); }, [session]);

  const handleBlockSlot = async () => {
    if (!blockDate || !blockTime) return toast.error('Please enter date and time.');
    setBlockLoading(true);
    try {
      const { data } = await axios.post('/api/admin', { date: blockDate, time: blockTime, isBlocked: true, reason: blockReason || 'Blocked by admin' });
      if (data?.success === false) {
        toast.error(typeof data.message === 'string' ? data.message : 'Failed to block slot.');
        return;
      }
      toast.success(`Slot ${blockTime} on ${blockDate} blocked.`);
      setBlockDate(''); setBlockTime(''); setBlockReason('');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(apiMessage(err.response?.data, 'Failed to block slot.'));
      } else {
        toast.error('Failed to block slot.');
      }
    }
    finally { setBlockLoading(false); }
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const { data } = await axios.patch('/api/admin', { bookingId: id, status: newStatus });
      if (data?.success === false) {
        toast.error(typeof data.message === 'string' ? data.message : 'Update failed.');
        return;
      }
      toast.success(`Status updated to ${newStatus}.`);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: newStatus } : b));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(apiMessage(err.response?.data, 'Update failed.'));
      } else {
        toast.error('Update failed.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen animated-bg">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  const statCards = stats ? [
    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'from-zinc-500/20 to-transparent', change: `+${stats.todayBookings} today` },
    { label: 'Confirmed', value: stats.confirmedBookings, icon: CheckCircle2, color: 'from-zinc-500/18 to-transparent', change: 'Active sessions' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-zinc-600/15 to-transparent', change: 'Registered accounts' },
    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'from-zinc-400/12 to-transparent', change: 'All time' },
  ] : [];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'bookings', label: 'Bookings', icon: Calendar },
    { key: 'slots', label: 'Slot Manager', icon: Lock },
  ];

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <main className="pb-12 pt-24 sm:pb-16 sm:pt-28">
        <PageContainer>

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-500/15 border border-zinc-500/25 flex items-center justify-center">
              <Shield className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <h1 className="font-display font-black text-3xl text-white">Admin Panel</h1>
              <p className="text-white/40 text-sm">BigBets Studio management</p>
            </div>
          </div>
          <button onClick={fetchData} className="p-2.5 rounded-xl glass border border-white/8 text-white/40 hover:text-white hover:border-white/20 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex w-full max-w-full flex-wrap gap-2 rounded-2xl border border-white/6 bg-white/[0.03] p-1 glass sm:w-fit sm:flex-nowrap">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === key
                  ? 'bg-zinc-500/15 border border-zinc-500/25 text-zinc-400'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ─── Overview Tab ─── */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="card-dark p-5"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                    <card.icon className="w-5 h-5 text-white/70" />
                  </div>
                  <p className="font-display font-black text-2xl text-white mb-0.5">{card.value}</p>
                  <p className="text-white/50 text-sm">{card.label}</p>
                  <p className="text-white/25 text-xs mt-1">{card.change}</p>
                </motion.div>
              ))}
            </div>

            {/* Package breakdown */}
            <div className="card-dark p-6">
              <h3 className="font-semibold text-white mb-5">Package Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.packageStats.map((pkg) => {
                  const total = stats.packageStats.reduce((s, p) => s + p.count, 0);
                  const pct = total > 0 ? Math.round((pkg.count / total) * 100) : 0;
                  return (
                    <div key={pkg._id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-white">{pkg._id}</span>
                        <span className="text-zinc-400/80 text-sm font-semibold">₹{pkg.revenue.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-zinc-600 to-zinc-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-white/40">
                        <span>{pkg.count} bookings</span>
                        <span>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly revenue */}
            {stats.monthlyRevenue.length > 0 && (
              <div className="card-dark p-6">
                <h3 className="font-semibold text-white mb-5">Monthly Revenue</h3>
                <div className="flex items-end gap-3 h-40">
                  {stats.monthlyRevenue.map((m) => {
                    const maxRevenue = Math.max(...stats.monthlyRevenue.map((r) => r.revenue));
                    const heightPct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={`${m._id.month}-${m._id.year}`} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-zinc-600/60 to-zinc-400/40 hover:from-zinc-500/80 hover:to-zinc-400/60 transition-all duration-300 cursor-default group relative"
                            style={{ height: `${Math.max(heightPct, 5)}%` }}
                            title={`₹${m.revenue.toLocaleString('en-IN')}`}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/80 text-zinc-400 text-xs px-2 py-1 rounded whitespace-nowrap">
                              ₹{m.revenue.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                        <span className="text-white/30 text-xs">{MONTH_NAMES[m._id.month - 1]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Bookings Tab ─── */}
        {activeTab === 'bookings' && (
          <div className="card-dark overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h3 className="font-semibold text-white">All Bookings ({bookings.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Customer', 'Package', 'Date & Time', 'Amount', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-white/30 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-white/80 font-medium">{b.userName}</p>
                        <p className="text-white/35 text-xs">{b.userEmail}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="glass-gold text-zinc-400/80 text-xs px-2 py-1 rounded-lg">{b.packageName}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-white/70 text-xs">{format(new Date(b.date), 'MMM d, yyyy')}</p>
                        <p className="text-white/40 text-xs">{b.timeSlot}</p>
                      </td>
                      <td className="px-5 py-4 text-zinc-400/80 font-semibold">₹{b.amount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                          b.status === 'confirmed' ? 'text-white bg-white/10 border-white/25' :
                          b.status === 'cancelled' ? 'text-zinc-500 bg-zinc-900/80 border-zinc-700' :
                          b.status === 'completed' ? 'text-zinc-300 bg-zinc-800/40 border-zinc-600/40' :
                          'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={b.status}
                          onChange={(e) => updateBookingStatus(b._id, e.target.value)}
                          className="text-xs bg-white/5 border border-white/10 text-white/60 rounded-lg px-2 py-1.5 outline-none focus:border-zinc-500/30 cursor-pointer"
                        >
                          {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                            <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <div className="text-center py-16 text-white/25">No bookings found.</div>
              )}
            </div>
          </div>
        )}

        {/* ─── Slots Tab ─── */}
        {activeTab === 'slots' && (
          <div className="max-w-lg">
            <div className="card-dark p-6">
              <h3 className="font-semibold text-white mb-5">Block a Time Slot</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">Date</label>
                  <input
                    type="date"
                    value={blockDate}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setBlockDate(e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">Time (24h format, e.g. 14:00)</label>
                  <input
                    type="time"
                    value={blockTime}
                    onChange={(e) => setBlockTime(e.target.value)}
                    className="input-dark"
                    step={3600}
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">Reason (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Maintenance, Private booking"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="input-dark"
                  />
                </div>
                <button
                  onClick={handleBlockSlot}
                  disabled={blockLoading || !blockDate || !blockTime}
                  className="w-full py-3.5 rounded-xl bg-zinc-900 border border-zinc-600 text-white font-semibold text-sm hover:bg-zinc-800 hover:border-zinc-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {blockLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Block this slot'}
                </button>
              </div>
            </div>
          </div>
        )}

        </PageContainer>
      </main>
    </div>
  );
}
