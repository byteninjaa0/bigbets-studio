'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { PageContainer } from '@/components/layout/PageContainer';

function GalleryImage({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  const [broken, setBroken] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group min-w-0 w-full"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-950 shadow-sm ring-1 ring-black/20 transition-[box-shadow,transform] duration-300 ease-out hover:shadow-lg hover:shadow-black/40 hover:ring-zinc-700/50 sm:rounded-2xl">
        {!broken ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition duration-500 ease-out group-hover:scale-[1.03] group-hover:brightness-[1.06]"
            onError={() => setBroken(true)}
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-900/90 p-4 text-center">
            <ImageOff className="h-8 w-8 text-zinc-600" aria-hidden />
            <p className="text-xs leading-snug text-zinc-500">
              Add <span className="font-sans text-zinc-400">{src.replace('/photos/', '')}</span> to{' '}
              <span className="font-sans text-zinc-400">public/photos</span>
            </p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95" />
        <p className="absolute bottom-0 left-0 right-0 px-4 py-3 text-sm font-medium tracking-tight text-white/95 drop-shadow-sm">
          {caption}
        </p>
      </div>
    </motion.div>
  );
}

export default function Gallery() {
  const items = siteConfig.gallery;
  const hasAnySlot = items.length > 0;

  return (
    <section className="relative overflow-x-hidden py-12 md:py-20 animated-bg">
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center md:mb-12"
        >
          <span className="section-eyebrow">Studio Gallery</span>
          <h2 className="heading-section mb-4">
            See Our <span className="text-gradient-gold italic">Space</span>
          </h2>
          <p className="mx-auto max-w-xl break-words px-1 text-sm leading-relaxed text-zinc-500">
            Real photos from our Ghaziabad studio. Update them anytime to match your latest setup.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        {hasAnySlot ? (
          <div
            className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
            role="list"
          >
            {items.map((item) => (
              <div key={item.src} className="min-w-0" role="listitem">
                <GalleryImage src={item.src} alt={item.alt} caption={item.caption} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 px-6 py-14 text-center sm:px-8 sm:py-16">
            <p className="mb-1 text-sm font-medium text-white/70">Studio photos</p>
            <p className="mx-auto max-w-md text-sm text-white/40">
              Add JPEG or WebP files to <span className="font-sans text-zinc-500">public/photos</span> and list them in{' '}
              <span className="font-sans text-zinc-500">src/config/site.ts</span> under{' '}
              <span className="font-sans text-zinc-500">gallery</span>.
            </p>
          </div>
        )}
      </PageContainer>
    </section>
  );
}
