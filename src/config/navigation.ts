/** Primary marketing navigation — used by Navbar (desktop + mobile). */
export const mainNavLinks = [
  { name: 'Home', href: '/' },
  { name: 'Studio', href: '/studio' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Contact', href: '/contact' },
] as const;

export type MainNavLink = (typeof mainNavLinks)[number];
