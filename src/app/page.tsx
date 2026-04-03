import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import SocialProof from '@/components/home/SocialProof';
import Features from '@/components/home/Features';
import Packages from '@/components/home/Packages';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import Gallery from '@/components/home/Gallery';
import FAQ from '@/components/home/FAQ';
import Contact from '@/components/home/Contact';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <Packages />
      <HowItWorks />
      <Testimonials />
      <Gallery />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
