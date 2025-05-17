"use client";

import { use, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "app/store/store";
import {
  fetchTrendingPlaylistSongs,
  fetchTrendingSongPlaylists,
} from "app/store/song";
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

const PlaylistPage = ({ params }: Props) => {
  const { id } = use(params);
  const dispatch = useDispatch<AppDispatch>();
  const abortControllerRef = useRef<AbortController | null>(null);
  // Add state to track initial loading
  const [initialLoad, setInitialLoad] = useState(true);
  const [playlist, setPlaylist] = useState<any>(null);

  const { playFromPlaylist } = useMusicPlayer();

  const { playlistSongs, isLoading, error } = useSelector(
    (state: RootState) => state.song
  );

  const { playlists } = useSelector((state: RootState) => state.song);

  useEffect(() => {
    if (playlists.length > 0) {
      // Try to find playlist in Redux store
      const foundPlaylist = playlists.find((pl) => pl.id === id);
      if (foundPlaylist) {
        setPlaylist(foundPlaylist);
      } else {
        // If not found, check localStorage
        const stored = localStorage.getItem("trendingPlaylists");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const foundFromStorage = parsed.find((pl) => pl.id === id);
            if (foundFromStorage) {
              setPlaylist(foundFromStorage);
            }
          } catch {
            // Handle JSON parsing error
            console.error("Error parsing stored playlists");
          }
        }
      }
    }
  }, [id, playlists]);

  const songs = playlistSongs[id] || [];

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (playlists.length === 0) {
        try {
          const trendingId = localStorage.getItem("trendingId");
          if (trendingId) {
            await dispatch(
              fetchTrendingSongPlaylists({
                id: trendingId,
                signal: new AbortController().signal,
              }) as any
            );
          }
        } catch (error) {
          console.error("Failed to fetch playlists:", error);
        }
      }
    };

    fetchPlaylists();
  }, [dispatch, playlists.length]);

  useEffect(() => {
    if (songs.length > 0) {
      setInitialLoad(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const fetchData = async () => {
      try {
        await dispatch(
          fetchTrendingPlaylistSongs({
            id,
            signal:
              abortControllerRef.current?.signal ||
              new AbortController().signal,
          }) as any
        );
        setInitialLoad(false);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to fetch playlist songs");
          console.error(error);
        }
        setInitialLoad(false);
      }
    };

    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dispatch, id, songs.length]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handlePlaySong = (song, index) => {
    playFromPlaylist(song, id, index);
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
                <p className="text-sm text-gray-700">{songs.length} songs</p>

                {songs.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-lg animate-pulse"
                    onClick={() =>
                      songs[0] && playFromPlaylist(songs[0], id, 0)
                    }
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
        {initialLoad && songs.length === 0 && (
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

        {error && <div className="text-red-500">Error: {error}</div>}

        {!isLoading && songs.length > 0 && (
          <div className="space-y-2">
            {songs.map((song, index) => (
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
