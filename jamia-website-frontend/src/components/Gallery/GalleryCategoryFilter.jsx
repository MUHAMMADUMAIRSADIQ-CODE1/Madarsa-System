export default function GalleryCategoryFilter({ selectedCategory, onCategoryChange, categories }) {
  return (
    <section className="py-8 lg:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                  : 'bg-accent-soft text-primary hover:bg-accent border border-accent/30 hover:border-primary/30'
              }`}
              aria-pressed={selectedCategory === cat.id}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
