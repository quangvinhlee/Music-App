"use client";

import { use, useState } from "react";
import { useMusicPlayer } from "app/provider/MusicContext";
import { motion } from "framer-motion";
import {
  Play,
  Music,
  Clock,
  TrendingUp,
  History,
  Heart,
  Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import MusicPlayer from "@/components/MusicPlayer";
import Image from "next/image";
import { MusicItem } from "@/types/music";
import {
  useGlobalTrendingSongs,
  useTrendingPlaylistSongs,
  useRecommendSongs,
} from "app/query/useSoundcloudQueries";
import { useRecentPlayed } from "app/query/useInteractQueries";
import { useSelector } from "react-redux";
import { RootState } from "app/store/store";
import InfiniteScroll from "react-infinite-scroll-component";
import TrackList from "@/components/TrackList";

interface Props {
  params: Promise<{ type: string; id?: string }>;
}

// Collection configuration
const COLLECTION_CONFIG = {
  "global-trending": {
    title: "Global Trending Songs",
    description: "The hottest tracks from around the world",
    artwork: "/all-music.jpg",
    icon: TrendingUp,
    query: "globalTrending",
    gradient: "from-orange-500 to-red-500",
  },
  "listen-history": {
    title: "Recently Played",
    description: "Your listening history and favorite tracks",
    artwork: "/music-plate.jpg",
    icon: History,
    query: "recentPlayed",
    gradient: "from-purple-500 to-pink-500",
  },
  playlist: {
    title: "Playlist",
    description: "Curated music collection",
    artwork: "/music-plate.jpg",
    icon: Music,
    query: "playlist",
    gradient: "from-blue-500 to-purple-500",
  },
  recommend: {
    title: "Recommended For You",
    description:
      "Personalized song recommendations based on your listening history",
    artwork: "/music-plate.jpg",
    icon: Heart,
    query: "recommend",
    gradient: "from-green-500 to-teal-500",
  },
};

const CollectionPage = ({ params }: Props) => {
  const { type, id } = use(params);
  const { playFromPlaylist } = useMusicPlayer();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const config = COLLECTION_CONFIG[type as keyof typeof COLLECTION_CONFIG];

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
            <Music size={32} className="text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Collection Not Found
          </h1>
          <p className="text-gray-400 max-w-md">
            The requested collection doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Fetch data based on collection type
  const {
    data: globalTrendingData,
    isLoading: isLoadingGlobalTrending,
    fetchNextPage: fetchNextGlobalTrending,
    hasNextPage: hasNextGlobalTrending,
  } = useGlobalTrendingSongs({
    enabled: config.query === "globalTrending",
  });

  const { data: recentPlayed = [], isLoading: isLoadingRecent } =
    useRecentPlayed(user, {
      enabled: config.query === "recentPlayed" && isAuthenticated,
    });

  const { data: playlistSongs = [], isLoading: isLoadingPlaylist } =
    useTrendingPlaylistSongs(id || "", {
      enabled: config.query === "playlist" && !!id,
    });

  const { data: recommendSongs = [], isLoading: isLoadingRecommend } =
    useRecommendSongs({
      enabled: config.query === "recommend" && isAuthenticated,
    });

  // Get songs based on collection type
  const getSongs = () => {
    switch (config.query) {
      case "globalTrending":
        return (
          globalTrendingData?.pages?.flatMap((page) => page.tracks || []) || []
        );
      case "recentPlayed":
        return recentPlayed;
      case "playlist":
        return playlistSongs;
      case "recommend":
        return recommendSongs;
      default:
        return [];
    }
  };

  const songs = getSongs();
  const isLoading =
    config.query === "globalTrending"
      ? isLoadingGlobalTrending
      : config.query === "playlist"
        ? isLoadingPlaylist
        : config.query === "recommend"
          ? isLoadingRecommend
          : isLoadingRecent;

  // Like state for songs
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
    playFromPlaylist(song, type, index, songs);
  };

  const handleShufflePlay = () => {
    if (songs.length === 0) return;

    // Create a shuffled copy of the songs array
    const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
    const firstShuffledSong = shuffledSongs[0];

    // Play the first song from the shuffled array
    if (firstShuffledSong) {
      playFromPlaylist(firstShuffledSong, `${type}-shuffled`, 0, shuffledSongs);
    }
  };

  // Determine infinite scroll props
  let fetchNext = () => {};
  let hasMore = false;
  if (config.query === "globalTrending") {
    fetchNext = fetchNextGlobalTrending;
    hasMore = hasNextGlobalTrending;
  }

  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative w-full h-80 sm:h-96 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={songs.length > 0 ? songs[0].artwork : config.artwork}
            alt="Background"
            fill
            className="object-cover w-full h-full blur-xl brightness-25 scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 p-6 sm:p-8 md:p-12 h-full flex flex-col justify-end">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Collection Icon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 shadow-2xl rounded-2xl overflow-hidden border-2 border-gray-600/30 flex-shrink-0 bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
            >
              <IconComponent size={64} className="text-white" />
            </motion.div>

            {/* Collection Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white space-y-4 flex-1 min-w-0"
            >
              <div className="space-y-2">
                <p className="uppercase text-xs tracking-widest text-gray-300 font-medium">
                  Collection
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  {config.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
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

              <p className="text-gray-300 max-w-2xl">{config.description}</p>

              {songs.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-gradient-to-r ${config.gradient} hover:brightness-110 text-white px-8 py-4 rounded-full flex items-center gap-3 text-lg font-semibold shadow-2xl transition-all duration-300 w-fit`}
                  onClick={() => {
                    const firstSong = songs[0];
                    if (firstSong) {
                      handlePlaySong(firstSong, 0);
                    }
                  }}
                >
                  <Play size={28} />
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
                {songs.length} songs in this collection
              </p>
            </div>
            {songs.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-gradient-to-r ${config.gradient} bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium border border-current border-opacity-30 transition-all duration-200`}
                onClick={handleShufflePlay}
              >
                <Play size={16} />
                Shuffle Play
              </motion.button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && songs.length === 0 && (
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
          )}

          {/* Empty State */}
          {!isLoading && songs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className={`w-24 h-24 bg-gradient-to-br ${config.gradient} bg-opacity-20 rounded-full flex items-center justify-center mb-6 border border-current border-opacity-30`}
              >
                <IconComponent size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No tracks yet
              </h3>
              <p className="text-gray-400 max-w-md">
                {config.query === "recentPlayed"
                  ? "Start listening to tracks to see them here!"
                  : config.query === "recommend"
                    ? "Listen to more tracks to get personalized recommendations!"
                    : "This collection is empty. Check back later for new content!"}
              </p>
            </div>
          )}

          {/* Track List with Infinite Scroll */}
          {songs.length > 0 && (
            <InfiniteScroll
              dataLength={songs.length}
              next={fetchNext}
              hasMore={hasMore}
              loader={
                <div className="space-y-4 py-8">
                  {[...Array(4)].map((_, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 items-center p-4 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700/30 animate-pulse"
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
              }
              scrollThreshold={0.9}
            >
              <TrackList tracks={songs} artistId={type} />
            </InfiniteScroll>
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

export default CollectionPage;
