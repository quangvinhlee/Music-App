"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  useSearchTracks,
  useSearchUsers,
  useSearchAlbums,
} from "app/query/useSongQueries";
import { useMusicPlayer } from "app/provider/MusicContext";
import { Search } from "lucide-react";
import { SearchHeader } from "@/components/search/SearchHeader";
import { SearchTabs, TabId } from "@/components/search/SearchTabs";
import { TracksTab } from "@/components/search/TracksTab";
import { UsersTab } from "@/components/search/UsersTab";
import { AlbumsTab } from "@/components/search/AlbumsTab";

// Type definitions for search results
interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  genre: string;
  artwork: string;
  duration: number;
  streamUrl: string;
  playbackCount: number;
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, idx) => (
      <div key={idx} className="bg-gray-100 rounded-xl p-4 animate-pulse">
        <div className="bg-gray-300 aspect-square rounded-lg mb-4"></div>
        <div className="bg-gray-300 h-4 rounded mb-2"></div>
        <div className="bg-gray-300 h-3 rounded w-2/3"></div>
      </div>
    ))}
  </div>
);

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { playFromPlaylist, playSingleSong } = useMusicPlayer();
  const [activeTab, setActiveTab] = useState<TabId>("tracks");
  const query = searchParams.get("q") || "";

  // Search hooks
  const {
    data: tracksData,
    isLoading: tracksLoading,
    error: tracksError,
    fetchNextPage: fetchNextTracks,
    hasNextPage: hasNextTracks,
    isFetchingNextPage: isFetchingNextTracks,
  } = useSearchTracks(query, { enabled: !!query });
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasNextUsers,
    isFetchingNextPage: isFetchingNextUsers,
  } = useSearchUsers(query, { enabled: !!query });
  const {
    data: albumsData,
    isLoading: albumsLoading,
    error: albumsError,
    fetchNextPage: fetchNextAlbums,
    hasNextPage: hasNextAlbums,
    isFetchingNextPage: isFetchingNextAlbums,
  } = useSearchAlbums(query, { enabled: !!query });

  // Flatten pages to combine all results
  const tracks = tracksData?.pages.flatMap((page) => page.tracks || []) || [];
  const users = usersData?.pages.flatMap((page) => page.users || []) || [];
  const albums = albumsData?.pages.flatMap((page) => page.albums || []) || [];

  const handleTrackPlay = (track: Track, index: number) => {
    // For individual track clicks, use playSingleSong to fetch related songs
    playSingleSong(track);
  };

  const handlePlayAllTracks = () => {
    // Add a "Play All" function for when user wants to play all search results
    if (tracks.length > 0) {
      playFromPlaylist(tracks[0], "search-results", 0, tracks);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] text-black">
      <div className="container mx-auto px-4 py-8">
        <SearchHeader query={query} />

        {/* Content */}
        {!query ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Start searching for music
            </h2>
            <p className="text-gray-500">
              Enter a search term above to find tracks, artists, and albums
            </p>
          </div>
        ) : (
          <div className="flex gap-6">
            <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Right Content - Search Results */}
            <div className="flex-1">
              {/* Loading State */}
              {(tracksLoading || usersLoading || albumsLoading) && (
                <LoadingSkeleton />
              )}

              {/* Error State */}
              {(tracksError || usersError || albumsError) &&
                !tracksLoading &&
                !usersLoading &&
                !albumsLoading && (
                  <div className="text-center py-20">
                    <div className="text-red-500 mb-4 text-4xl">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                      Something went wrong
                    </h2>
                    <p className="text-gray-500">
                      Please try searching again or check your connection
                    </p>
                  </div>
                )}

              {/* Results */}
              {!tracksLoading &&
                !usersLoading &&
                !albumsLoading &&
                !tracksError &&
                !usersError &&
                !albumsError && (
                  <>
                    {activeTab === "tracks" && (
                      <TracksTab
                        tracks={tracks}
                        onTrackPlay={handleTrackPlay}
                        onPlayAll={handlePlayAllTracks}
                        hasNextPage={hasNextTracks}
                        isFetchingNextPage={isFetchingNextTracks}
                        fetchNextPage={fetchNextTracks}
                      />
                    )}

                    {activeTab === "users" && (
                      <UsersTab
                        users={users}
                        hasNextPage={hasNextUsers}
                        isFetchingNextPage={isFetchingNextUsers}
                        fetchNextPage={fetchNextUsers}
                      />
                    )}

                    {activeTab === "albums" && (
                      <AlbumsTab
                        albums={albums}
                        hasNextPage={hasNextAlbums}
                        isFetchingNextPage={isFetchingNextAlbums}
                        fetchNextPage={fetchNextAlbums}
                      />
                    )}
                  </>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
