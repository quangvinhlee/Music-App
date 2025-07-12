"use client";

import { use } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "app/store/store";
import { useTrendingPlaylistSongs } from "app/query/useSoundcloudQueries";
import { MusicItem } from "@/types/music";
import MusicPlayer from "@/components/MusicPlayer";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useMusicPlayer } from "app/provider/MusicContext";
import TrackList from "@/components/TrackList";

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

  // Add play handler
  const handlePlaySong = (song: MusicItem, index: number) => {
    playFromPlaylist(song, id, index, songs);
  };

  if (!playlist || playlist.id !== id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-2xl font-semibold mb-2 text-white">
          Playlist not found
        </div>
        <div className="text-gray-400">
          Please go back to the homepage and select a playlist.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden">
        {/* Blurred Background Image */}
        {playlist.artwork && (
          <div className="absolute inset-0 z-0">
            <Image
              src={playlist.artwork}
              alt="Background"
              fill
              className="object-cover w-full h-full blur-lg brightness-50 scale-110"
              priority
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </div>
        )}
        {/* Foreground Content */}
        <div className="relative z-10 p-6 sm:p-10 md:p-14 h-full flex items-end gap-6">
          <div className="w-40 h-40 sm:w-52 sm:h-52 shadow-2xl rounded-xl overflow-hidden border-2 border-gray-600/50">
            <Image
              src={playlist.artwork}
              alt={playlist.title}
              width={208}
              height={208}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="text-white space-y-2">
            <p className="uppercase text-xs tracking-widest text-gray-300">
              Playlist
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {playlist.title}
            </h1>
            <p className="text-sm text-gray-300">
              Curated by {playlist.owner || "Admin"}
            </p>
            <p className="text-sm text-gray-300">{songs.length} songs</p>
            {songs.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-2xl transition-all duration-300"
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
                <Skeleton className="w-24 h-24 rounded-lg bg-gray-600" />
                <div className="space-y-4">
                  <Skeleton className="h-6 w-64 rounded font-bold bg-gray-600" />
                  <Skeleton className="h-5 w-40 rounded font-bold bg-gray-600" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <TrackList tracks={songs} artistId={id} />
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
