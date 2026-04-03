'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic2, ShoppingCart, Menu, X, ChevronDown, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { PageContainer } from './PageContainer';

const navLinks = [
  { label: 'Packages', href: '/#packages' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'Contact', href: '/#contact' },
];

export default function Navbar() {
  const { data: session } = useSession();
  const { item } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [userMenuOpen]);

  const closeMobile = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'border-b border-white/[0.08] bg-black/85 backdrop-blur-xl shadow-[0_1px_0_0_rgba(255,255,255,0.04)]'
          : 'border-b border-transparent bg-black/40 backdrop-blur-md'
      }`}
    >
      <PageContainer>
        <nav className="flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]" aria-label="Main">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5 group">
            <div className="relative shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-400 to-zinc-600 shadow-lg transition-transform duration-200 group-hover:scale-[1.02]">
                <Mic2 className="h-5 w-5 text-black" />
              </div>
            </div>
            <span className="font-display text-lg font-black tracking-tight sm:text-xl">
              <span className="text-gradient-gold">BigBets</span>
              <span className="text-white/90"> Studio</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-400 transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {item && (
              <Link
                href="/booking"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] transition-all duration-200 hover:scale-[1.02] hover:border-zinc-600 hover:bg-zinc-900"
                aria-label="Continue booking"
              >
                <ShoppingCart className="h-5 w-5 text-zinc-400" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">
                  1
                </span>
              </Link>
            )}

            {session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex h-11 max-w-[200px] items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-900"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-zinc-400 to-zinc-600 text-xs font-bold text-black">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      session.user?.name?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <span className="hidden min-w-0 truncate text-sm font-medium text-white/80 lg:block">
                    {session.user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/95 shadow-2xl backdrop-blur-xl"
                      role="menu"
                    >
                      <div className="border-b border-white/[0.06] px-4 py-3">
                        <p className="truncate text-sm font-semibold text-white">{session.user?.name}</p>
                        <p className="truncate text-xs text-white/40">{session.user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href="/dashboard"
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          My Dashboard
                        </Link>
                        {session.user?.isAdmin && (
                          <Link
                            href="/admin"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-500/10 hover:text-zinc-200"
                          >
                            <Shield className="h-4 w-4" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="hidden h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-white/70 transition-all duration-200 hover:border-zinc-500/40 hover:bg-white/[0.05] hover:text-white sm:inline-flex"
              >
                Sign In
              </Link>
            )}

            <a
              href="#packages"
              className="hidden h-11 items-center justify-center rounded-xl border border-zinc-600 bg-white px-5 text-sm font-semibold text-black transition-all duration-200 hover:scale-[1.02] hover:border-zinc-400 hover:bg-zinc-100 md:inline-flex"
            >
              Book Now
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] transition-all duration-200 hover:bg-zinc-900 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
          </div>
        </nav>
      </PageContainer>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm md:hidden"
              aria-label="Close menu"
              onClick={closeMobile}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed bottom-0 right-0 top-0 z-[70] flex w-[min(100%,20rem)] flex-col border-l border-white/[0.08] bg-zinc-950 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <span className="font-display text-lg font-black text-white">Menu</span>
                <button
                  type="button"
                  onClick={closeMobile}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
                <ul className="space-y-1">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={closeMobile}
                        className="block rounded-xl px-4 py-3.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-6">
                  {session?.user ? (
                    <>
                      <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-zinc-400 to-zinc-600 text-sm font-bold text-black">
                          {session.user.image ? (
                            <img src={session.user.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            session.user.name?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="truncate text-sm font-semibold text-white">{session.user.name}</p>
                          <p className="truncate text-xs text-white/40">{session.user.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={closeMobile}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-600 text-sm font-medium text-white transition-all duration-200 hover:bg-zinc-900"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      {session.user.isAdmin && (
                        <Link
                          href="/admin"
                          onClick={closeMobile}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-900"
                        >
                          <Shield className="h-4 w-4" />
                          Admin
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          closeMobile();
                          signOut({ callbackUrl: '/' });
                        }}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/signin"
                      onClick={closeMobile}
                      className="flex h-12 w-full items-center justify-center rounded-xl border border-zinc-600 text-sm font-medium text-white transition-all hover:bg-zinc-900"
                    >
                      Sign In
                    </Link>
                  )}
                  <a
                    href="#packages"
                    onClick={closeMobile}
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-black transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Book Now
                  </a>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
