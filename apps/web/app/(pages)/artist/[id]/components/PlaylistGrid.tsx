"use client";

import { Playlist } from "@/types/playlist";
import Image from "next/image";
import {
  Play,
  Music,
  Clock,
  Calendar,
  Heart,
  HeartIcon,
  MoreHorizontal,
} from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Skeleton } from "app/components/ui/skeleton";
import { getReleaseDate } from "app/utils/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "app/components/ui/tooltip";
import TracksTooltip from "app/components/shared/TracksTooltip";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "app/components/ui/dropdown-menu";
import { useState } from "react";
import { useMusicPlayer } from "app/provider/MusicContext";
import { useDispatch } from "react-redux";
import { LikeButton } from "app/components/shared/LikeButton";

interface PlaylistGridProps {
  playlists: Playlist[];
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
}

export default function PlaylistGrid({
  playlists,
  hasNextPage = false,
  fetchNextPage,
}: PlaylistGridProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  const { playFromPlaylist } = useMusicPlayer();

  // Fix: Convert PlaylistTrack to MusicItem for playFromPlaylist and TracksTooltip
  const toMusicItem = (track: any) => ({
    id: track.trackId,
    title: track.title || "Untitled",
    artist: track.artist || {
      id: "",
      username: "",
      avatarUrl: "",
      verified: false,
    },
    genre: track.genre || "",
    artwork: track.artwork || "",
    duration: track.duration || 0,
    streamUrl: track.streamUrl || "",
  });

  // Handle play playlist (image or play button click)
  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      const firstTrack = playlist.tracks[0];
      if (firstTrack) {
        playFromPlaylist(
          toMusicItem(firstTrack),
          playlist.id,
          0,
          playlist.tracks.map(toMusicItem)
        );
      }
    }
  };

  // Handle title click - navigate to playlist page
  const handleTitleClick = (playlist: Playlist) => {
    router.push(`/collection/playlist/${playlist.id}`);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleArtistClick = (artist: any) => {
    router.push(`/artist/${artist.id}`);
  };

  // Loading skeleton for infinite scroll
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-2xl overflow-hidden border border-gray-700/50"
        >
          <Skeleton className="w-full h-48 bg-gray-600" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4 bg-gray-600" />
            <Skeleton className="h-4 w-1/2 bg-gray-600" />
            <Skeleton className="h-4 w-1/3 bg-gray-600" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <TooltipProvider>
      <InfiniteScroll
        dataLength={playlists.length}
        next={fetchNextPage || (() => {})}
        hasMore={hasNextPage}
        loader={<LoadingSkeleton />}
        scrollThreshold={0.9}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist: Playlist) => (
            <div
              key={playlist.id}
              className="group bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-gray-700/50 hover:border-purple-500/50"
            >
              <div className="relative">
                <Image
                  src={typeof playlist.artwork === "string" && playlist.artwork
                    ? playlist.artwork
                    : (playlist.tracks &&
                      Array.isArray(playlist.tracks) &&
                      playlist.tracks.length > 0 &&
                      typeof playlist.tracks[0]?.artwork === "string" &&
                      playlist.tracks[0]?.artwork)
                      ? playlist.tracks[0].artwork as string
                      : "/music-plate.jpg"}                   
                  alt={playlist.name || "Playlist artwork"}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover group-hover:brightness-110 transition-all duration-300 cursor-pointer"
                  onClick={() => handlePlayPlaylist(playlist)}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl transition-all duration-200 group-hover:backdrop-blur-[2px] group-hover:bg-black/40 pointer-events-none">
                  <button
                    className="opacity-0 group-hover:opacity-100 mb-1 cursor-pointer transition-all duration-200 hover:scale-110 pointer-events-auto"
                    title="Play"
                    onClick={() => handlePlayPlaylist(playlist)}
                  >
                    <Play size={32} className="text-white" />
                  </button>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="pointer-events-auto cursor-pointer">
                      <LikeButton trackId={playlist.id} size={18} />
                    </div>
                    {/* LikeButton for playlist */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1 cursor-pointer rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors duration-200 hover:scale-110 pointer-events-auto"
                          title="More"
                        >
                          <MoreHorizontal size={18} className="text-white" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-gray-800 border-gray-700"
                      >
                        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-600/20">
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-600/20">
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-600/20">
                          Add to Playlist
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {/* Duration badge - always visible */}
                {playlist.duration && (
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(playlist.duration)}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-lg truncate text-white group-hover:text-purple-400 transition-colors cursor-pointer"
                      onClick={() => handleTitleClick(playlist)}
                    >
                      {playlist.name || "Untitled Playlist"}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1 truncate">
                      {playlist.artist?.username || "Unknown Artist"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full font-medium border border-purple-500/30">
                    {playlist.genre || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="flex items-center gap-1 hover:text-purple-400 transition-colors cursor-pointer underline underline-offset-4 decoration-dotted decoration-purple-400/60 group">
                        <Music
                          size={14}
                          className="text-gray-400 group-hover:text-purple-400 transition-colors"
                        />
                        <span className="text-xs text-gray-400 font-medium group-hover:text-purple-400 transition-colors">
                          {playlist.tracks ? playlist.tracks.length : 0} tracks
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="px-3 py-2 rounded-lg bg-gray-900 text-gray-100 text-xs shadow-xl border border-gray-700"
                      sideOffset={5}
                    >
                      <div className="mb-1 font-semibold">View tracks</div>
                      <div className="mb-1 text-gray-400">
                        Hover to preview playlist tracks
                      </div>
                      <TracksTooltip
                        playlist={{
                          ...playlist,
                          genre: playlist.genre || "",
                          artwork: playlist.artwork || "",
                          tracks: playlist.tracks?.map(toMusicItem) || [],
                          artist: playlist.artist || {
                            id: "",
                            username: "",
                            avatarUrl: "",
                            verified: false,
                          },
                        }}
                      />
                    </TooltipContent>
                  </Tooltip>
                  {playlist.createdAt && (
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {getReleaseDate(playlist.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </TooltipProvider>
  );
}
