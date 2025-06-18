// src/components/home/LoadingSkeleton.tsx
export function LoadingSkeleton() {
  return (
    <div className="space-y-4 px-6 py-8">
      <div className="h-64 bg-gray-200 animate-pulse rounded" />
      <div className="h-8 bg-gray-200 animate-pulse rounded" />
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
}
