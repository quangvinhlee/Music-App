"use client";

import { use, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "app/store/store";
import { fetchTrendingPlaylistSongs } from "app/store/song";
import { toast } from "sonner";
import { PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import MusicPlayer from "@/components/MusicPlayer";
import Image from "next/image";

interface Props {
  params: Promise<{ id: string }>;
}

const PlaylistPage = ({ params }: Props) => {
  const { id } = use(params);
  const dispatch = useDispatch<AppDispatch>();
  const [hasFetched, setHasFetched] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [currentSong, setCurrentSong] = useState(null);

  // Get songs from Redux store
  const { songs, isLoading, error } = useSelector(
    (state: RootState) => state.song
  );

  useEffect(() => {
    // Prevent duplicate fetches
    if (hasFetched) return;

    // Cleanup previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller
    abortControllerRef.current = new AbortController();

    const fetchData = async () => {
      try {
        await dispatch(
          fetchTrendingPlaylistSongs({
            id,
            signal: abortControllerRef.current?.signal,
          }) as any
        );
        setHasFetched(true);
      } catch (error) {
        // Only show error if not aborted
        if (error.name !== "AbortError") {
          toast.error("Failed to fetch playlist songs");
          console.error(error);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dispatch, id, hasFetched]);

  // Format duration to minutes:seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Handle play song
  const handlePlaySong = (song) => {
    setCurrentSong(song);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Playlist: {id}</h1>

      {isLoading && (
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

      {!isLoading && songs && songs.length > 0 && (
        <div className="space-y-4">
          {songs.map((song) => (
            <div
              key={song.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-700/20 transition-colors cursor-pointer"
              onClick={() => handlePlaySong(song)}
            >
              <div className="relative w-16 h-16 group">
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
                <h3 className="font-medium">{song.title}</h3>
                <p className="text-sm text-gray-400">{song.artist}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>{song.genre}</span>
                  <span>{formatDuration(song.duration)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {songs && songs.length === 0 && !isLoading && (
        <div className="text-center py-10 text-gray-500">
          No songs found in this playlist.
        </div>
      )}

      {currentSong && <MusicPlayer song={currentSong} />}
    </div>
  );
};

export default PlaylistPage;
