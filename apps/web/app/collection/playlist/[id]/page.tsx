"use client";

import { use } from "react";
import { useAlbumTracks } from "app/query/useSoundcloudQueries";
import { MusicItem } from "@/types/music";
import MusicPlayer from "@/components/MusicPlayer";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayCircle, Music, Clock, Users, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PlaylistPageSkeleton } from "@/components/SkeletonComponents";
import { useState } from "react";
import { useMusicPlayer } from "app/provider/MusicContext";
import TrackList from "@/components/TrackList";

interface Props {
  params: Promise<{ id: string }>;
}

const PlaylistPage = ({ params }: Props) => {
  const { id } = use(params);
  const { playFromPlaylist } = useMusicPlayer();

  // Fetch playlist data using the new album tracks query
  const { data: albumData, isLoading: songsLoading } = useAlbumTracks(id, {
    enabled: !!id,
  });

  const songs = albumData?.playlist?.tracks || [];
  const playlist = albumData?.playlist;

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

  const handleShufflePlay = () => {
    if (songs.length === 0) return;

    // Create a shuffled copy of the songs array
    const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
    const firstShuffledSong = shuffledSongs[0];

    // Play the first song from the shuffled array
    if (firstShuffledSong) {
      playFromPlaylist(firstShuffledSong, `${id}-shuffled`, 0, shuffledSongs);
    }
  };

  if (songsLoading) {
    return <PlaylistPageSkeleton />;
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
            <Music size={32} className="text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Playlist Not Found
          </h1>
          <p className="text-gray-400 max-w-md">
            The playlist you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative w-full h-80 sm:h-96 overflow-hidden">
        {/* Hybrid Dark Background */}
        {playlist.artwork ? (
          <div className="absolute inset-0 z-0">
            <Image
              src={playlist.artwork}
              alt="Background"
              fill
              className="object-cover w-full h-full blur-xl brightness-40 scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
            <div className="absolute inset-0 bg-gray-900/20" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        )}

        {/* Foreground Content */}
        <div className="relative z-10 p-6 sm:p-8 md:p-12 h-full flex flex-col justify-end">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Playlist Artwork */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 shadow-2xl rounded-2xl overflow-hidden border-2 border-gray-600/30 flex-shrink-0"
            >
              <Image
                src={playlist.artwork}
                alt={playlist.title}
                width={192}
                height={192}
                className="object-cover w-full h-full"
              />
            </motion.div>

            {/* Playlist Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white space-y-4 flex-1 min-w-0"
            >
              <div className="space-y-2">
                <p className="uppercase text-xs tracking-widest text-purple-300 font-medium">
                  Playlist
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  {playlist.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>Curated by {playlist.owner}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music size={16} />
                  <span>{songs.length} songs</span>
                </div>
                {songs.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>
                      {Math.floor(
                        songs.reduce(
                          (acc: number, song: MusicItem) => acc + song.duration,
                          0
                        ) / 60
                      )}{" "}
                      min
                    </span>
                  </div>
                )}
              </div>

              {songs.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full flex items-center gap-3 text-lg font-semibold shadow-2xl transition-all duration-300 w-fit"
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
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tracks Section */}
      <div className="px-6 sm:px-8 md:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Tracks</h2>
              <p className="text-gray-400">
                {songs.length} songs in this playlist
              </p>
            </div>
            {songs.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium border border-purple-500/30 transition-all duration-200"
                onClick={handleShufflePlay}
              >
                <PlayCircle size={16} />
                Shuffle Play
              </motion.button>
            )}
          </div>

          {/* Loading State */}
          {songsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-center p-4 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700/30"
                >
                  <Skeleton className="w-16 h-16 rounded-xl bg-gray-600/50" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-48 bg-gray-600/50" />
                    <Skeleton className="h-4 w-32 bg-gray-600/50" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-12 bg-gray-600/50" />
                    <Skeleton className="w-8 h-8 rounded-full bg-gray-600/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : songs.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-6 border border-purple-500/30">
                <Music size={32} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No tracks yet
              </h3>
              <p className="text-gray-400 max-w-md">
                This playlist is empty. Add some tracks to get started!
              </p>
            </div>
          ) : (
            /* Track List */
            <TrackList tracks={songs} artistId={id} />
          )}
        </motion.div>
      </div>

      {/* Sticky Player */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <MusicPlayer />
      </div>
    </div>
  );
};

export default PlaylistPage;
