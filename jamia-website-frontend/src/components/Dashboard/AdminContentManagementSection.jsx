import { adminDashboardData } from '../../data/adminDashboardData';

export default function AdminContentManagementSection() {
  const contentItems = [
    { id: 1, title: 'Hero Section', path: 'website-content > hero', items: 2 },
    { id: 2, title: 'About Page', path: 'website-content > about', items: 3 },
    { id: 3, title: 'Courses', path: 'website-content > courses', items: 12 },
    { id: 4, title: 'Teachers', path: 'website-content > teachers', items: 28 },
    { id: 5, title: 'Gallery', path: 'website-content > gallery', items: 35 },
    { id: 6, title: 'News', path: 'website-content > news', items: 24 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-text-dark">Website Content</h2>
        <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-dark transition-colors">
          + Add Page
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contentItems.map((item) => (
          <div
            key={item.id}
            className="p-4 border-2 border-border-light rounded-xl hover:border-primary hover:shadow-md transition-all cursor-pointer"
          >
            <h3 className="font-semibold text-text-dark text-lg mb-2">{item.title}</h3>
            <p className="text-xs text-text-light mb-4">{item.path}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-body">{item.items} items</span>
              <button className="px-3 py-1 text-primary border-2 border-primary rounded-lg text-xs font-semibold hover:bg-primary hover:text-white transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
