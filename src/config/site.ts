/**
 * Central site copy & contact — import from here instead of hardcoding across the app.
 * Studio images live in /public/photos (URL path /photos/...).
 */

export const siteConfig = {
  name: 'BigBets Studio',
  shortDescription:
    'Podcast and video recording studio in Crossing Republik, Ghaziabad — book online, record with pro audio and multi-cam switching.',

  phone: '8368871848',
  /** E.164 without + for tel: and wa.me */
  phoneE164: '918368871848',
  phoneDisplay: '+91 83688 71848',

  email: 'contact.bigbetsai@gmail.com',

  /** Default WhatsApp (digits only, country code). Override with NEXT_PUBLIC_WHATSAPP_NUMBER. */
  whatsappE164: '918368871848',

  address: {
    line1: '803B Tower 2A, Panchsheel Wellington',
    line2: 'Crossing Republik, Ghaziabad',
    postal: 'UP 201016',
    full: '803B Tower 2A, Panchsheel Wellington, Crossing Republik, Ghaziabad, UP 201016',
    mapsSearchUrl:
      'https://www.google.com/maps/search/?api=1&query=803B+Tower+2A+Panchsheel+Wellington+Crossing+Republik+Ghaziabad',
    /** Works without Maps Embed API key */
    mapsEmbedUrl:
      'https://maps.google.com/maps?q=803B+Tower+2A,+Panchsheel+Wellington,+Crossing+Republik,+Ghaziabad,+201016&t=&z=15&ie=UTF8&iwloc=&output=embed',
  },

  /** Primary video switcher / capture (per product requirements) */
  equipment: ['ATEM Mini Pro'] as const,

  /** Full gear list for features / FAQ-style copy */
  equipmentDetails: [
    'Blackmagic ATEM Mini Pro',
    'Studio condenser & dynamic microphones',
    '4K camera pipeline with professional framing',
    'Acoustic treatment & sound-isolated recording space',
    'Studio lighting (soft LED / key-fill)',
    'Headphones & audio interface for monitoring',
  ] as const,

  /**
   * Gallery images under public/photos — replace files anytime; keep filenames in sync.
   * If a file is missing, the Gallery component shows a graceful fallback for that slot.
   */
  /**
   * Paths must match files in public/photos (extension matters: .jpeg vs .jpg).
   * Append more { src, alt, caption } entries when you add studio-5.jpeg, etc.
   */
  gallery: [
    {
      src: '/photos/studio-1.jpeg',
      alt: 'Podcast microphones and studio desk at BigBets Studio',
      caption: 'Recording desk & microphones',
    },
    {
      src: '/photos/studio-2.jpeg',
      alt: 'Professional microphone close-up in treated studio',
      caption: 'Vocal capture',
    },
    {
      src: '/photos/studio-3.jpeg',
      alt: 'Podcast recording studio interior with lighting',
      caption: 'Studio interior',
    },
    {
      src: '/photos/studio-4.jpeg',
      alt: 'Video and podcast production setup',
      caption: 'Production setup',
    },
  ] as const,

  social: {
    instagram: 'https://www.instagram.com/',
    youtube: 'https://www.youtube.com/',
    twitter: 'https://twitter.com/',
  },

  urls: {
    booking: '/booking',
  },
} as const;

export type SiteConfig = typeof siteConfig;

export function getWhatsAppE164(): string {
  const raw = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER : undefined;
  if (raw) return raw.replace(/\D/g, '');
  return siteConfig.whatsappE164;
}
