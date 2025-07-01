"use client";

import { use, useEffect, useState } from "react";
import { useMusicPlayer } from "app/provider/MusicContext";
import { motion } from "framer-motion";
import { PlayCircle, Heart, HeartIcon, MoreHorizontal } from "lucide-react";
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
} from "app/query/useSongQueries";
import { useRecentPlayed } from "app/query/useInteractQueries";
import { useSelector } from "react-redux";
import { RootState } from "app/store/store";

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

  const handlePlaySong = (
    song: MusicItem | RecentPlayedSong,
    index: number
  ) => {
    // Convert to Song format for the music player
    const songForPlayer = {
      id: "trackId" in song ? song.trackId : song.id,
      title: song.title,
      artist:
        typeof song.artist === "string" ? song.artist : song.artist.username,
      artistId:
        typeof song.artist === "string"
          ? (song as RecentPlayedSong).artistId || ""
          : song.artist.id,
      artwork: song.artwork,
      duration: song.duration,
    };

    // Convert all songs to Song format
    const songsForPlayer = songs.map((s: MusicItem | RecentPlayedSong) => ({
      id: "trackId" in s ? s.trackId : s.id,
      title: s.title,
      artist: typeof s.artist === "string" ? s.artist : s.artist.username,
      artistId:
        typeof s.artist === "string"
          ? (s as RecentPlayedSong).artistId || ""
          : s.artist.id,
      artwork: s.artwork,
      duration: s.duration,
    }));

    // Queue all songs from this collection
    playFromPlaylist(songForPlayer, type, index, songsForPlayer);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="pb-28">
      <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={
              config.query === "globalTrending" && songs.length > 0
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
                config.query === "globalTrending" && songs.length > 0
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
                <PlayCircle size={28} />
                Play All
              </motion.button>
            )}

            {/* Load More Button for Global Trending */}
            {config.query === "globalTrending" && hasNextGlobalTrending && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-medium"
                onClick={() => fetchNextGlobalTrending()}
              >
                Load More
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        {isLoading && songs.length === 0 && (
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

        {songs.length > 0 && (
          <div className="space-y-2">
            {songs.map((song: MusicItem | RecentPlayedSong, index: number) => (
              <div
                key={"trackId" in song ? song.trackId : song.id}
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
                  <div className="flex items-center gap-1 mt-1">
                    <p className="text-sm text-gray-400">
                      {typeof song.artist === "string"
                        ? song.artist
                        : song.artist.username}
                    </p>
                    {typeof song.artist === "object" &&
                      song.artist.verified && (
                        <span
                          className="text-blue-500 text-xs"
                          title="Verified Artist"
                        >
                          ✓
                        </span>
                      )}
                  </div>
                  {typeof song.artist === "object" && song.artist.city && (
                    <p className="text-xs text-gray-500">
                      {song.artist.city}
                      {song.artist.countryCode &&
                        `, ${song.artist.countryCode}`}
                    </p>
                  )}
                  {"playbackCount" in song && song.playbackCount && (
                    <p className="text-xs text-gray-500">
                      {song.playbackCount.toLocaleString()} plays
                    </p>
                  )}
                  {"playedAt" in song && (
                    <p className="text-xs text-gray-500">
                      Played {new Date(song.playedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {formatDuration(song.duration)}
                  </span>
                  <button
                    className={`p-1 rounded-full hover:bg-pink-100 transition-transform duration-300 ${
                      animatingHearts.has(
                        "trackId" in song ? song.trackId : song.id
                      )
                        ? "scale-125"
                        : "scale-100"
                    }`}
                    title="Like"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike("trackId" in song ? song.trackId : song.id);
                    }}
                  >
                    {likedIds.has(
                      "trackId" in song ? song.trackId : song.id
                    ) ? (
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
                        className="p-1 rounded-full hover:bg-gray-200"
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

export default CollectionPage;
