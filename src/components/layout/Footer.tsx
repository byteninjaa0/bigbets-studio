import Link from 'next/link';
import { Mic2, Instagram, Youtube, Twitter, Mail, Phone } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { PageContainer } from './PageContainer';

export default function Footer() {
  const { social } = siteConfig;

  return (
    <footer className="border-t border-zinc-800 bg-[#0a0a0a]">
      <PageContainer className="py-12 md:py-16">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8 lg:gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-400 to-zinc-600 flex items-center justify-center">
                <Mic2 className="w-5 h-5 text-black" />
              </div>
              <span className="font-sans font-black text-xl">
                <span className="text-gradient-gold">BigBets</span>
                <span className="text-white/90"> Studio</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-md mb-6">{siteConfig.shortDescription}</p>
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
                  className="w-9 h-9 rounded-xl glass border border-white/6 flex items-center justify-center text-white/30 hover:text-zinc-400 hover:border-zinc-500/30 transition-all duration-200"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-5">Quick Links</h4>
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
                    className="text-white/40 text-sm hover:text-zinc-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-5">Contact</h4>
            <ul className="space-y-3 text-sm text-white/40">
              <li>{siteConfig.address.line1}</li>
              <li>{siteConfig.address.line2}</li>
              <li>
                <a
                  href={`tel:+${siteConfig.phoneE164}`}
                  className="inline-flex items-center gap-2 hover:text-zinc-400 transition-colors duration-200"
                >
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex items-center gap-2 hover:text-zinc-400 transition-colors duration-200 break-all"
                >
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row">
          <p className="text-white/25 text-xs">© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((item) => (
              <a key={item} href="#" className="text-white/25 text-xs hover:text-white/50 transition-colors duration-200">
                {item}
              </a>
            ))}
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
