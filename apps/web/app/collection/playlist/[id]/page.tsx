"use client";

import { use } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "app/store/store";
import { useTrendingPlaylistSongs } from "app/query/useSoundCloudQueries";
import { MusicItem } from "@/types/music";
import MusicPlayer from "@/components/MusicPlayer";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  PlayCircle,
  Play,
  Heart,
  HeartIcon,
  MoreHorizontal,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useMusicPlayer } from "app/provider/MusicContext";

interface Props {
  params: Promise<{ id: string }>;
}

const PlaylistPage = ({ params }: Props) => {
  const { id } = use(params);
  const playlist = useSelector(
    (state: RootState) => state.song.selectedPlaylist
  );
  const { playFromPlaylist } = useMusicPlayer();

  // Fetch songs for this playlist
  const {
    data: songs = [],
    isLoading: songsLoading,
    error: songsError,
  } = useTrendingPlaylistSongs(id, { enabled: !!id });

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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Add play handler
  const handlePlaySong = (song: MusicItem, index: number) => {
    playFromPlaylist(song, id, index, songs);
  };

  if (!playlist || playlist.id !== id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl font-semibold mb-2">Playlist not found</div>
        <div className="text-gray-500">
          Please go back to the homepage and select a playlist.
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden">
        {/* Blurred Background Image */}
        {playlist.artwork && (
          <div className="absolute inset-0 z-0">
            <Image
              src={playlist.artwork}
              alt="Background"
              fill
              className="object-cover w-full h-full blur-lg brightness-75 scale-110"
              priority
            />
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
          </div>
        )}
        {/* Foreground Content */}
        <div className="relative z-10 p-6 sm:p-10 md:p-14 h-full flex items-end gap-6">
          <div className="w-40 h-40 sm:w-52 sm:h-52 shadow-xl rounded-lg overflow-hidden border-2 border-gray-300">
            <Image
              src={playlist.artwork}
              alt={playlist.title}
              width={208}
              height={208}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="text-gray-900 space-y-2">
            <p className="uppercase text-xs tracking-widest text-gray-600">
              Playlist
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {playlist.title}
            </h1>
            <p className="text-sm text-gray-700">
              Curated by {playlist.owner || "Admin"}
            </p>
            <p className="text-sm text-gray-700">{songs.length} songs</p>
            {songs.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-lg animate-pulse"
                onClick={() => {
                  const firstSong = songs[0];
                  if (firstSong) {
                    handlePlaySong(firstSong, 0);
                  }
                }}
              >
                <PlayCircle size={28} />
                Play All
              </motion.button>
            )}
          </div>
        </div>
      </div>
      {/* Song List */}
      <div className="p-6">
        {songsLoading ? (
          <div className="p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-6 items-center mb-6">
                <Skeleton className="w-24 h-24 rounded-lg" />
                <div className="space-y-4">
                  <Skeleton className="h-6 w-64 rounded font-bold" />
                  <Skeleton className="h-5 w-40 rounded font-bold" />
                </div>
              </div>
            ))}
          </div>
        ) : songsError ? (
          <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">
              Error Loading Songs
            </h3>
            <p className="text-red-700">{songsError?.message}</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="text-gray-500">No songs in this playlist.</div>
        ) : (
          <div className="space-y-2">
            {songs.map((song: MusicItem, index: number) => (
              <div
                key={song.id}
                className="flex items-center justify-between gap-4 p-3 rounded-lg border-b border-gray-200 hover:bg-gray-700/30 transition-all duration-200 ease-in-out cursor-pointer hover:scale-[1.01] group"
                onClick={() => handlePlaySong(song, index)}
              >
                <div className="relative group w-16 h-16 flex-shrink-0">
                  <Image
                    src={song.artwork}
                    alt={song.title}
                    width={64}
                    height={64}
                    className="rounded-md object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                    <PlayCircle className="text-gray-500" size={32} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{song.title}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <p className="text-sm text-gray-400 truncate">
                      {song.artist.username}
                    </p>
                  </div>
                  {song.genre && (
                    <p className="text-xs text-gray-500 truncate">
                      {song.genre}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  {/* Play button, only visible on hover */}
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    title="Play"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaySong(song, index);
                    }}
                  >
                    <Play size={24} />
                  </button>
                  <span className="text-sm text-gray-400">
                    {formatDuration(song.duration)}
                  </span>
                  <button
                    className={`p-1 rounded-full hover:bg-pink-100 transition-transform duration-300 cursor-pointer ${
                      animatingHearts.has(song.id) ? "scale-125" : "scale-100"
                    }`}
                    title="Like"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(song.id);
                    }}
                  >
                    {likedIds.has(song.id) ? (
                      <HeartIcon
                        size={16}
                        className="text-pink-500 fill-pink-500"
                      />
                    ) : (
                      <Heart size={16} className="text-pink-500" />
                    )}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-1 rounded-full hover:bg-gray-200 cursor-pointer"
                        title="More"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal size={16} />
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
            ))}
          </div>
        )}
      </div>
      {/* Sticky Player */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <MusicPlayer />
      </div>
    </div>
  );
};

export default PlaylistPage;
