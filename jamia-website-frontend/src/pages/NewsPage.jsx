import { useState } from 'react';
import PageBanner from '../components/common/PageBanner';
import FeaturedAnnouncement from '../components/News/FeaturedAnnouncement';
import NewsGrid from '../components/News/NewsGrid';
import UpcomingEventsTimeline from '../components/News/UpcomingEventsTimeline';
import NewsletterSection from '../components/News/NewsletterSection';
import CTA from '../components/CTA/CTA';
import { newsData } from '../data/newsData';

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div>
      <PageBanner
        title="News & Announcements"
        description="Stay informed with the latest updates, admissions news, and academy announcements."
        breadcrumbs={[{ label: 'Home', href: '#home' }, { label: 'News' }]}
      />

      <FeaturedAnnouncement featured={newsData.featured} />

      <NewsGrid
        news={newsData.news}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={newsData.categories}
      />

      <UpcomingEventsTimeline events={newsData.events} />

      <NewsletterSection />

      <CTA />
    </div>
  );
}
