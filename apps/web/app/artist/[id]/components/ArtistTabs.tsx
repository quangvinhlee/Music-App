"use client";

import { useState } from "react";
import { useArtistData } from "app/query/useSoundcloudQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, Heart, Repeat, ListMusic } from "lucide-react";
import TrackList from "./TrackList";
import PlaylistGrid from "./PlaylistGrid";
import EmptyState from "./EmptyState";

interface ArtistTabsProps {
  artistId: string;
  artistName: string;
}

type TabType = "tracks" | "playlists" | "likes" | "reposts";

export default function ArtistTabs({ artistId, artistName }: ArtistTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("tracks");

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
  } = useArtistData(artistId, activeTab, { enabled: !!artistId });

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
        <>
          <TrackList tracks={allTracks} artistId={artistId} />
          {hasNextPage && (
            <div className="mt-8 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState tabType={activeTab} artistName={artistName} />
      );
    } else {
      return allPlaylists.length > 0 ? (
        <>
          <PlaylistGrid playlists={allPlaylists} />
          {hasNextPage && (
            <div className="mt-8 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
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
                className={`py-4 px-8 rounded-xl text-base font-semibold transition-all duration-200 flex items-center gap-3 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-300/50 border-2 border-blue-500 transform scale-105"
                    : "bg-gray-200/90 text-gray-800 hover:text-gray-900 hover:bg-gray-300/90 border-2 border-gray-300/70"
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-white" : "text-gray-700"}
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
              className="flex gap-4 items-center p-4 bg-white/50 rounded-lg border border-gray-200/50"
            >
              <Skeleton className="w-16 h-16 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 p-6 bg-red-50 rounded-xl border border-red-200">
          <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Error Loading Content
          </h3>
          <p className="text-red-700">{error.message}</p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">{renderContent()}</div>
      )}
    </div>
  );
}
