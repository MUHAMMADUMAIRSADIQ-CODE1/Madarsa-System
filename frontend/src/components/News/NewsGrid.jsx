import SectionTitle from '../common/SectionTitle';

function NewsCard({ article, index }) {
  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-accent-soft h-48 sm:h-56">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-primary text-white text-xs font-semibold uppercase rounded-full tracking-wider">
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-border-light">
          <span className="text-xs text-text-light font-medium">
            {new Date(article.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="text-xs text-text-light font-medium">{article.readTime} min read</span>
        </div>

        <h3 className="font-heading font-semibold text-lg text-text-dark mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>

        <p className="text-text-body text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
          {article.description}
        </p>

        <a
          href="#"
          className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all group-hover:text-gold"
        >
          Read More
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}

export default function NewsGrid({ news, selectedCategory, onCategoryChange, categories }) {
  const filteredNews = selectedCategory === 'all'
    ? news
    : news.filter(item => item.categoryId === selectedCategory);

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Latest Updates"
          title="Academy News & Events"
          description="Stay informed with our latest announcements, admissions news, and academy updates."
        />

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mt-8 mb-10">
          <button
            onClick={() => onCategoryChange('all')}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-accent-soft text-primary hover:bg-accent'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-accent-soft text-primary hover:bg-accent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-text-light text-lg">No news found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredNews.map((article, i) => (
              <NewsCard key={article.id} article={article} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
