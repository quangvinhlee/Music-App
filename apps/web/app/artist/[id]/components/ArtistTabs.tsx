"use client";

import { useState } from "react";
import {
  useArtistDataWithAutoFetch,
  useAutoAppendToQueue,
} from "app/query/useSoundcloudQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, Heart, Repeat, ListMusic } from "lucide-react";
import TrackList from "@/components/TrackList";
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

export default function ArtistTabs({ artistId, artistName }: ArtistTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("tracks");
  const { appendSongsToQueue } = useMusicPlayer();
  const { queueType, currentSong } = useSelector(
    (state: RootState) => state.song
  );

  const tabs = [
    {
      id: "tracks" as TabType,
      label: "Tracks",
      icon: Music,
    },
    {
      id: "playlists" as TabType,
      label: "Playlists",
      icon: ListMusic,
    },
    {
      id: "likes" as TabType,
      label: "Likes",
      icon: Heart,
    },
    {
      id: "reposts" as TabType,
      label: "Reposts",
      icon: Repeat,
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

  const allTracks =
    artistData?.pages?.flatMap((page) => page.tracks || []) || [];
  const allPlaylists =
    artistData?.pages?.flatMap((page) => page.playlists || []) || [];

  const renderContent = () => {
    if (
      activeTab === "tracks" ||
      activeTab === "likes" ||
      activeTab === "reposts"
    ) {
      return allTracks.length > 0 ? (
        <TrackList
          tracks={allTracks}
          artistId={artistId}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      ) : (
        <EmptyState tabType={activeTab} artistName={artistName} />
      );
    } else {
      return allPlaylists.length > 0 ? (
        <PlaylistGrid
          playlists={allPlaylists}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      ) : (
        <EmptyState tabType={activeTab} artistName={artistName} />
      );
    }
  };

  return (
    <div className="p-6">
      {/* Enhanced Tabs */}
      <div className="mb-8">
        <div className="flex justify-start space-x-2 bg-transparent">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-8 rounded-xl text-base font-semibold transition-all duration-200 flex items-center gap-3 border-2
                  ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl border-purple-500/70 scale-105"
                      : "bg-gray-800/70 text-gray-300 hover:text-white hover:bg-gray-700 border-gray-700/70"
                  }
                `}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-white" : "text-gray-400"}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
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
        <div className="animate-in fade-in duration-300">{renderContent()}</div>
      )}
    </div>
  );
}
