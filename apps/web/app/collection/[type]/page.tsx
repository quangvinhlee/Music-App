"use client";

import { use, useEffect, useState } from "react";
import { useMusicPlayer } from "app/provider/MusicContext";
import { motion } from "framer-motion";
import { Play, Heart, HeartIcon, MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import MusicPlayer from "@/components/MusicPlayer";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MusicItem, RecentPlayedSong } from "@/types/music";
import {
  useGlobalTrendingSongs,
  useTrendingPlaylistSongs,
  useRecommendSongs,
} from "app/query/useSoundCloudQueries";
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
    artwork: "/all-music.jpg", // Default trending artwork
    query: "globalTrending",
  },
  "listen-history": {
    title: "Recently Played",
    description: "Your listening history",
    artwork: "/music-plate.jpg",
    query: "recentPlayed",
  },
  playlist: {
    title: "Playlist",
    description: "Curated music collection",
    artwork: "/music-plate.jpg",
    query: "playlist",
  },
  recommend: {
    title: "Recommended For You",
    description:
      "Personalized song recommendations based on your listening history",
    artwork: "/music-plate.jpg",
    query: "recommend",
  },
  // Add more collection types here
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
      <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Collection Not Found
          </h1>
          <p className="text-gray-600">
            The requested collection doesn't exist.
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

  // Add recommendSongs fetch
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
        console.log("Unliked:", songId);
      } else {
        newSet.add(songId);
        console.log("Liked:", songId);
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

  // Determine infinite scroll props
  let fetchNext = () => {};
  let hasMore = false;
  if (config.query === "globalTrending") {
    fetchNext = fetchNextGlobalTrending;
    hasMore = hasNextGlobalTrending;
  }
  // You can add similar logic for other paginated types if needed

  return (
    <div className="pb-28">
      <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={
              (config.query === "globalTrending" ||
                config.query === "recommend") &&
              songs.length > 0
                ? songs[0].artwork
                : config.artwork
            }
            alt="Background"
            fill
            className="object-cover w-full h-full blur-lg brightness-75 scale-110"
            priority
          />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 p-6 sm:p-10 md:p-14 h-full flex items-end gap-6">
          <div className="w-40 h-40 sm:w-52 sm:h-52 shadow-xl rounded-lg overflow-hidden border-2 border-gray-300">
            <Image
              src={
                (config.query === "globalTrending" ||
                  config.query === "recommend") &&
                songs.length > 0
                  ? songs[0].artwork
                  : config.artwork
              }
              alt={config.title}
              width={208}
              height={208}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="text-gray-900 space-y-2">
            <p className="uppercase text-xs tracking-widest text-gray-600">
              Collection
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {config.title}
            </h1>
            <p className="text-sm text-gray-700">{config.description}</p>
            <p className="text-sm text-gray-700">{songs.length} songs</p>

            {songs.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-lg"
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
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        {isLoading && songs.length === 0 && (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-6 items-center">
                <Skeleton className="w-24 h-24 rounded-lg" />
                <div className="space-y-4">
                  <Skeleton className="h-6 w-64 rounded font-bold" />
                  <Skeleton className="h-5 w-40 rounded font-bold" />
                </div>
              </div>
            ))}
          </div>
        )}

        <InfiniteScroll
          dataLength={songs.length}
          next={fetchNext}
          hasMore={hasMore}
          loader={
            <div className="space-y-4 py-8">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex gap-6 items-center p-4 rounded-lg bg-white/80 shadow animate-pulse"
                >
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-6 w-1/2 rounded font-bold" />
                    <Skeleton className="h-5 w-1/3 rounded font-bold" />
                    <Skeleton className="h-4 w-1/4 rounded font-bold" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-5 w-10 rounded font-bold" />
                    <Skeleton className="h-8 w-8 rounded-full font-bold" />
                  </div>
                </div>
              ))}
            </div>
          }
          scrollThreshold={0.9}
        >
          <TrackList tracks={songs} artistId={type} />
          {/* End message if no more songs */}
          {!hasMore && songs.length > 0 && (
            <div className="text-center text-gray-400 py-6 text-sm">
              No more songs to load.
            </div>
          )}
        </InfiniteScroll>
      </div>

      {/* Sticky Player */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <MusicPlayer />
      </div>
    </div>
  );
};

export default CollectionPage;
