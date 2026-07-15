import Hero from '../components/Hero/Hero';
import Stats from '../components/Stats/Stats';
import WhyChooseUs from '../components/WhyChooseUs/WhyChooseUs';
import Courses from '../components/Courses/Courses';
import Teachers from '../components/Teachers/Teachers';
import Testimonials from '../components/Testimonials/Testimonials';
import Gallery from '../components/Gallery/Gallery';
import Announcements from '../components/Announcements/Announcements';
import CTA from '../components/CTA/CTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <WhyChooseUs />
      <Courses />
      <Teachers />
      <Testimonials />
      <Gallery />
      <Announcements />
      <CTA />
    </>
  );
}