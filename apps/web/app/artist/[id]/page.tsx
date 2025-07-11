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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-2xl font-semibold mb-2 text-white">
            Artist not found
          </div>
          <div className="text-gray-400">
            Please go back to the homepage and select an artist.
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden">
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
          <div className="relative z-10 p-6 sm:p-10 md:p-14 h-full flex items-end gap-6">
            <Skeleton className="w-40 h-40 sm:w-52 sm:h-52 rounded-lg bg-gray-700" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-32 bg-gray-700" />
              <Skeleton className="h-12 w-64 bg-gray-700" />
              <Skeleton className="h-6 w-48 bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-2xl font-semibold mb-2 text-white">
            Error loading artist
          </div>
          <div className="text-gray-400">{error.message}</div>
        </div>
      </div>
    );
  }

  // No artist data found
  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-2xl font-semibold mb-2 text-white">
            Artist not found
          </div>
          <div className="text-gray-400">
            The artist you're looking for doesn't exist.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ArtistHeader artist={artist} />
      <ArtistTabs artistId={artistId} artistName={artist.username} />

      {/* Sticky Player */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <MusicPlayer />
      </div>
    </div>
  );
}
