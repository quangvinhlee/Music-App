import { Skeleton } from "@/components/ui/skeleton";

// Playlist Page Skeleton Components
export function PlaylistHeroSkeleton() {
  return (
    <div className="relative w-full h-80 sm:h-96 overflow-hidden">
      <div className="relative z-10 p-6 sm:p-8 md:p-12 h-full flex flex-col justify-end">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
          {/* Playlist Artwork Skeleton */}
          <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-2xl bg-gray-700/50" />
          
          {/* Playlist Info Skeleton */}
          <div className="text-white space-y-4 flex-1 min-w-0">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 bg-gray-700/50" />
              <Skeleton className="h-12 w-64 bg-gray-700/50" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-4 w-32 bg-gray-700/50" />
              <Skeleton className="h-4 w-24 bg-gray-700/50" />
              <Skeleton className="h-4 w-20 bg-gray-700/50" />
            </div>
            <Skeleton className="h-12 w-32 bg-gray-700/50" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TracksSectionSkeleton() {
  return (
    <div className="px-6 sm:px-8 md:px-12 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-24 bg-gray-700/50 mb-2" />
            <Skeleton className="h-4 w-32 bg-gray-700/50" />
          </div>
          <Skeleton className="h-10 w-32 bg-gray-700/50" />
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex gap-4 items-center p-4 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700/30"
            >
              <Skeleton className="w-16 h-16 rounded-xl bg-gray-600/50" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-48 bg-gray-600/50" />
                <Skeleton className="h-4 w-32 bg-gray-600/50" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-12 bg-gray-600/50" />
                <Skeleton className="w-8 h-8 rounded-full bg-gray-600/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PlaylistPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PlaylistHeroSkeleton />
      <TracksSectionSkeleton />
    </div>
  );
}

// Me Page Skeleton Components
export function ProfileHeaderSkeleton() {
  return (
    <div className="relative w-full h-80 sm:h-96 overflow-hidden">
      <div className="relative z-10 p-6 sm:p-8 md:p-12 h-full flex flex-col justify-end">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
          {/* Profile Avatar Skeleton */}
          <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gray-700/50" />
          
          {/* Profile Info Skeleton */}
          <div className="text-white space-y-4 flex-1 min-w-0">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-gray-700/50" />
              <Skeleton className="h-4 w-32 bg-gray-700/50" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-4 w-24 bg-gray-700/50" />
              <Skeleton className="h-4 w-20 bg-gray-700/50" />
              <Skeleton className="h-4 w-28 bg-gray-700/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TabsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-24 bg-gray-700/50 rounded-full" />
      ))}
    </div>
  );
}

export function ContentGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-32 bg-gray-700/50" />
        <Skeleton className="h-10 w-32 bg-gray-700/50" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="w-full aspect-square rounded-xl bg-gray-700/50" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4 bg-gray-700/50" />
              <Skeleton className="h-3 w-1/2 bg-gray-700/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ProfileHeaderSkeleton />
      <div className="px-6 sm:px-8 md:px-12 py-8">
        <TabsSkeleton />
        <ContentGridSkeleton />
      </div>
    </div>
  );
} 