export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}

export function SkeletonSummaryCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-5 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTeacherCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  );
}

export function SkeletonActivityItem() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2 pb-6">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function StudentLoadingState() {
  return (
    <div className="space-y-6">
      {/* Welcome Skeletons */}
      <div className="bg-gradient-to-r from-primary/20 via-primary-dark/20 to-primary-dark/20 rounded-2xl p-8 animate-pulse">
        <div className="h-8 bg-white/20 rounded w-1/3 mb-3" />
        <div className="h-4 bg-white/20 rounded w-1/4 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/10 rounded-lg p-4">
              <div className="h-3 bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-6 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonSummaryCard key={i} />
        ))}
      </div>

      {/* Main Content Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonCard />
          <SkeletonTeacherCard />
        </div>
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
