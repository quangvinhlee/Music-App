"use client";

import Image from "next/image";
import {
  Music,
  Play,
  Clock,
  Heart,
  HeartIcon,
  MoreHorizontal,
} from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useImageErrors } from "app/hooks/useImageErrors";
import { formatDuration, formatCount } from "@/utils";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface Track {
  id: string;
  title: string;
  artist: {
    id: string;
    username: string;
    avatarUrl: string;
    verified: boolean;
    city?: string;
    countryCode?: string;
  };
  genre: string;
  artwork: string;
  duration: number;
  streamUrl: string;
  playbackCount: number;
}

interface TracksTabProps {
  tracks: Track[];
  onTrackPlay: (track: Track, index: number) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export function TracksTab({
  tracks,
  onTrackPlay,
  hasNextPage,
  fetchNextPage,
}: TracksTabProps) {
  const router = useRouter();
  const { handleImageError, hasImageError } = useImageErrors();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [animatingHearts, setAnimatingHearts] = useState<Set<string>>(
    new Set()
  );

  const handleArtistClick = (artist: any) => {
    router.push(`/artist/${artist.id}`);
  };

  const handleLike = (trackId: string) => {
    setLikedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
        console.log("Unliked:", trackId);
      } else {
        newSet.add(trackId);
        console.log("Liked:", trackId);
      }
      return newSet;
    });

    // Add animation
    setAnimatingHearts((prev) => new Set(prev).add(trackId));
    setTimeout(() => {
      setAnimatingHearts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(trackId);
        return newSet;
      });
    }, 300);
  };

  if (!tracks.length) {
    return (
      <div className="col-span-full text-center py-20">
        <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No tracks found
        </h3>
        <p className="text-gray-500">Try searching with different keywords</p>
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={tracks.length}
      next={fetchNextPage}
      hasMore={hasNextPage}
      loader={undefined}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {tracks.map((track: Track, index: number) => (
          <motion.div
            key={`${track.id}-${index}`}
            className="cursor-pointer"
            whileHover={{ scale: 1.03 }}
          >
            <div className="rounded-md overflow-hidden shadow-md bg-white">
              <div className="relative group">
                <div
                  className="cursor-pointer"
                  onClick={() => onTrackPlay(track, index)}
                >
                  <Image
                    src={
                      hasImageError(`track-${track.id}`) || !track.artwork
                        ? "/music-plate.jpg"
                        : track.artwork
                    }
                    alt={track.title}
                    width={200}
                    height={200}
                    priority
                    className="w-full h-52 object-cover"
                    onError={() => handleImageError(`track-${track.id}`)}
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded transition-all duration-200 group-hover:backdrop-blur-[2px] group-hover:bg-black/30 pointer-events-none">
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 cursor-pointer transition-transform duration-200 hover:scale-110 pointer-events-auto"
                    title="Play"
                    onClick={() => onTrackPlay(track, index)}
                  >
                    <Play size={32} className="text-white" />
                  </button>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white bg-black/60 rounded px-2 py-0.5 mb-2">
                    {formatDuration(track.duration)}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className={`p-1 cursor-pointer rounded-full hover:bg-pink-100 transition-transform duration-300 ${
                        animatingHearts.has(track.id)
                          ? "scale-125"
                          : "scale-100"
                      } transition-transform duration-200 hover:scale-110 pointer-events-auto`}
                      title="Like"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(track.id);
                      }}
                    >
                      {likedIds.has(track.id) ? (
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
              </div>
              <div className="p-2">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {track.title}
                </p>
                <p
                  className="text-xs text-gray-500 truncate hover:text-blue-600 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArtistClick(track.artist);
                  }}
                >
                  {track.artist.username}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {track.playbackCount?.toLocaleString() || "0"} plays
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </InfiniteScroll>
  );
}
