"use client";

import { MusicItem } from "@/types/music";
import Image from "next/image";
import {
  Play,
  Heart,
  HeartIcon,
  MoreHorizontal,
  Clock,
  Calendar,
} from "lucide-react";
import { formatDuration, getReleaseDate } from "@/utils/formatters";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useMusicPlayer } from "app/provider/MusicContext";

interface TrackListProps {
  tracks: MusicItem[];
  artistId: string;
}

export default function TrackList({ tracks, artistId }: TrackListProps) {
  const { playFromPlaylist } = useMusicPlayer();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [animatingHearts, setAnimatingHearts] = useState<Set<string>>(
    new Set()
  );

  const handleLike = (songId: string) => {
    setLikedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
      } else {
        newSet.add(songId);
      }
      return newSet;
    });
    setAnimatingHearts((prev) => new Set(prev).add(songId));
    setTimeout(() => {
      setAnimatingHearts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
    }, 300);
  };

  const handlePlaySong = (song: MusicItem, index: number) => {
    playFromPlaylist(song, artistId, index, tracks);
  };

  return (
    <div className="space-y-3">
      {tracks.map((track: MusicItem, index: number) => (
        <div
          key={track.id}
          className="group flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200/50 bg-white/50 hover:bg-white/80 transition-all duration-200 ease-in-out cursor-pointer hover:scale-[1.02] hover:shadow-lg"
          onClick={() => handlePlaySong(track, index)}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative group w-16 h-16 flex-shrink-0">
              <Image
                src={track.artwork}
                alt={track.title}
                width={64}
                height={64}
                className="rounded-lg object-cover shadow-md"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 rounded-lg">
                <Play className="text-white" size={24} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate text-gray-900 group-hover:text-blue-600 transition-colors">
                {track.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500 truncate">
                  {track.artist.username}
                </p>
                {track.playbackCount && (
                  <span className="text-xs text-gray-400">
                    • {track.playbackCount.toLocaleString()} plays
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                {track.genre && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    {track.genre}
                  </span>
                )}
                <div className="flex items-center gap-1 text-gray-400">
                  <Calendar size={12} />
                  <span className="text-xs">
                    {getReleaseDate(track.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 text-gray-400">
              <Clock size={14} />
              <span className="text-sm font-mono">
                {formatDuration(track.duration)}
              </span>
            </div>
            <button
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-500 hover:text-blue-600 cursor-pointer p-2 rounded-full hover:bg-blue-50"
              title="Play"
              onClick={(e) => {
                e.stopPropagation();
                handlePlaySong(track, index);
              }}
            >
              <Play size={20} />
            </button>
            <button
              className={`p-2 rounded-full hover:bg-pink-50 transition-all duration-200 cursor-pointer ${
                animatingHearts.has(track.id) ? "scale-125" : "scale-100"
              } ${likedIds.has(track.id) ? "text-pink-500" : "text-gray-400 hover:text-pink-500"}`}
              title="Like"
              onClick={(e) => {
                e.stopPropagation();
                handleLike(track.id);
              }}
            >
              {likedIds.has(track.id) ? (
                <HeartIcon size={18} className="fill-current" />
              ) : (
                <Heart size={18} />
              )}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-full hover:bg-gray-100 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                  title="More"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  <Play size={16} className="mr-2" />
                  Play Next
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Heart size={16} className="mr-2" />
                  Add to Favorites
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <MoreHorizontal size={16} className="mr-2" />
                  Add to Playlist
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <MoreHorizontal size={16} className="mr-2" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
