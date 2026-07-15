import { useState, useEffect } from 'react';
import PageBanner from '../components/common/PageBanner';
import AboutIntro from '../components/About/AboutIntro';
import MissionVision from '../components/About/MissionVision';
import CoreValues from '../components/About/CoreValues';
import Timeline from '../components/About/Timeline';
import FounderMessage from '../components/About/FounderMessage';
import Facilities from '../components/About/Facilities';
import AboutAchievements from '../components/About/AboutAchievements';
import AboutCTA from '../components/About/AboutCTA';
import aboutService from '../services/aboutService';

export default function AboutPage() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await aboutService.getPublicAbout();
        if (!cancelled) {
          setAbout(res?.data || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load about content');
          console.warn('About content unavailable, using defaults');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-soft">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-body font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const a = about || {};
  const c = a.content || {};
  const title = a.title || 'About Jamia Tul Uloom Muhammadiya';
  const description = a.description || 'Preserving authentic Islamic knowledge through modern education since 1998.';
  const subtitle = a.subtitle || '';

  return (
    <>
      <PageBanner
        title={title}
        description={description}
        breadcrumbs={[
          { label: 'Home', href: '#home' },
          { label: 'About' },
        ]}
      />
      <AboutIntro data={{ title, subtitle, description, image: a.images?.[0] }} />
      <MissionVision mission={c.mission} vision={c.vision} />
      <CoreValues values={c.coreValues || []} />
      <Timeline history={c.history || []} />
      <FounderMessage message={c.principalMessage || c.founderMessage || null} />
      <Facilities />
      <AboutAchievements />
      <AboutCTA />
    </>
  );
}
