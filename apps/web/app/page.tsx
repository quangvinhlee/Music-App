/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import {
  useTrendingSongPlaylists,
  useTrendingIdByCountry,
  useGlobalTrendingSongs,
} from "app/query/useSongQueries";
import { useRecentPlayed } from "app/query/useInteractQueries";
import { useGeoInfo } from "app/query/useAuthQueries";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "app/store/store";
import { useMusicPlayer } from "app/provider/MusicContext";
import { useImageErrors } from "app/hooks/useImageErrors";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { CarouselSection } from "@/components/homepage/CarouselSection";
import { Sidebar } from "@/components/homepage/Sidebar";
import { Heart, HeartIcon, MoreHorizontal, Play } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { setSelectedPlaylist } from "app/store/song";

interface RecentPlayedSong {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  artistId: string;
  artwork: string;
  duration: number;
  playedAt: string;
  userId: string;
}

interface TrendingIdData {
  id: string;
}

interface Playlist {
  id: string;
  title: string;
  artwork: string;
}

interface GlobalTrendingSong {
  id: string;
  title: string;
  artist: {
    id: string;
    username: string;
    avatarUrl: string;
    verified: boolean;
    city?: string;
    countryCode?: string;
  };
  genre: string;
  artwork: string;
  duration: number;
  playbackCount: number;
}

function formatDuration(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

const HomePage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Get authentication state
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Get music player functions
  const { playSingleSong } = useMusicPlayer();

  // Image error handling
  const { handleImageError, hasImageError } = useImageErrors();

  // Get country code and trending ID
  const { data: geoInfo } = useGeoInfo();
  const countryCode = geoInfo?.countryCode || "US";
  const { data: trendingIdData, isLoading: isLoadingTrendingId } =
    useTrendingIdByCountry(countryCode);
  const trendingId = (trendingIdData as TrendingIdData)?.id || "";

  const {
    data: playlists = [],
    isLoading: isLoadingPlaylists,
    error,
  } = useTrendingSongPlaylists(trendingId ?? "", { enabled: !!trendingId });

  // Combined loading state for trending playlists
  const isLoadingTrendingPlaylists = isLoadingTrendingId || isLoadingPlaylists;

  // Fetch global trending songs
  const {
    data: globalTrendingData,
    isLoading: isLoadingGlobalTrending,
    fetchNextPage: fetchNextGlobalTrending,
    hasNextPage: hasNextGlobalTrending,
  } = useGlobalTrendingSongs();

  // Get all global trending songs from all pages
  const globalTrendingSongs =
    globalTrendingData?.pages?.flatMap((page) => page.tracks || []) || [];

  // Fetch recent played songs for authenticated users
  const { data: recentPlayed = [], isLoading: isLoadingRecent } =
    useRecentPlayed(user, { enabled: isAuthenticated });

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

    // Add animation
    setAnimatingHearts((prev) => new Set(prev).add(songId));
    setTimeout(() => {
      setAnimatingHearts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
    }, 300);
  };

  const handleClick = (playlist: Playlist) => () => {
    dispatch(setSelectedPlaylist(playlist));
    router.push(`/playlist/${playlist.id}`);
  };

  const handleSongClick =
    (song: RecentPlayedSong | GlobalTrendingSong) => () => {
      // Convert song to Song format and play it
      const songToPlay = {
        id: "trackId" in song ? song.trackId : song.id,
        title: song.title,
        artist:
          "artist" in song && typeof song.artist === "object"
            ? song.artist.username
            : song.artist,
        artistId:
          "artist" in song && typeof song.artist === "object"
            ? song.artist.id
            : song.artistId,
        artwork: song.artwork,
        duration: song.duration,
      };
      playSingleSong(songToPlay);
    };

  // Fallback image component
  const ImageWithFallback = ({
    src,
    alt,
    width,
    height,
    className,
    imageId,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className: string;
    imageId: string;
  }) => {
    if (!src || hasImageError(imageId)) {
      return (
        <Image
          src="/music-plate.jpg"
          alt="Fallback"
          width={width}
          height={height}
          className={className}
          style={{ objectFit: "cover" }}
        />
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => handleImageError(imageId)}
      />
    );
  };

  return (
    <div className="bg-[#f2f2f2] min-h-screen p-4">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Trending Playlists Section */}
          <CarouselSection
            title="Trending Playlists"
            items={playlists as Playlist[]}
            isLoading={isLoadingTrendingPlaylists}
            renderItem={(playlist: Playlist) => (
              <motion.div
                className="cursor-pointer"
                onClick={handleClick(playlist)}
                whileHover={{ scale: 1.03 }}
              >
                <div className="rounded-md overflow-hidden shadow-md bg-white">
                  <ImageWithFallback
                    src={playlist.artwork}
                    alt={playlist.title}
                    width={200}
                    height={150}
                    className="object-cover w-full h-auto"
                    imageId={playlist.id}
                  />
                  <div className="p-2 flex items-center justify-center">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {playlist.title === "SoundCloud"
                        ? "All Genres"
                        : playlist.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          />

          {/* Global Trending Songs Section */}
          <CarouselSection
            title="Global Trending Songs"
            items={globalTrendingSongs.slice(0, 10)}
            isLoading={isLoadingGlobalTrending}
            viewAllHref="/global-trending"
            renderItem={(song: GlobalTrendingSong) => (
              <motion.div
                className="cursor-pointer group"
                onClick={handleSongClick(song)}
                whileHover={{ scale: 1.03 }}
              >
                <div className="rounded-md overflow-hidden shadow-md bg-white">
                  <div className="relative">
                    <ImageWithFallback
                      src={song.artwork}
                      alt={song.title}
                      width={200}
                      height={150}
                      className="object-cover w-full h-auto"
                      imageId={song.id}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded transition-all duration-200 group-hover:backdrop-blur-[2px] group-hover:bg-black/30">
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity mb-1"
                        title="Play"
                      >
                        <Play size={32} className="text-white" />
                      </button>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white bg-black/60 rounded px-2 py-0.5 mb-2">
                        {formatDuration(song.duration)}
                      </span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className={`p-1 rounded-full hover:bg-pink-100 transition-transform duration-300 ${
                            animatingHearts.has(song.id)
                              ? "scale-125"
                              : "scale-100"
                          }`}
                          title="Like"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(song.id);
                          }}
                        >
                          {likedIds.has(song.id) ? (
                            <HeartIcon
                              size={18}
                              className="text-pink-500 fill-pink-500"
                            />
                          ) : (
                            <Heart size={18} className="text-pink-500" />
                          )}
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-1 rounded-full hover:bg-gray-200"
                              title="More"
                            >
                              <MoreHorizontal size={18} />
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
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {song.artist.username}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {song.playbackCount.toLocaleString()} plays
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          />

          {/* Recently Played Section - Only for authenticated users */}
          {isAuthenticated && (
            <CarouselSection
              title="Recently Played"
              items={recentPlayed.slice(0, 10)}
              isLoading={isLoadingRecent}
              viewAllHref="/listen-history"
              renderItem={(song: RecentPlayedSong) => (
                <motion.div
                  className="cursor-pointer group"
                  onClick={handleSongClick(song)}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="rounded-md overflow-hidden shadow-md bg-white">
                    <div className="relative">
                      <ImageWithFallback
                        src={song.artwork}
                        alt={song.title}
                        width={200}
                        height={150}
                        className="object-cover w-full h-auto"
                        imageId={song.trackId}
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded transition-all duration-200 group-hover:backdrop-blur-[2px] group-hover:bg-black/30">
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity mb-1"
                          title="Play"
                        >
                          <Play size={32} className="text-white" />
                        </button>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white bg-black/60 rounded px-2 py-0.5 mb-2">
                          {formatDuration(song.duration)}
                        </span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className={`p-1 rounded-full hover:bg-pink-100 transition-transform duration-300 ${
                              animatingHearts.has(song.id)
                                ? "scale-125"
                                : "scale-100"
                            }`}
                            title="Like"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(song.id);
                            }}
                          >
                            {likedIds.has(song.id) ? (
                              <HeartIcon
                                size={18}
                                className="text-pink-500 fill-pink-500"
                              />
                            ) : (
                              <Heart size={18} className="text-pink-500" />
                            )}
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="p-1 rounded-full hover:bg-gray-200"
                                title="More"
                              >
                                <MoreHorizontal size={18} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Share</DropdownMenuItem>
                              <DropdownMenuItem>Copy URL</DropdownMenuItem>
                              <DropdownMenuItem>
                                Add to Playlist
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {song.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {song.artist}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            />
          )}
        </div>
        <Sidebar
          recentPlayed={recentPlayed as RecentPlayedSong[]}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
};

export default HomePage;
