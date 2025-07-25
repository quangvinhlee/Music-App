"use client";

import { useState, useEffect } from "react";
import {
  useArtistDataWithAutoFetch,
  useAutoAppendToQueue,
} from "app/query/useSoundcloudQueries";
import { Skeleton } from "app/components/ui/skeleton";
import { Music, Heart, Repeat, ListMusic, Play } from "lucide-react";
import TrackList from "app/components/shared/TrackList";
import PlaylistGrid from "./PlaylistGrid";
import EmptyState from "./EmptyState";
import { useMusicPlayer } from "app/provider/MusicContext";
import { useSelector } from "react-redux";
import { RootState } from "app/store/store";

interface ArtistTabsProps {
  artistId: string;
  artistName: string;
}

type TabType = "tracks" | "playlists" | "likes" | "reposts";

// Interface for tracking stats for each tab
interface TabStats {
  tracks: number;
  playlists: number;
  likes: number;
  reposts: number;
}

export default function ArtistTabs({ artistId, artistName }: ArtistTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("tracks");
  const [tabStats, setTabStats] = useState<TabStats>({
    tracks: 0,
    playlists: 0,
    likes: 0,
    reposts: 0,
  });
  const [accessedTabs, setAccessedTabs] = useState<Set<TabType>>(
    new Set(["tracks"])
  );

  const { appendSongsToQueue } = useMusicPlayer();
  const { queueType, currentSong } = useSelector(
    (state: RootState) => state.song
  );

  const tabs = [
    {
      id: "tracks" as TabType,
      label: "Tracks",
      icon: Music,
      description: "Latest tracks from this artist",
    },
    {
      id: "playlists" as TabType,
      label: "Playlists",
      icon: ListMusic,
      description: "Playlists created by this artist",
    },
    {
      id: "likes" as TabType,
      label: "Likes",
      icon: Heart,
      description: "Songs this artist has liked",
    },
    {
      id: "reposts" as TabType,
      label: "Reposts",
      icon: Repeat,
      description: "Songs this artist has reposted",
    },
  ];

  const {
    data: artistData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useArtistDataWithAutoFetch(artistId, activeTab, {
    enabled: !!artistId,
    autoFetchPages: 5,
  });

  // Auto-append new songs to queue if we're currently playing from this artist's tracks
  const playlistId = `artist-${artistId}-${activeTab}`;
  const isCurrentlyPlayingFromThisArtist =
    queueType === "playlist" &&
    currentSong &&
    currentSong.artist?.id === artistId;

  // This hook automatically appends new songs to the queue when they're fetched via infinite scroll
  // It only appends songs that aren't already in the queue to avoid duplicates
  useAutoAppendToQueue(artistData, playlistId, appendSongsToQueue);

  // Update stats when data changes
  useEffect(() => {
    if (artistData?.pages) {
      const allTracks = artistData.pages.flatMap((page) => page.tracks || []);
      const allPlaylists = artistData.pages.flatMap(
        (page) => page.playlists || []
      );
      const allLikes = artistData.pages.flatMap((page) => page.likes || []);
      const allReposts = artistData.pages.flatMap((page) => page.reposts || []);

      setTabStats((prev) => ({
        ...prev,
        [activeTab]:
          activeTab === "tracks" || activeTab === "reposts"
            ? allTracks.length
            : activeTab === "likes"
              ? allLikes.length
              : allPlaylists.length,
      }));

      // Mark this tab as accessed
      setAccessedTabs((prev) => new Set([...prev, activeTab]));
    }
  }, [artistData, activeTab]);

  // Handle tab click
  const handleTabClick = (tabId: TabType) => {
    console.log("Clicking tab:", tabId);
    setActiveTab(tabId);
  };

  // Get current tab data
  const getCurrentTabData = () => {
    if (!artistData?.pages) return [];

    switch (activeTab) {
      case "tracks":
      case "reposts":
        return artistData.pages.flatMap((page) => page.tracks || []);
      case "likes":
        return artistData.pages.flatMap((page) => page.likes || []);
      case "playlists":
        return artistData.pages.flatMap((page) => page.playlists || []);
      default:
        return [];
    }
  };

  const currentTabData = getCurrentTabData();

  const renderContent = () => {
    if (activeTab === "tracks" || activeTab === "reposts") {
      return currentTabData.length > 0 ? (
        <TrackList
          tracks={currentTabData}
          artistId={artistId}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      ) : (
        <EmptyState tabType={activeTab} artistName={artistName} />
      );
    } else if (activeTab === "likes") {
      return currentTabData.length > 0 ? (
        <TrackList
          tracks={currentTabData}
          artistId={artistId}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      ) : (
        <EmptyState tabType={activeTab} artistName={artistName} />
      );
    } else {
      return currentTabData.length > 0 ? (
        <PlaylistGrid playlists={currentTabData} />
      ) : (
        <EmptyState tabType={activeTab} artistName={artistName} />
      );
    }
  };

  const handlePlayAll = () => {
    if (currentTabData.length > 0) {
      appendSongsToQueue(currentTabData, `artist-${artistId}-${activeTab}`);
    }
  };

  // Helper function to format stats display
  const formatStat = (tabType: TabType, count: number) => {
    if (!accessedTabs.has(tabType)) {
      return "-";
    }
    return count.toString();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tracks</p>
                <p className="text-2xl font-bold text-white">
                  {formatStat("tracks", tabStats.tracks)}
                </p>
              </div>
              <Music className="text-purple-400" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Playlists</p>
                <p className="text-2xl font-bold text-white">
                  {formatStat("playlists", tabStats.playlists)}
                </p>
              </div>
              <ListMusic className="text-pink-400" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Likes</p>
                <p className="text-2xl font-bold text-white">
                  {formatStat("likes", tabStats.likes)}
                </p>
              </div>
              <Heart className="text-red-400" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Reposts</p>
                <p className="text-2xl font-bold text-white">
                  {formatStat("reposts", tabStats.reposts)}
                </p>
              </div>
              <Repeat className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700/50 rounded-md p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Icon size={16} className="mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Contents */}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (!isActive) return null;

            return (
              <div key={tab.id} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Icon size={24} className="text-purple-400" />
                      {tab.label}
                    </h2>
                    <p className="text-gray-400 mt-1">{tab.description}</p>
                  </div>

                  {/* Play All button - only show for song tabs (not playlists) */}
                  {tab.id !== "playlists" && currentTabData.length > 0 && (
                    <button
                      onClick={handlePlayAll}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg transition-all duration-300"
                    >
                      <Play size={16} />
                      Play All
                    </button>
                  )}
                </div>

                {/* Content */}
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="flex gap-4 items-center p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-gray-700/50"
                      >
                        <Skeleton className="w-16 h-16 rounded-lg bg-gray-600" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-48 bg-gray-600" />
                          <Skeleton className="h-3 w-32 bg-gray-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-red-400 p-6 bg-gray-900 rounded-xl border border-red-400/30">
                    <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      Error Loading Content
                    </h3>
                    <p className="text-red-300">{error.message}</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300">
                    {renderContent()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
