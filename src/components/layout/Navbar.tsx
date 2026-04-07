'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, ChevronDown, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { PageContainer } from './PageContainer';
import { mainNavLinks } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

function navItemIsActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const cartCount = useCart((s) => s.items.length);
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
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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

  const closeMobile = useCallback(() => setMenuOpen(false), []);

  const desktopLinkClass = (href: string) =>
    cn(
      'relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
      'text-white/75 hover:text-white',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
      'after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-200 hover:after:scale-x-100',
      navItemIsActive(pathname, href) && 'text-white after:scale-x-100 after:bg-white'
    );

  const mobileLinkClass = (href: string) =>
    cn(
      'block rounded-xl px-4 py-4 text-lg font-medium transition-colors duration-200',
      'text-white/90 hover:bg-white/[0.08] hover:text-white',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-500',
      navItemIsActive(pathname, href) && 'bg-white/[0.08] text-white'
    );

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-[100] transition-[box-shadow,border-color] duration-200',
        /* Solid bar at all scroll positions — avoids mobile bugs where backdrop-blur thins perceived opacity */
        'border-b border-zinc-900 bg-zinc-950',
        scrolled && 'border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.65)]'
      )}
    >
      <PageContainer>
        <nav
          className="flex h-16 items-center justify-between gap-3 sm:h-20 sm:gap-4"
          aria-label="Primary"
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label={`${siteConfig.name} home`}
            className="group flex min-w-0 shrink-0 items-center pr-1"
          >
            <Image
              src={siteConfig.logoPath}
              alt=""
              width={240}
              height={96}
              className="h-10 w-auto max-h-10 max-w-[min(13rem,52vw)] object-contain object-left transition-opacity duration-200 group-hover:opacity-90 sm:h-12 sm:max-h-12 sm:max-w-[16rem] md:max-w-[18rem]"
              priority
            />
          </Link>

          {/* Desktop: centered nav — avoids flex squeeze hiding links */}
          <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
            <ul className="flex items-center gap-2 md:gap-4 lg:gap-6 xl:gap-8">
              {mainNavLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={desktopLinkClass(link.href)} aria-current={navItemIsActive(pathname, link.href) ? 'page' : undefined}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions — isolate above page content; hamburger stays high-contrast on scroll */}
          <div className="relative z-[1] flex shrink-0 items-center gap-2 sm:gap-3">
            {cartCount > 0 && (
              <Link
                href="/booking"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-zinc-950 transition-all duration-200 hover:border-zinc-500 hover:bg-zinc-900 sm:h-11 sm:w-11"
                aria-label={`Cart, ${cartCount} session${cartCount !== 1 ? 's' : ''}`}
              >
                <ShoppingCart className="h-5 w-5 text-zinc-200" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1.25rem] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              </Link>
            )}

            {session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex h-10 max-w-[11rem] items-center gap-2 rounded-xl border border-white/15 bg-zinc-950 px-2.5 transition-all duration-200 hover:border-zinc-500 hover:bg-zinc-900 sm:h-11 sm:px-3"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Account menu"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-zinc-400 to-zinc-600 text-xs font-bold text-black">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      session.user?.name?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <span className="hidden min-w-0 truncate text-sm font-medium text-white sm:block">
                    {session.user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200',
                      userMenuOpen && 'rotate-180'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-[60] mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
                      role="menu"
                    >
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-white">{session.user?.name}</p>
                        <p className="truncate text-xs text-zinc-400">{session.user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href="/dashboard"
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-200 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          My Dashboard
                        </Link>
                        {session.user?.isAdmin && (
                          <Link
                            href="/admin"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
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
                className="hidden h-10 items-center justify-center rounded-xl border border-white/20 px-3 text-sm font-medium text-white transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-900 sm:inline-flex sm:h-11 sm:px-4"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/booking"
              className="hidden h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-black transition-all duration-200 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:inline-flex md:h-11 md:px-5"
            >
              Book Now
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/25 bg-black text-white shadow-[0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 hover:border-white/40 hover:bg-zinc-900 md:hidden"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              <Menu className="h-5 w-5 shrink-0 text-white" strokeWidth={2.25} aria-hidden />
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
              className="fixed inset-0 z-[105] bg-black/85 backdrop-blur-sm md:hidden"
              aria-label="Close menu"
              onClick={closeMobile}
            />
            <motion.aside
              id="mobile-navigation"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed bottom-0 right-0 top-0 z-[110] flex w-[min(100%,22rem)] flex-col border-l border-white/10 bg-zinc-950 shadow-2xl md:hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-nav-title"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <span id="mobile-nav-title" className="heading-dialog">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={closeMobile}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/15 text-white transition-colors hover:bg-white/10"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-4" aria-label="Mobile">
                <ul className="space-y-1">
                  {mainNavLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={closeMobile}
                        className={mobileLinkClass(link.href)}
                        aria-current={navItemIsActive(pathname, link.href) ? 'page' : undefined}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto space-y-3 border-t border-white/10 pt-6">
                  {cartCount > 0 && (
                    <Link
                      href="/booking"
                      onClick={closeMobile}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-500/40 bg-zinc-900 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Cart ({cartCount})
                    </Link>
                  )}
                  <Link
                    href="/booking"
                    onClick={closeMobile}
                    className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-white text-base font-semibold text-black transition-all duration-200 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Book Now
                  </Link>
                  {session?.user ? (
                    <>
                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-zinc-400 to-zinc-600 text-sm font-bold text-black">
                          {session.user.image ? (
                            <img src={session.user.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            session.user.name?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="truncate text-sm font-semibold text-white">{session.user.name}</p>
                          <p className="truncate text-xs text-zinc-400">{session.user.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={closeMobile}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-600 text-sm font-medium text-white transition-all hover:bg-zinc-900"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      {session.user.isAdmin && (
                        <Link
                          href="/admin"
                          onClick={closeMobile}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-300 hover:bg-zinc-900"
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
                        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-800 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white"
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
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
