"use client";

import { MusicItem } from "@/types/music";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getReleaseDate } from "@/utils/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TracksTooltip from "@/components/TracksTooltip";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useMusicPlayer } from "app/provider/MusicContext";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "app/store/store";
import { setSelectedPlaylist } from "app/store/song";

interface PlaylistGridProps {
  playlists: MusicItem[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

export default function PlaylistGrid({
  playlists,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
}: PlaylistGridProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  // Like state for playlists
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [animatingHearts, setAnimatingHearts] = useState<Set<string>>(
    new Set()
  );

  const { playFromPlaylist } = useMusicPlayer();

  const handleLike = (playlistId: string) => {
    setLikedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playlistId)) {
        newSet.delete(playlistId);
      } else {
        newSet.add(playlistId);
      }
      return newSet;
    });
    setAnimatingHearts((prev) => new Set(prev).add(playlistId));
    setTimeout(() => {
      setAnimatingHearts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(playlistId);
        return newSet;
      });
    }, 300);
  };

  // Handle play playlist (image or play button click)
  const handlePlayPlaylist = (playlist: MusicItem) => {
    // Playlists have tracks property with the list of songs
    if (playlist.tracks && playlist.tracks.length > 0) {
      const firstTrack = playlist.tracks[0];
      if (firstTrack) {
        playFromPlaylist(firstTrack, playlist.id, 0, playlist.tracks);
      }
    } else {
      console.log("No tracks available for playlist:", playlist.title);
    }
  };

  // Handle title click - navigate to playlist page
  const handleTitleClick = (playlist: MusicItem) => {
    dispatch(setSelectedPlaylist(playlist));
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
          className="bg-white/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-200/50"
        >
          <Skeleton className="w-full h-48" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
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
          {playlists.map((playlist: MusicItem) => (
            <div
              key={playlist.id}
              className="group bg-white/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-300/50 hover:border-opacity-50"
            >
              <div className="relative">
                <Image
                  src={playlist.artwork}
                  alt={playlist.title}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover group-hover:brightness-110 transition-all duration-300 cursor-pointer"
                  onClick={() => handlePlayPlaylist(playlist)}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded transition-all duration-200 group-hover:backdrop-blur-[2px] group-hover:bg-black/30 pointer-events-none">
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 cursor-pointer transition-transform duration-200 hover:scale-110 pointer-events-auto"
                    title="Play"
                    onClick={() => handlePlayPlaylist(playlist)}
                  >
                    <Play size={32} className="text-white" />
                  </button>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className={`p-1 cursor-pointer rounded-full hover:bg-pink-100 transition-transform duration-300 ${
                        animatingHearts.has(playlist.id)
                          ? "scale-125"
                          : "scale-100"
                      } transition-transform duration-200 hover:scale-110 pointer-events-auto`}
                      title="Like"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(playlist.id);
                      }}
                    >
                      {likedIds.has(playlist.id) ? (
                        <HeartIcon
                          size={18}
                          className="text-pink-500 fill-pink-500"
                        />
                      ) : (
                        <Heart size={18} className="text-pink-500" />
                      )}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1 cursor-pointer rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-colors transition-transform duration-200 hover:scale-110 pointer-events-auto"
                          title="More"
                        >
                          <MoreHorizontal size={18} className="text-white" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem>Copy URL</DropdownMenuItem>
                        <DropdownMenuItem>Add to Playlist</DropdownMenuItem>
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
                      className="font-semibold text-lg truncate text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer"
                      onClick={() => handleTitleClick(playlist)}
                    >
                      {playlist.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {playlist.artist.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  {playlist.genre && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      {playlist.genre}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  {playlist.trackCount && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer">
                          <Music size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-500 font-medium hover:text-blue-600">
                            {playlist.trackCount} tracks
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="p-0 border-0 bg-transparent [&[data-state=delayed-open]]:animate-in [&[data-state=delayed-open]]:fade-in-0 [&[data-state=delayed-open]]:zoom-in-95 [&[data-state=delayed-open]]:slide-in-from-bottom-2 [&[data-state=closed]]:animate-out [&[data-state=closed]]:fade-out-0 [&[data-state=closed]]:zoom-out-95 [&[data-state=closed]]:slide-out-to-bottom-2"
                        sideOffset={5}
                      >
                        <TracksTooltip playlist={playlist} />
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {playlist.createdAt && (
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500">
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
