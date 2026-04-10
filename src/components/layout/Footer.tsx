import Link from 'next/link';
import { Mic2, Instagram, Youtube, Twitter, Mail, Phone } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { PageContainer } from './PageContainer';

export default function Footer() {
  const { social } = siteConfig;

  return (
    <footer className="border-t border-zinc-800 bg-surface">
      <PageContainer className="py-12 md:py-16">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8 lg:gap-12">
          <div className="md:col-span-2">
            <Link
              href="/"
              aria-label={`${siteConfig.name} home`}
              className="group mb-5 inline-flex items-center gap-2 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-400 to-zinc-600">
                <Mic2 className="h-5 w-5 text-black" />
              </div>
              <span className="font-sans text-xl font-black tracking-tight text-white">
                <span className="text-gradient-gold">BigBets</span>
                <span className="text-zinc-200"> Studio</span>
              </span>
            </Link>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-zinc-400">{siteConfig.shortDescription}</p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: social.instagram },
                { icon: Youtube, href: social.youtube },
                { icon: Twitter, href: social.twitter },
              ].map(({ icon: Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 transition-all duration-200 hover:border-zinc-500/40 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="heading-list-label mb-5 text-zinc-300">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'Studio', href: '/studio' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Contact', href: '/contact' },
                { label: 'Book Now', href: siteConfig.urls.booking },
                { label: 'Dashboard', href: '/dashboard' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors duration-200 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="heading-list-label mb-5 text-zinc-300">Contact</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li>{siteConfig.address.line1}</li>
              <li>{siteConfig.address.line2}</li>
              <li>
                <a
                  href={`tel:+${siteConfig.phoneE164}`}
                  className="inline-flex items-center gap-2 text-zinc-400 transition-colors duration-200 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex items-center gap-2 break-all text-zinc-400 transition-colors duration-200 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-zinc-500 transition-colors duration-200 hover:text-zinc-300 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
