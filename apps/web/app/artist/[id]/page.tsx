"use client";

import { useParams } from "next/navigation";
import { useArtistInfo } from "app/query/useSoundcloudQueries";
import { Skeleton } from "@/components/ui/skeleton";
import MusicPlayer from "@/components/MusicPlayer";
import ArtistHeader from "./components/ArtistHeader";
import ArtistTabs from "./components/ArtistTabs";

export default function ArtistPage() {
  const params = useParams();
  const artistId = params.id as string;

  // Fetch artist data using the query hook
  const { data: artist, isLoading, error } = useArtistInfo(artistId);

  if (!artistId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl font-semibold mb-2">Artist not found</div>
        <div className="text-gray-500">
          Please go back to the homepage and select an artist.
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden">
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          <div className="relative z-10 p-6 sm:p-10 md:p-14 h-full flex items-end gap-6">
            <Skeleton className="w-40 h-40 sm:w-52 sm:h-52 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl font-semibold mb-2">Error loading artist</div>
        <div className="text-gray-500">{error.message}</div>
      </div>
    );
  }

  // No artist data found
  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl font-semibold mb-2">Artist not found</div>
        <div className="text-gray-500">
          The artist you're looking for doesn't exist.
        </div>
      </div>
    );
  }

  return (
    <div>
      <ArtistHeader artist={artist} />
      <ArtistTabs artistId={artistId} artistName={artist.username} />

      {/* Sticky Player */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <MusicPlayer />
      </div>
    </div>
  );
}
