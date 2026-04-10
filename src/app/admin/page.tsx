'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import {
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Lock,
  Shield,
  Package,
  ChevronsLeft,
  ChevronsRight,
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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DEFAULT_BOOKINGS_LIMIT = 20;

type AdminTab = 'overview' | 'bookings' | 'slots';

function bookingsRangeLabel(total: number, page: number, limit: number, rowCount: number): string {
  if (total === 0) return 'No bookings yet';
  if (rowCount === 0) return `${total.toLocaleString('en-IN')} total · this page is empty`;
  const from = (page - 1) * limit + 1;
  const to = from + rowCount - 1;
  return `Showing ${from.toLocaleString('en-IN')}–${to.toLocaleString('en-IN')} of ${total.toLocaleString('en-IN')}`;
}

function BookingsPaginationBar(props: { page: number; pages: number; onGo: (p: number) => void }) {
  const { page, pages, onGo } = props;
  const btn =
    'rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed sm:px-3';
  const iconBtn = `${btn} inline-flex items-center justify-center px-2 sm:px-2.5`;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-2">
      <button type="button" disabled={page <= 1} onClick={() => onGo(1)} className={iconBtn} aria-label="First page" title="First page">
        <ChevronsLeft className="h-4 w-4" />
      </button>
      <button type="button" disabled={page <= 1} onClick={() => onGo(page - 1)} className={btn}>
        Previous
      </button>
      <span className="min-w-[5.5rem] text-center text-xs tabular-nums text-white/35">
        Page {page} of {pages}
      </span>
      <button type="button" disabled={page >= pages} onClick={() => onGo(page + 1)} className={btn}>
        Next
      </button>
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onGo(pages)}
        className={iconBtn}
        aria-label="Last page"
        title="Last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
      <label className="ml-0 flex items-center gap-2 text-xs text-white/35 sm:ml-1">
        <span className="hidden sm:inline">Go to</span>
        <input
          type="number"
          min={1}
          max={pages}
          defaultValue={page}
          key={`page-input-${page}`}
          className="w-12 rounded border border-white/10 bg-black/40 px-1 py-1 text-center text-white/80 tabular-nums focus:border-zinc-500/40 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          aria-label="Page number"
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            const v = parseInt(e.currentTarget.value, 10);
            if (!Number.isFinite(v)) return;
            onGo(Math.min(pages, Math.max(1, v)));
          }}
        />
      </label>
    </div>
  );
}

function AdminPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageQ = searchParams.get('page') ?? '1';
  const tabQ = searchParams.get('tab') ?? '';
  const searchParamsString = searchParams.toString();

  const activeTab: AdminTab =
    tabQ === 'bookings' || tabQ === 'slots' ? (tabQ as AdminTab) : 'overview';

  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsPages, setBookingsPages] = useState(1);
  const [bookingsLimit, setBookingsLimit] = useState(DEFAULT_BOOKINGS_LIMIT);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [blockTime, setBlockTime] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockLoading, setBlockLoading] = useState(false);

  const replaceAdminQuery = useCallback(
    (patch: { tab?: AdminTab; page?: number }) => {
      const p = new URLSearchParams(searchParamsString);
      if (patch.tab !== undefined) p.set('tab', patch.tab);
      if (patch.page !== undefined) p.set('page', String(patch.page));
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParamsString]
  );

  const goBookingsPage = useCallback(
    (nextPage: number) => {
      replaceAdminQuery({ tab: 'bookings', page: Math.max(1, nextPage) });
    },
    [replaceAdminQuery]
  );

  const selectTab = useCallback(
    (key: AdminTab) => {
      const p = new URLSearchParams(searchParamsString);
      p.set('tab', key);
      if (key === 'bookings' && !p.get('page')) p.set('page', '1');
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParamsString]
  );

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin?callbackUrl=/admin');
      return;
    }
    if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.replace('/dashboard');
    }
  }, [status, session, router]);

  const fetchData = useCallback(async () => {
    if (!session) return;
    const requestedPage = Math.max(1, parseInt(pageQ, 10) || 1);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        axios.get('/api/admin?type=stats'),
        axios.get(`/api/admin?type=bookings&page=${requestedPage}`),
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
      if (typeof bd.total === 'number') setBookingsTotal(bd.total);
      if (typeof bd.pages === 'number') setBookingsPages(bd.pages);
      if (typeof bd.page === 'number') setBookingsPage(bd.page);
      if (typeof bd.limit === 'number' && bd.limit > 0) setBookingsLimit(bd.limit);

      if (typeof bd.page === 'number' && bd.page !== requestedPage) {
        const p = new URLSearchParams(searchParamsString);
        p.set('page', String(bd.page));
        if (!p.get('tab')) p.set('tab', 'bookings');
        router.replace(`${pathname}?${p.toString()}`, { scroll: false });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const st = err.response?.status;
        const msg = apiMessage(err.response?.data, 'Failed to load admin data.');
        if (st === 401) router.push('/auth/signin');
        else if (st === 403) router.push('/dashboard');
        else toast.error(msg);
      } else {
        toast.error('Failed to load admin data.');
      }
    } finally {
      setLoading(false);
    }
  }, [session, pageQ, pathname, router, searchParamsString]);

  useEffect(() => {
    if (session) void fetchData();
  }, [session, pageQ, tabQ, fetchData]);

  const handleBlockSlot = async () => {
    if (!blockDate || !blockTime) return toast.error('Please enter date and time.');
    setBlockLoading(true);
    try {
      const { data } = await axios.post('/api/admin', {
        date: blockDate,
        time: blockTime,
        isBlocked: true,
        reason: blockReason || 'Blocked by admin',
      });
      if (data?.success === false) {
        toast.error(typeof data.message === 'string' ? data.message : 'Failed to block slot.');
        return;
      }
      toast.success(`Slot ${blockTime} on ${blockDate} blocked.`);
      setBlockDate('');
      setBlockTime('');
      setBlockReason('');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(apiMessage(err.response?.data, 'Failed to block slot.'));
      } else {
        toast.error('Failed to block slot.');
      }
    } finally {
      setBlockLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const { data } = await axios.patch('/api/admin', { bookingId: id, status: newStatus });
      if (data?.success === false) {
        toast.error(typeof data.message === 'string' ? data.message : 'Update failed.');
        return;
      }
      toast.success(`Status updated to ${newStatus}.`);
      await fetchData();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(apiMessage(err.response?.data, 'Update failed.'));
      } else {
        toast.error('Update failed.');
      }
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchData();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen animated-bg">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  const statCards = stats
    ? [
        {
          label: 'Total Bookings',
          value: stats.totalBookings,
          icon: Calendar,
          color: 'from-zinc-500/20 to-transparent',
          change: `+${stats.todayBookings} today`,
        },
        {
          label: 'Confirmed',
          value: stats.confirmedBookings,
          icon: CheckCircle2,
          color: 'from-zinc-500/18 to-transparent',
          change: 'Active sessions',
        },
        {
          label: 'Total Users',
          value: stats.totalUsers,
          icon: Users,
          color: 'from-zinc-600/15 to-transparent',
          change: 'Registered accounts',
        },
        {
          label: 'Revenue',
          value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
          icon: DollarSign,
          color: 'from-zinc-400/12 to-transparent',
          change: 'All time',
        },
      ]
    : [];

  const tabs: { key: AdminTab; label: string; icon: typeof BarChart3 }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'bookings', label: 'Bookings', icon: Calendar },
    { key: 'slots', label: 'Slot Manager', icon: Lock },
  ];

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <main className="pb-12 pt-24 sm:pb-16 sm:pt-28">
        <PageContainer>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-500/25 bg-zinc-500/15">
                <Shield className="h-5 w-5 text-zinc-400" />
              </div>
              <div>
                <h1 className="heading-page">Admin Panel</h1>
                <p className="text-sm text-zinc-500">BigBets Studio management</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={isRefreshing}
              className="rounded-lg border border-white/8 bg-white/[0.03] p-2 text-white/40 transition-all hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="glass mb-8 flex w-full max-w-full flex-wrap gap-2 rounded-2xl border border-white/6 bg-white/[0.03] p-1 sm:w-fit sm:flex-nowrap">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => selectTab(key)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  activeTab === key
                    ? 'border border-zinc-500/25 bg-zinc-500/15 text-zinc-400'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && stats && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {statCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="card-dark p-5"
                  >
                    <div
                      className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color}`}
                    >
                      <card.icon className="h-5 w-5 text-white/70" />
                    </div>
                    <p className="mb-0.5 font-sans text-2xl font-black text-white">{card.value}</p>
                    <p className="text-sm text-white/50">{card.label}</p>
                    <p className="mt-1 text-xs text-white/25">{card.change}</p>
                  </motion.div>
                ))}
              </div>

              <div className="card-dark p-6">
                <h3 className="heading-panel mb-5">Package Performance</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {stats.packageStats.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] px-6 py-12 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-white/25">
                        <Package className="h-6 w-6" />
                      </div>
                      <h4 className="mb-1 text-base font-semibold text-white/70">No packages yet</h4>
                      <p className="text-sm text-white/35">Add your first package to see stats here</p>
                    </div>
                  ) : (
                    stats.packageStats.map((pkg) => {
                      const total = stats.packageStats.reduce((s, p) => s + p.count, 0);
                      const pct = total > 0 ? Math.round((pkg.count / total) * 100) : 0;
                      return (
                        <div key={pkg._id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                          <div className="mb-3 flex items-start justify-between">
                            <span className="font-bold text-white">{pkg._id}</span>
                            <span className="text-sm font-semibold text-zinc-400/80">
                              ₹{pkg.revenue.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-zinc-600 to-zinc-400 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-white/40">
                            <span>{pkg.count} bookings</span>
                            <span>{pct}%</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="card-dark p-6">
                <h3 className="heading-panel mb-5">Monthly Revenue</h3>
                {stats.monthlyRevenue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] px-6 py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-white/25">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <h4 className="mb-1 text-base font-semibold text-white/70">No revenue data yet</h4>
                    <p className="text-sm text-white/35">Monthly totals will appear here once bookings are paid</p>
                  </div>
                ) : (
                  <div className="flex h-40 items-end gap-3">
                    {stats.monthlyRevenue.map((m) => {
                      const maxRevenue = Math.max(...stats.monthlyRevenue.map((r) => r.revenue));
                      const heightPct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
                      return (
                        <div key={`${m._id.month}-${m._id.year}`} className="flex flex-1 flex-col items-center gap-1">
                          <div className="flex w-full items-end justify-center" style={{ height: '100px' }}>
                            <div
                              className="group relative w-full cursor-default rounded-t-lg bg-gradient-to-t from-zinc-600/60 to-zinc-400/40 transition-all duration-300 hover:from-zinc-500/80 hover:to-zinc-400/60"
                              style={{ height: `${Math.max(heightPct, 5)}%` }}
                              title={`₹${m.revenue.toLocaleString('en-IN')}`}
                            >
                              <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-zinc-400 group-hover:block">
                                ₹{m.revenue.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-white/30">{MONTH_NAMES[m._id.month - 1]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="card-dark overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-white/5 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="heading-panel">Bookings</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    <span className="text-white/55">{bookingsTotal.toLocaleString('en-IN')} total</span>
                    <span className="text-white/25"> · </span>
                    <span>
                      {bookingsRangeLabel(bookingsTotal, bookingsPage, bookingsLimit, bookings.length)}
                    </span>
                  </p>
                </div>
                <BookingsPaginationBar page={bookingsPage} pages={bookingsPages} onGo={goBookingsPage} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Customer', 'Package', 'Date & Time', 'Amount', 'Status', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-white/30"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {bookings.map((b) => (
                      <tr key={b._id} className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-5 py-4">
                          <p className="font-medium text-white/80">{b.userName}</p>
                          <p className="text-xs text-white/35">{b.userEmail}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="glass-gold rounded-lg px-2 py-1 text-xs text-zinc-400/80">{b.packageName}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-xs text-white/70">{format(new Date(b.date), 'MMM d, yyyy')}</p>
                          <p className="text-xs text-white/40">{b.timeSlot}</p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-zinc-400/80">
                          ₹{b.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${
                              b.status === 'confirmed'
                                ? 'border-white/25 bg-white/10 text-white'
                                : b.status === 'cancelled'
                                  ? 'border-zinc-700 bg-zinc-900/80 text-zinc-500'
                                  : b.status === 'completed'
                                    ? 'border-zinc-600/40 bg-zinc-800/40 text-zinc-300'
                                    : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={b.status}
                            onChange={(e) => updateBookingStatus(b._id, e.target.value)}
                            className="cursor-pointer rounded border border-white/10 bg-white/5 px-2 py-2 text-xs text-white/60 focus:border-zinc-500/30 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                          >
                            {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                              <option key={s} value={s} className="bg-surface">
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bookings.length === 0 && (
                  <div className="py-16 text-center text-white/25">No bookings found.</div>
                )}
              </div>
              <div className="flex flex-col items-stretch justify-between gap-3 border-t border-white/5 p-4 sm:flex-row sm:items-center">
                <p className="text-center text-xs text-white/30 sm:text-left">
                  {bookingsRangeLabel(bookingsTotal, bookingsPage, bookingsLimit, bookings.length)}
                </p>
                <BookingsPaginationBar page={bookingsPage} pages={bookingsPages} onGo={goBookingsPage} />
              </div>
            </div>
          )}

          {activeTab === 'slots' && (
            <div className="max-w-lg">
              <div className="card-dark p-6">
                <h3 className="heading-panel mb-5">Block a Time Slot</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Date</label>
                    <input
                      type="date"
                      value={blockDate}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      onChange={(e) => setBlockDate(e.target.value)}
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">
                      Time (24h format, e.g. 14:00)
                    </label>
                    <input
                      type="time"
                      value={blockTime}
                      onChange={(e) => setBlockTime(e.target.value)}
                      className="input-dark"
                      step={3600}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">
                      Reason (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maintenance, Private booking"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      className="input-dark"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleBlockSlot}
                    disabled={blockLoading || !blockDate || !blockTime}
                    className="w-full rounded-xl border border-zinc-600 bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {blockLoading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Block this slot'}
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

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen animated-bg">
          <Navbar />
          <div className="flex min-h-[80vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
