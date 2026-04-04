'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { PageContainer } from '@/components/layout/PageContainer';

type GridCell = { span: string; aspect: string };

const GRID_LAYOUT_6: GridCell[] = [
  { span: 'md:col-span-2', aspect: 'aspect-[2/1] min-h-[200px]' },
  { span: '', aspect: 'aspect-square min-h-[180px]' },
  { span: '', aspect: 'aspect-square min-h-[180px]' },
  { span: '', aspect: 'aspect-[4/3] min-h-[200px]' },
  { span: '', aspect: 'aspect-[4/3] min-h-[200px]' },
  { span: 'md:col-span-2', aspect: 'aspect-[2/1] min-h-[200px]' },
];

/** Balanced 3-column layout for exactly four images */
const GRID_LAYOUT_4: GridCell[] = [
  { span: 'md:col-span-2', aspect: 'aspect-[2/1] min-h-[220px]' },
  { span: '', aspect: 'aspect-square min-h-[200px]' },
  { span: '', aspect: 'aspect-square min-h-[200px]' },
  { span: 'md:col-span-2', aspect: 'aspect-[2/1] min-h-[220px]' },
];

function getGalleryLayout(index: number, total: number): GridCell {
  if (total === 4) return GRID_LAYOUT_4[index] ?? GRID_LAYOUT_4[GRID_LAYOUT_4.length - 1];
  return GRID_LAYOUT_6[index % GRID_LAYOUT_6.length];
}

function GalleryImage({
  src,
  alt,
  caption,
  layout,
}: {
  src: string;
  alt: string;
  caption: string;
  layout: GridCell;
}) {
  const [broken, setBroken] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className={`relative ${layout.span} ${layout.aspect} rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 group`}
    >
      {!broken ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.04] group-hover:brightness-110"
          onError={() => setBroken(true)}
          priority={false}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-900/90 p-4 text-center">
          <ImageOff className="w-8 h-8 text-zinc-600" aria-hidden />
          <p className="text-xs text-zinc-500 leading-snug">
            Add <span className="font-sans text-zinc-400">{src.replace('/photos/', '')}</span> to{' '}
            <span className="font-sans text-zinc-400">public/photos</span>
          </p>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
      <p className="absolute bottom-0 left-0 right-0 px-4 py-3 text-sm font-medium text-white/90">{caption}</p>
    </motion.div>
  );
}

export default function Gallery() {
  const items = siteConfig.gallery;
  const hasAnySlot = items.length > 0;

  return (
    <section className="relative py-12 md:py-20 animated-bg">
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center md:mb-12"
        >
          <span className="glass-gold text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full inline-block mb-4">
            Studio Gallery
          </span>
          <h2 className="mb-4 font-sans text-3xl font-black text-white sm:text-4xl md:text-5xl">
            See Our{' '}
            <span className="text-gradient-gold italic">Space</span>
          </h2>
          <p className="mx-auto max-w-xl break-words px-1 text-sm text-white/45">
            Real photos from our Ghaziabad studio {' '}
            anytime to match your latest setup.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        {hasAnySlot ? (
          <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
            {items.map((item, i) => (
              <GalleryImage
                key={item.src}
                src={item.src}
                alt={item.alt}
                caption={item.caption}
                layout={getGalleryLayout(i, items.length)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 px-8 py-16 text-center">
            <p className="text-white/70 text-sm font-medium mb-1">Studio photos</p>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              Add JPEG or WebP files to <span className="font-sans text-zinc-500">public/photos</span> and list them in{' '}
              <span className="font-sans text-zinc-500">src/config/site.ts</span> under <span className="font-sans text-zinc-500">gallery</span>.
            </p>
          </div>
        )}
      </PageContainer>
    </section>
  );
}
