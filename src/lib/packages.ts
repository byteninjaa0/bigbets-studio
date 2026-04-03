export const PACKAGES = {
  SET_A: {
    id: 'SET_A',
    name: 'SET A',
    tagline: 'Perfect Starter',
    price: 2500,
    weekendPrice: 3000,
    duration: '1 Hour',
    color: 'from-zinc-800 to-zinc-900',
    accentColor: '#fafafa',
    badge: null,
    features: [
      '1-Hour Podcast Recording',
      'Podcast Room Access',
      'Recorded Video & Audio Files',
      'Professional Microphones',
      '4K Camera Setup',
      'Studio Lighting',
      'Podcast Table',
      'Soundproof Room',
      'Headphones Provided',
      'Audio Interface',
    ],
    deliverables: ['Raw video file', 'Raw audio file'],
  },
  SET_B: {
    id: 'SET_B',
    name: 'SET B',
    tagline: 'Most Popular',
    price: 5000,
    weekendPrice: 6000,
    duration: '1 Hour + Editing',
    color: 'from-zinc-800 to-zinc-950',
    accentColor: '#e4e4e7',
    badge: '🔥 TRENDING',
    features: [
      'Everything in SET A',
      'Professional Video Editing',
      '2 Reels (60 secs each)',
      'Professional Microphones',
      '4K Camera Setup',
      'Studio Lighting',
      'Podcast Table',
      'Soundproof Room',
      'Headphones Provided',
      'Audio Interface',
      'Color Grading',
      'Thumbnail Design',
    ],
    deliverables: ['Edited video', 'Raw files', '2 Reels', 'Thumbnail'],
  },
  SET_C: {
    id: 'SET_C',
    name: 'SET C',
    tagline: 'Premium Package',
    price: 6500,
    weekendPrice: 7500,
    duration: '1 Hour + Full Edit',
    color: 'from-stone-800 to-stone-900',
    accentColor: '#a1a1aa',
    badge: '👑 PREMIUM',
    features: [
      'Everything in SET B',
      '3 Extra Short-Form Videos',
      '5 Total Social Media Clips',
      'Professional Microphones',
      '4K Camera Setup',
      'Studio Lighting',
      'Podcast Table',
      'Soundproof Room',
      'Headphones Provided',
      'Audio Interface',
      'Color Grading',
      'Thumbnail Design',
      'Social Media Strategy Tips',
      'Priority Scheduling',
    ],
    deliverables: ['Edited video', 'Raw files', '2 Reels', '3 Shorts', 'Thumbnail', 'Priority support'],
  },
};

// Business hours
export const BUSINESS_HOURS: Record<number, { open: string; close: string } | null> = {
  0: null, // Sunday - Closed
  1: { open: '09:00', close: '19:00' }, // Monday
  2: { open: '09:00', close: '19:00' }, // Tuesday
  3: { open: '09:00', close: '18:00' }, // Wednesday
  4: { open: '09:00', close: '19:00' }, // Thursday
  5: { open: '09:00', close: '19:00' }, // Friday
  6: { open: '09:00', close: '17:00' }, // Saturday
};

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function generateTimeSlots(dayOfWeek: number): string[] {
  const hours = BUSINESS_HOURS[dayOfWeek];
  if (!hours) return [];

  const slots: string[] = [];
  const [openHour] = hours.open.split(':').map(Number);
  const [closeHour] = hours.close.split(':').map(Number);

  for (let h = openHour; h < closeHour; h++) {
    const time = `${h.toString().padStart(2, '0')}:00`;
    slots.push(time);
  }
  return slots;
}

export function formatTimeSlot(time: string): string {
  const [hour] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const endHour = hour + 1;
  const endPeriod = endHour >= 12 ? 'PM' : 'AM';
  const displayEndHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
  return `${displayHour}:00 ${period} – ${displayEndHour}:00 ${endPeriod}`;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function getPackagePrice(packageId: string, date: Date): number {
  const pkg = PACKAGES[packageId as keyof typeof PACKAGES];
  if (!pkg) return 0;
  return isWeekend(date) ? pkg.weekendPrice : pkg.price;
}
