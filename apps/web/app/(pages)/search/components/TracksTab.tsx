"use client";

import Image from "next/image";
import {
  Music,
  Clock,
  Heart,
  HeartIcon,
  MoreHorizontal,
  Verified,
  PlaySquare,
  Calendar,
  Loader2,
} from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useImageErrors } from "app/hooks/useImageErrors";
import { formatDuration } from "app/utils";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArtistTooltip } from "app/components/shared/ArtistTooltip";
import { getReleaseDate } from "app/utils/formatters";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "app/components/ui/dropdown-menu";
import { useState } from "react";
import { MusicItem } from "app/types/music";
import PlayPauseButton from "app/components/shared/PlayPauseButton";
import { useMusicPlayer } from "app/provider/MusicContext";
import { LikeButton } from "app/components/shared/LikeButton";

interface TracksTabProps {
  tracks: MusicItem[];
  onTrackPlay: (track: MusicItem, index: number) => void;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

export function TracksTab({
  tracks,
  onTrackPlay,
  hasNextPage,
  fetchNextPage,
}: TracksTabProps) {
  const router = useRouter();
  const { currentSong } = useMusicPlayer();
  const { handleImageError, hasImageError } = useImageErrors();

  const handleArtistClick = (artist: any) => {
    router.push(`/artist/${artist.id}`);
  };

  // Spinning loading component for infinite scroll
  const SpinningLoader = () => (
    <div className="flex justify-center items-center py-8">
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading more tracks...</span>
      </div>
    </div>
  );

  // End message when no more tracks
  const EndMessage = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mb-2">
        <Music size={16} className="text-gray-400" />
      </div>
      <p className="text-sm text-gray-400 text-center max-w-xs">
        You've reached the end of all available tracks.
      </p>
    </div>
  );

  if (!tracks.length) {
    return (
      <div className="col-span-full text-center py-20">
        <Music className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h3 className="text-lg font-medium text-white mb-3">No tracks found</h3>
        <p className="text-gray-400">Try searching with different keywords</p>
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={tracks.length}
      next={fetchNextPage}
      hasMore={hasNextPage}
      loader={<SpinningLoader />}
      endMessage={<EndMessage />}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {tracks.map((track: MusicItem, index: number) => {
          const isCurrentSong = currentSong?.id === track.id;

          return (
            <motion.div
              key={`${track.id}-${index}`}
              className="cursor-pointer"
              whileHover={{ scale: 1.03 }}
            >
              <div className="rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl transition-all duration-200 group-hover:backdrop-blur-[2px] group-hover:bg-black/40 pointer-events-none">
                    <PlayPauseButton
                      track={track}
                      index={index}
                      onPlaySong={onTrackPlay}
                      size={32}
                      className="text-white cursor-pointer transition-transform duration-200 hover:scale-110 pointer-events-auto mt-4"
                      showOnHover={!isCurrentSong}
                      alwaysShowWhenPlaying={isCurrentSong}
                    />
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="pointer-events-auto cursor-pointer">
                        <LikeButton trackId={track.id} size={18} />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1 cursor-pointer rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all duration-200 hover:scale-110 pointer-events-auto"
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
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-white truncate">
                    {track.title}
                  </p>
                  <div className="flex items-center gap-1">
                    <ArtistTooltip artist={track.artist}>
                      <p
                        className="text-xs text-gray-300 truncate hover:text-purple-400 cursor-pointer font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArtistClick(track.artist);
                        }}
                      >
                        {track.artist.username}
                      </p>
                    </ArtistTooltip>
                    {track.artist.verified && (
                      <Verified size={12} className="text-blue-400" />
                    )}
                  </div>
                  {track.genre && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full font-medium mt-2 inline-block border border-purple-500/30">
                      {track.genre}
                    </span>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock size={10} />
                      <span className="text-xs">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <PlaySquare size={10} />
                      <span className="text-xs">
                        {track.playbackCount?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Calendar size={10} />
                      <span className="text-xs">
                        {track.createdAt
                          ? getReleaseDate(track.createdAt)
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </InfiniteScroll>
  );
}
