"use client";

import { use, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "app/store/store";
import {
  useTrendingSongPlaylists,
  useTrendingPlaylistSongs,
} from "app/query/useSongQueries";
import { toast } from "sonner";
import { PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import MusicPlayer from "@/components/MusicPlayer";
import Image from "next/image";
import { useMusicPlayer } from "app/provider/MusicContext";
import { motion } from "framer-motion";

interface Props {
  params: Promise<{ id: string }>;
}

interface Playlist {
  id: string;
  title: string;
  artwork: string;
  owner?: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  genre?: string;
}

const PlaylistPage = ({ params }: Props) => {
  const { id } = use(params);
  const { playFromPlaylist } = useMusicPlayer();

  // Get trendingId from localStorage (set by AuthLoader)
  const trendingId =
    typeof window !== "undefined" ? localStorage.getItem("trendingId") : null;

  // Fetch playlists if trendingId exists
  const {
    data: playlists = [],
    isLoading: playlistsLoading,
    error: playlistsError,
  } = useTrendingSongPlaylists(trendingId ?? "", { enabled: !!trendingId });

  // Find playlist by id
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  useEffect(() => {
    if ((playlists as Playlist[]).length > 0) {
      const foundPlaylist = (playlists as Playlist[]).find(
        (pl: Playlist) => pl.id === id
      );
      if (foundPlaylist) {
        setPlaylist(foundPlaylist);
      } else {
        // fallback to localStorage if not found
        const stored = localStorage.getItem("trendingPlaylists");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const foundFromStorage = parsed.find(
              (pl: Playlist) => pl.id === id
            );
            if (foundFromStorage) setPlaylist(foundFromStorage);
          } catch {
            // ignore
          }
        }
      }
    }
  }, [id, playlists]);

  // Fetch songs for this playlist
  const {
    data: songs = [],
    isLoading: songsLoading,
    error: songsError,
  } = useTrendingPlaylistSongs(id, { enabled: !!id });

  const [initialLoad, setInitialLoad] = useState(true);
  useEffect(() => {
    if (!songsLoading) setInitialLoad(false);
  }, [songsLoading]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handlePlaySong = (song: Song, index: number) => {
    // Queue all songs from this playlist
    playFromPlaylist(song, id, index, songs as Song[]);
  };

  return (
    <div className="pb-28">
      <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden">
        {/* Placeholder banner if playlist is not yet available */}
        {!playlist && !initialLoad && (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-xl">
                Loading playlist details...
              </div>
            </div>
          </div>
        )}

        {/* Blurred Background Image when playlist is available */}
        {playlist?.artwork && (
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
          {/* Placeholder for playlist image and details */}
          {!playlist && !initialLoad && (
            <>
              <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-lg bg-gray-300 animate-pulse"></div>
              <div className="text-gray-900 space-y-2">
                <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                <div className="h-10 w-48 bg-gray-300 animate-pulse rounded"></div>
                <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
              </div>
            </>
          )}

          {/* Actual playlist content when available */}
          {playlist && (
            <>
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
                <p className="text-sm text-gray-700">
                  {(songs as Song[]).length} songs
                </p>

                {(songs as Song[]).length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-lg animate-pulse"
                    onClick={() => {
                      const firstSong = (songs as Song[])[0];
                      if (firstSong) {
                        playFromPlaylist(firstSong, id, 0, songs as Song[]);
                      }
                    }}
                  >
                    <PlayCircle size={28} />
                    Play All
                  </motion.button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        {initialLoad && (songs as Song[]).length === 0 && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="w-16 h-16 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        )}

        {(songsError || playlistsError) && (
          <div className="text-red-500">
            Error: {songsError?.message || playlistsError?.message}
          </div>
        )}

        {!songsLoading && (songs as Song[]).length > 0 && (
          <div className="space-y-2">
            {(songs as Song[]).map((song: Song, index: number) => (
              <div
                key={song.id}
                className="grid grid-cols-[64px_1fr_auto] items-center gap-4 p-3 rounded-lg hover:bg-gray-700/30 transition-all duration-200 ease-in-out cursor-pointer hover:scale-[1.01]"
                onClick={() => handlePlaySong(song, index)}
              >
                <div className="relative group w-16 h-16">
                  <Image
                    src={song.artwork}
                    alt={song.title}
                    width={64}
                    height={64}
                    className="rounded-md object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                    <PlayCircle className="text-white" size={32} />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">{song.title}</h3>
                  <p className="text-sm text-gray-400">{song.artist}</p>
                  <p className="text-xs text-gray-500">{song.genre}</p>
                </div>
                <span className="text-sm text-gray-400 justify-self-end">
                  {formatDuration(song.duration)}
                </span>
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
