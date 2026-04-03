import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Packages from '@/components/home/Packages';

export const metadata = {
  title: 'Pricing – BigBets Studio',
  description: 'Studio packages SET A, B, and C — book your podcast session in Ghaziabad.',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-16 sm:pt-[4.5rem]">
        <Packages />
      </div>
      <Footer />
    </main>
  );
}
