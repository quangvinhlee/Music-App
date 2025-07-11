"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  useSearchTracks,
  useSearchUsers,
  useSearchAlbums,
} from "app/query/useSoundcloudQueries";
import { useMusicPlayer } from "app/provider/MusicContext";
import { Search } from "lucide-react";
import { SearchHeader } from "app/search/components/SearchHeader";
import { SearchTabs, TabId } from "app/search/components/SearchTabs";
import { TracksTab } from "app/search/components/TracksTab";
import { UsersTab } from "app/search/components/UsersTab";
import { AlbumsTab } from "app/search/components/AlbumsTab";
import { Skeleton } from "@/components/ui/skeleton";
import { MusicItem } from "@/types/music";
import { SearchTracksResponse } from "@/types/music";
import { Artist, SearchUsersResponse } from "@/types/music";

function ShadcnLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {[...Array(8)].map((_, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-2xl border border-gray-700/50 p-4"
        >
          <div className="w-full h-52 bg-gray-600 rounded-lg animate-pulse mb-3"></div>
          <div className="h-4 bg-gray-600 rounded mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-700 rounded w-2/3 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

function SearchPageContent() {
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
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-white mb-3">
              Start searching for music
            </h2>
            <p className="text-gray-400">
              Enter a search term above to find tracks, artists, and albums
            </p>
          </div>
        ) : (
          <div className="flex gap-8">
            <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Right Content - Search Results */}
            <div className="flex-1">
              {/* Loading State */}
              {(tracksLoading || usersLoading || albumsLoading) && (
                <ShadcnLoadingSkeleton />
              )}

              {/* Error State */}
              {(tracksError || usersError || albumsError) &&
                !tracksLoading &&
                !usersLoading &&
                !albumsLoading && (
                  <div className="text-center py-20">
                    <div className="text-red-400 mb-6 text-4xl">⚠️</div>
                    <h2 className="text-xl font-semibold text-white mb-3">
                      Something went wrong
                    </h2>
                    <p className="text-gray-400">
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
                      <InfiniteScroll
                        dataLength={tracks.length}
                        next={fetchNextTracks}
                        hasMore={hasNextTracks}
                        loader={<></>}
                        scrollThreshold={0.9}
                      >
                        <TracksTab
                          tracks={tracks}
                          onTrackPlay={handleTrackPlay}
                          hasNextPage={hasNextTracks}
                          isFetchingNextPage={false}
                          fetchNextPage={fetchNextTracks}
                        />
                      </InfiniteScroll>
                    )}

                    {activeTab === "users" && (
                      <InfiniteScroll
                        dataLength={users.length}
                        next={fetchNextUsers}
                        hasMore={hasNextUsers}
                        loader={<></>}
                        scrollThreshold={0.9}
                      >
                        <UsersTab
                          users={users}
                          hasNextPage={hasNextUsers}
                          isFetchingNextPage={false}
                          fetchNextPage={fetchNextUsers}
                        />
                      </InfiniteScroll>
                    )}

                    {activeTab === "albums" && (
                      <InfiniteScroll
                        dataLength={albums.length}
                        next={fetchNextAlbums}
                        hasMore={hasNextAlbums}
                        loader={<></>}
                        scrollThreshold={0.9}
                      >
                        <AlbumsTab
                          albums={albums}
                          hasNextPage={hasNextAlbums}
                          isFetchingNextPage={false}
                          fetchNextPage={fetchNextAlbums}
                        />
                      </InfiniteScroll>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<ShadcnLoadingSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}
