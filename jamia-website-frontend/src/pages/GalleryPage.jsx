import { useState, useMemo } from 'react';
import PageBanner from '../components/common/PageBanner';
import GalleryCategoryFilter from '../components/Gallery/GalleryCategoryFilter';
import GalleryGrid from '../components/Gallery/GalleryGrid';
import FeaturedEvent from '../components/Gallery/FeaturedEvent';
import VideoGallery from '../components/Gallery/VideoGallery';
import GalleryCTA from '../components/Gallery/GalleryCTA';
import CTA from '../components/CTA/CTA';
import { galleryData } from '../data/galleryData';

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredImages = useMemo(() => {
    if (selectedCategory === 'all') {
      return galleryData.images;
    }
    return galleryData.images.filter(img => img.categoryId === selectedCategory);
  }, [selectedCategory]);

  return (
    <div>
      <PageBanner
        title="Academy Gallery"
        description="Explore moments from our academy life, campus facilities, and educational activities."
        breadcrumbs={[{ label: 'Home', href: '#home' }, { label: 'Gallery' }]}
      />

      <GalleryCategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={galleryData.categories}
      />

      <GalleryGrid images={filteredImages} />

      <FeaturedEvent featured={galleryData.featured} />

      <VideoGallery videos={galleryData.videos} />

      <GalleryCTA />

      <CTA />
    </div>
  );
}
