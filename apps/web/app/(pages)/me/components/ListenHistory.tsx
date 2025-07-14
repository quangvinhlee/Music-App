"use client";

import { RecentPlayedSong, MusicItem } from "app/types/music";
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
import { getReleaseDate } from "app/utils/formatters";
import { TooltipProvider } from "app/components/ui/tooltip";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "app/components/ui/dropdown-menu";
import { useState } from "react";
import { useMusicPlayer } from "app/provider/MusicContext";
import { ArtistTooltip } from "app/components/shared/ArtistTooltip";
import { LikeButton } from "app/components/shared/LikeButton";

interface ListenHistoryProps {
  recentPlayed: RecentPlayedSong[];
}

export default function ListenHistory({ recentPlayed }: ListenHistoryProps) {
  const router = useRouter();

  const { playSingleSong } = useMusicPlayer();

  // Handle play track
  const handlePlayTrack = (track: RecentPlayedSong) => {
    // Convert RecentPlayedSong to MusicItem format
    const musicItem: MusicItem = {
      id: track.trackId,
      title: track.title || "",
      artist: track.artist || {
        id: "",
        username: "",
        avatarUrl: "",
        verified: false,
      },
      artwork: track.artwork || "",
      duration: track.duration || 0,
      genre: track.genre || "",
    };
    playSingleSong(musicItem);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleArtistClick = (artist: any) => {
    router.push(`/artist/${artist.id}`);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {recentPlayed.map((track: RecentPlayedSong) => (
          <div
            key={track.id}
            className="group bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-700/50 hover:border-purple-500/50"
          >
            <div className="flex items-center p-4 space-x-4">
              {/* Track Artwork */}
              <div className="relative flex-shrink-0">
                <Image
                  src={track.artwork || "/default-track.jpg"}
                  alt={track.title || "Track"}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded-lg group-hover:brightness-110 transition-all duration-300 cursor-pointer"
                  onClick={() => handlePlayTrack(track)}
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-200 group-hover:backdrop-blur-[2px] group-hover:bg-black/40 pointer-events-none">
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer transition-transform duration-200 hover:scale-110 pointer-events-auto"
                    title="Play"
                    onClick={() => handlePlayTrack(track)}
                  >
                    <Play size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white hover:text-purple-400 transition-colors truncate">
                      {track.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      {track.artist && (
                        <ArtistTooltip artist={track.artist}>
                          <p
                            className="text-sm text-gray-400 truncate hover:text-purple-400 cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArtistClick(track.artist);
                            }}
                          >
                            {track.artist.username}
                          </p>
                        </ArtistTooltip>
                      )}
                      {track.genre && (
                        <>
                          <span>•</span>
                          <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                            {track.genre}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Duration and Played At */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatDuration(track.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{getReleaseDate(track.playedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <LikeButton trackId={track.trackId} size={18} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-2 cursor-pointer rounded-full hover:bg-gray-600/20 transition-colors transition-transform duration-200 hover:scale-110"
                      title="More"
                    >
                      <MoreHorizontal size={18} className="text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-gray-800 border-gray-700"
                  >
                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-600/20">
                      Add to Playlist
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-600/20">
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-600/20">
                      Copy URL
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {recentPlayed.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Music size={48} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No listening history
              </h3>
              <p className="text-gray-400">
                Start listening to music to see your history here.
              </p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
