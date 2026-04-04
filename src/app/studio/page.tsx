import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Features from '@/components/home/Features';
import Gallery from '@/components/home/Gallery';
import { PageContainer } from '@/components/layout/PageContainer';

export const metadata = {
  title: 'Studio – BigBets Studio',
  description: 'Professional podcast and video studio in Ghaziabad — gear, room, and how we work.',
};

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-16 sm:pt-[4.5rem]">
        <section className="border-b border-white/[0.06] py-12 md:py-16">
          <PageContainer>
            <h1 className="font-sans text-3xl font-black text-white sm:text-4xl md:text-5xl">
              The studio
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/55 sm:text-lg">
              Treated room, pro mics, ATEM Mini Pro switching, and a 4K pipeline — everything we run for your session.
            </p>
          </PageContainer>
        </section>
        <Features />
        <Gallery />
      </div>
      <Footer />
    </main>
  );
}
