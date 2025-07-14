"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  useSearchTracks,
  useSearchUsers,
  useSearchAlbums,
} from "app/query/useSoundcloudQueries";
import { useMusicPlayer } from "app/provider/MusicContext";
import {
  Search,
  Music,
  User,
  Album,
  TrendingUp,
  ChevronUp,
} from "lucide-react";
import { SearchHeader } from "./components/SearchHeader";
import { SearchTabs, TabId } from "./components/SearchTabs";
import { TracksTab } from "./components/TracksTab";
import { UsersTab } from "./components/UsersTab";
import { AlbumsTab } from "./components/AlbumsTab";
import { MusicItem } from "app/types/music";
import { SearchTracksResponse } from "app/types/music";
import { Artist, SearchUsersResponse } from "app/types/music";

function ShadcnLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-2xl border border-gray-700/50 p-4 hover:shadow-purple-500/10 transition-all duration-300"
        >
          <div className="w-full h-48 bg-gray-600 rounded-lg animate-pulse mb-4"></div>
          <div className="h-4 bg-gray-600 rounded mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-700 rounded w-2/3 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { playSingleSong } = useMusicPlayer();
  const [activeTab, setActiveTab] = useState<TabId>("tracks");
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const query = searchParams.get("q") || "";

  // Handle scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollToTop(scrollY > 300); // Show button after scrolling 300px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Search hooks
  const {
    data: tracksData,
    isLoading: tracksLoading,
    error: tracksError,
    fetchNextPage: fetchNextTracks,
    hasNextPage: hasNextTracks,
  } = useSearchTracks(query, { enabled: !!query });
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasNextUsers,
  } = useSearchUsers(query, { enabled: !!query });
  const {
    data: albumsData,
    isLoading: albumsLoading,
    error: albumsError,
    fetchNextPage: fetchNextAlbums,
    hasNextPage: hasNextAlbums,
  } = useSearchAlbums(query, { enabled: !!query });

  // Flatten pages to combine all results
  const tracks: MusicItem[] =
    tracksData?.pages.flatMap(
      (page: SearchTracksResponse) => page.tracks || []
    ) || [];
  const users: Artist[] =
    usersData?.pages.flatMap((page: SearchUsersResponse) => page.users || []) ||
    [];
  const albums =
    albumsData?.pages.flatMap((page: any) => page.albums || []) || [];

  const handleTrackPlay = (track: MusicItem, index: number) => {
    playSingleSong(track);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <SearchHeader query={query} />

        {/* Content */}
        {!query ? (
          <div className="max-w-4xl mx-auto">
            {/* Search Suggestions */}
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20 mb-8">
                <Search className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">
                  Discover Amazing Music
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  Search for tracks, artists, and albums to find your next
                  favorite
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700/50 rounded-xl p-6 text-center">
                  <Music className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-1">
                    Tracks
                  </h3>
                  <p className="text-gray-400">Millions of songs</p>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700/50 rounded-xl p-6 text-center">
                  <User className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-1">
                    Artists
                  </h3>
                  <p className="text-gray-400">Discover new talent</p>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700/50 rounded-xl p-6 text-center">
                  <Album className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-1">
                    Albums
                  </h3>
                  <p className="text-gray-400">Complete collections</p>
                </div>
              </div>

              {/* Popular Searches */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  {[
                    "Electronic",
                    "Rock",
                    "Hip Hop",
                    "Jazz",
                    "Classical",
                    "Pop",
                  ].map((term) => (
                    <button
                      key={term}
                      className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-full text-sm transition-all duration-300 border border-gray-600/50"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* Search Results Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Search Results
                  </h1>
                  <p className="text-gray-400">Found results for "{query}"</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <span>{tracks.length} tracks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{users.length} artists</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Album className="w-4 h-4" />
                    <span>{albums.length} albums</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-8">
              <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} />

              {/* Right Content - Search Results */}
              <div className="flex-1">
                {/* Loading State */}
                {(tracksLoading || usersLoading || albumsLoading) && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-400">Loading results...</span>
                    </div>
                    <ShadcnLoadingSkeleton />
                  </div>
                )}

                {/* Error State */}
                {(tracksError || usersError || albumsError) &&
                  !tracksLoading &&
                  !usersLoading &&
                  !albumsLoading && (
                    <div className="text-center py-20">
                      <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl p-8 border border-red-500/20 mb-6">
                        <div className="text-red-400 mb-6 text-4xl">⚠️</div>
                        <h2 className="text-xl font-semibold text-white mb-3">
                          Something went wrong
                        </h2>
                        <p className="text-gray-400">
                          Please try searching again or check your connection
                        </p>
                      </div>
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
                          hasNextPage={hasNextTracks}
                          fetchNextPage={fetchNextTracks}
                        />
                      )}

                      {activeTab === "users" && (
                        <UsersTab
                          users={users}
                          hasNextPage={hasNextUsers}
                          fetchNextPage={fetchNextUsers}
                        />
                      )}

                      {activeTab === "albums" && (
                        <AlbumsTab
                          albums={albums}
                          hasNextPage={hasNextAlbums}
                          fetchNextPage={fetchNextAlbums}
                        />
                      )}
                    </>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Scroll to Top Button */}
        {showScrollToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-2xl border border-purple-400/20 transition-all duration-300 hover:scale-110 cursor-pointer backdrop-blur-sm"
            title="Scroll to top"
          >
            <ChevronUp size={18} className="animate-pulse" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<ShadcnLoadingSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}
