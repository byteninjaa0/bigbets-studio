import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Contact from '@/components/home/Contact';

export const metadata = {
  title: 'Contact – BigBets Studio',
  description: 'Reach BigBets Studio in Crossing Republik, Ghaziabad — phone, email, WhatsApp, and map.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-16 sm:pt-[4.5rem]">
        <Contact />
      </div>
      <Footer />
    </main>
  );
}
