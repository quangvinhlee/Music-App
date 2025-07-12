/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import {
  useTrendingSongPlaylists,
  useTrendingIdByCountry,
  useGlobalTrendingSongs,
  useRecommendSongs,
  useRecommendedArtists,
} from "app/query/useSoundcloudQueries";
import { useRecentPlayed } from "app/query/useInteractQueries";
import { useGeoInfo } from "app/query/useAuthQueries";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "app/store/store";
import { useMusicPlayer } from "app/provider/MusicContext";
import { useImageErrors } from "app/hooks/useImageErrors";
import { getReleaseDate, getPlayedDate } from "@/utils/formatters";
import { motion } from "framer-motion";
import Image from "next/image";
import { CarouselSection } from "@/components/homepage/CarouselSection";
import { Sidebar } from "@/components/homepage/Sidebar";
import { ArtistTooltip } from "@/components/ArtistTooltip";
import PlayPauseButton from "@/components/PlayPauseButton";
import { useAddToPlaylistDialog } from "@/components/AddToPlaylistDialog";
import {
  Heart,
  HeartIcon,
  MoreHorizontal,
  Calendar,
  PlaySquare,
  Verified,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { setSelectedPlaylist, setRecommendedArtists } from "app/store/song";
import {
  MusicItem,
  RecentPlayedSong,
  Playlist,
  TrendingIdData,
  GlobalTrendingSong,
} from "@/types/music";

const HomePage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Get authentication state
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Get music player functions
  const { playSingleSong, currentSong } = useMusicPlayer();

  // Image error handling
  const { handleImageError, hasImageError } = useImageErrors();

  // Add to playlist dialog
  const { openDialog } = useAddToPlaylistDialog();

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

  // Ensure playlists is treated as an array
  const playlistsArray = Array.isArray(playlists) ? playlists : [];

  // Get recommended artists from Redux cache or fetch if needed
  const { recommendedArtists, lastFetchedArtists } = useSelector(
    (state: RootState) => state.song
  );

  // Check if we need to fetch artists (cache for 10 minutes)
  const shouldFetchArtists =
    !recommendedArtists.length ||
    !lastFetchedArtists ||
    Date.now() - lastFetchedArtists > 10 * 60 * 1000;

  // Use the new efficient recommended artists API
  const {
    data: fetchedArtists = [],
    isLoading: isLoadingRecommendedArtists,
    error: recommendedArtistsError,
  } = useRecommendedArtists(countryCode, {
    enabled: !!countryCode && shouldFetchArtists,
    limit: 50, // Get more artists to have better variety for random selection
  });

  // Update Redux cache when new data arrives
  useEffect(() => {
    if (fetchedArtists.length > 0) {
      dispatch(setRecommendedArtists(fetchedArtists));
    }
  }, [fetchedArtists, dispatch]);

  // Use cached artists or empty array
  const getRecommendArtists =
    recommendedArtists.length > 0 ? recommendedArtists : [];

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
    useRecentPlayed(user, { enabled: !!isAuthenticated });

  // Fetch recommended songs for authenticated users
  const { data: recommendSongs = [], isLoading: isLoadingRecommend } =
    useRecommendSongs({ enabled: !!isAuthenticated });

  // Like state for songs
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [animatingHearts, setAnimatingHearts] = useState<Set<string>>(
    new Set()
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  const handleDropdownOpen = (songId: string) => {
    setOpenDropdown(songId);
  };

  const handleDropdownClose = () => {
    setOpenDropdown(null);
  };

  const handleDropdownChange = (open: boolean, songId: string) => {
    if (open) {
      setOpenDropdown(songId);
    } else {
      setOpenDropdown(null);
    }
  };

  const handleClick = (playlist: Playlist) => () => {
    dispatch(setSelectedPlaylist(playlist));
    router.push(`/collection/playlist/${playlist.id}`);
  };

  const handleArtistClick = (artist: any) => {
    router.push(`/artist/${artist.id}`);
  };

  const handleSongClick = (
    song: RecentPlayedSong | GlobalTrendingSong | MusicItem,
    index?: number
  ) => {
    // Convert song to MusicItem format and play it
    const musicItem: MusicItem = {
      id: "trackId" in song ? song.trackId : song.id,
      title: song.title,
      artist: song.artist, // Always an object now
      genre: (song as any).genre || "",
      artwork: song.artwork,
      duration: song.duration,
      streamUrl: (song as any).streamUrl,
      playbackCount: (song as any).playbackCount,
      trackCount: (song as any).trackCount,
      createdAt: "createdAt" in song ? song.createdAt : undefined,
    };
    playSingleSong(musicItem);
  };

  // Fallback image component
  const ImageWithFallback = ({
    src,
    alt,
    width,
    height,
    className,
    imageId,
    priority = false,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className: string;
    imageId: string;
    priority?: boolean;
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
          priority={priority}
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
        priority={priority}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Trending Playlists Section */}
          <CarouselSection
            title="Trending Playlists"
            items={playlistsArray as Playlist[]}
            isLoading={isLoadingTrendingPlaylists}
            renderItem={(playlist: Playlist) => (
              <motion.div
                className="cursor-pointer"
                onClick={handleClick(playlist)}
                whileHover={{ scale: 1.03 }}
              >
                <div className="rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
                  <ImageWithFallback
                    src={playlist.artwork}
                    alt={playlist.title}
                    width={200}
                    height={150}
                    className="object-cover w-full h-auto"
                    imageId={playlist.id}
                    priority={true}
                  />
                  <div className="p-4 flex items-center justify-center">
                    <p className="text-sm font-medium text-white truncate">
                      {playlist.title === "SoundCloud"
                        ? "All Genres"
                        : playlist.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          />

          {/* Recommended Songs Section */}
          {isAuthenticated &&
            recentPlayed.length > 0 &&
            recommendSongs.length > 0 && (
              <CarouselSection
                title="Recommended For You"
                items={recommendSongs.slice(0, 10)}
                isLoading={isLoadingRecommend}
                viewAllHref="/collection/recommend"
                renderItem={(song: MusicItem, index: number) => {
                  const isCurrentSong = currentSong?.id === song.id;

                  return (
                    <motion.div
                      className="cursor-pointer"
                      whileHover={{ scale: 1.03 }}
                    >
                      <div
                        className={`rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-700 border transition-all duration-300 ${openDropdown === song.id ? "border-purple-500/50" : "border-gray-700/50 hover:border-purple-500/50"}`}
                      >
                        <div className="relative group">
                          <div
                            className="cursor-pointer"
                            onClick={() => handleSongClick(song, index)}
                          >
                            <ImageWithFallback
                              src={song.artwork}
                              alt={song.title}
                              width={200}
                              height={150}
                              className="object-cover w-full h-auto"
                              imageId={song.id}
                              priority={true}
                            />
                          </div>
                          <div
                            className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl transition-all duration-200 ${openDropdown === song.id ? "backdrop-blur-[2px] bg-black/40" : "group-hover:backdrop-blur-[2px] group-hover:bg-black/40"} pointer-events-none`}
                          >
                            <PlayPauseButton
                              track={song}
                              index={index}
                              onPlaySong={(track, index) =>
                                handleSongClick(track, index)
                              }
                              size={32}
                              className="text-white cursor-pointer transition-transform duration-200 hover:scale-110 pointer-events-auto mt-4"
                              showOnHover={!isCurrentSong}
                              alwaysShowWhenPlaying={isCurrentSong}
                            />
                            <div
                              className={`flex items-center gap-2 ${openDropdown === song.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
                            >
                              <button
                                className={`p-1 cursor-pointer rounded-full hover:bg-pink-500/20 transition-transform duration-300 ${
                                  animatingHearts.has(song.id)
                                    ? "scale-125"
                                    : "scale-100"
                                } transition-transform duration-200 hover:scale-110 pointer-events-auto`}
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
                              <DropdownMenu
                                open={openDropdown === song.id}
                                onOpenChange={(open) => {
                                  if (open) {
                                    setOpenDropdown(song.id);
                                  } else {
                                    setOpenDropdown(null);
                                  }
                                }}
                              >
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="p-1 cursor-pointer rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors transition-transform duration-200 hover:scale-110 pointer-events-auto"
                                    title="More"
                                  >
                                    <MoreHorizontal
                                      size={18}
                                      className="text-white"
                                    />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-gray-800 border-gray-700"
                                >
                                  <DropdownMenuItem
                                    className="text-gray-300 hover:text-white hover:bg-purple-600/20"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-gray-300 hover:text-white hover:bg-purple-600/20"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Copy URL
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-gray-300 hover:text-white hover:bg-purple-600/20"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDialog(song);
                                    }}
                                  >
                                    Add to Playlist
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm font-medium text-white truncate">
                            {song.title}
                          </p>
                          <div className="flex items-center gap-1">
                            <ArtistTooltip artist={song.artist}>
                              <p
                                className="text-xs text-gray-300 truncate hover:text-purple-400 cursor-pointer font-medium"
                                onClick={() => handleArtistClick(song.artist)}
                              >
                                {song.artist.username}
                              </p>
                            </ArtistTooltip>
                            {song.artist.verified && (
                              <Verified size={12} className="text-blue-400" />
                            )}
                          </div>
                          {song.genre && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full font-medium mt-2 inline-block border border-purple-500/30">
                              {song.genre}
                            </span>
                          )}
                          {/* For Recommended Songs section */}
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <div className="flex items-center gap-1 text-gray-400">
                              <PlaySquare size={10} className="flex-shrink-0" />
                              <span className="text-xs">
                                {song.playbackCount?.toLocaleString() || "0"}
                              </span>
                              <span className="text-xs text-gray-500">•</span>
                              <Calendar size={10} className="flex-shrink-0" />
                              <span className="text-xs truncate max-w-[80px]">
                                {song.createdAt
                                  ? getReleaseDate(song.createdAt)
                                  : "Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                }}
              />
            )}

          {/* Global Trending Songs Section */}
          <CarouselSection
            title="Global Trending Songs"
            items={globalTrendingSongs.slice(0, 10)}
            isLoading={isLoadingGlobalTrending}
            viewAllHref="/collection/global-trending"
            renderItem={(song: GlobalTrendingSong, index: number) => {
              const isCurrentSong = currentSong?.id === song.id;

              return (
                <motion.div
                  className="cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                >
                  <div
                    className={`rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-700 border transition-all duration-300 ${openDropdown === song.id ? "border-purple-500/50" : "border-gray-700/50 hover:border-purple-500/50"}`}
                  >
                    <div className="relative group">
                      <div
                        className="cursor-pointer"
                        onClick={() => handleSongClick(song, index)}
                      >
                        <ImageWithFallback
                          src={song.artwork}
                          alt={song.title}
                          width={200}
                          height={150}
                          className="object-cover w-full h-auto"
                          imageId={song.id}
                          priority={true}
                        />
                      </div>
                      <div
                        className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl transition-all duration-200 ${openDropdown === song.id || openDropdown === song.id ? "backdrop-blur-[2px] bg-black/40" : "group-hover:backdrop-blur-[2px] group-hover:bg-black/40"} pointer-events-none`}
                      >
                        <PlayPauseButton
                          track={song}
                          index={index}
                          onPlaySong={(track, index) =>
                            handleSongClick(track, index)
                          }
                          size={32}
                          className="text-white cursor-pointer transition-transform duration-200 hover:scale-110 pointer-events-auto mt-4"
                          showOnHover={!isCurrentSong}
                          alwaysShowWhenPlaying={isCurrentSong}
                        />
                        <div
                          className={`flex items-center gap-2 ${openDropdown === song.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
                        >
                          <button
                            className={`p-1 cursor-pointer rounded-full hover:bg-pink-500/20 transition-transform duration-300 ${
                              animatingHearts.has(song.id)
                                ? "scale-125"
                                : "scale-100"
                            } transition-transform duration-200 hover:scale-110 pointer-events-auto`}
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
                          <DropdownMenu
                            open={openDropdown === song.id}
                            onOpenChange={(open) => {
                              if (open) {
                                setOpenDropdown(song.id);
                              } else {
                                setOpenDropdown(null);
                              }
                            }}
                          >
                            <DropdownMenuTrigger asChild>
                              <button
                                className="p-1 cursor-pointer rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors transition-transform duration-200 hover:scale-110 pointer-events-auto"
                                title="More"
                              >
                                <MoreHorizontal
                                  size={18}
                                  className="text-white"
                                />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-gray-800 border-gray-700"
                            >
                              <DropdownMenuItem
                                className="text-gray-300 hover:text-white hover:bg-purple-600/20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-gray-300 hover:text-white hover:bg-purple-600/20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Copy URL
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-gray-300 hover:text-white hover:bg-purple-600/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDialog(song);
                                }}
                              >
                                Add to Playlist
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium text-white truncate">
                        {song.title}
                      </p>
                      <div className="flex items-center gap-1">
                        <ArtistTooltip artist={song.artist}>
                          <p
                            className="text-xs text-gray-300 truncate hover:text-purple-400 cursor-pointer font-medium"
                            onClick={() => handleArtistClick(song.artist)}
                          >
                            {song.artist.username}
                          </p>
                        </ArtistTooltip>
                        {song.artist.verified && (
                          <Verified size={12} className="text-blue-400" />
                        )}
                      </div>
                      {song.genre && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full font-medium mt-2 inline-block border border-purple-500/30">
                          {song.genre}
                        </span>
                      )}
                      {/* For Global Trending Songs section */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1 text-gray-400">
                          <PlaySquare size={10} className="flex-shrink-0" />
                          <span className="text-xs">
                            {song.playbackCount?.toLocaleString() || "0"}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <Calendar size={10} className="flex-shrink-0" />
                          <span className="text-xs truncate max-w-[80px]">
                            {song.createdAt
                              ? getReleaseDate(song.createdAt)
                              : "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }}
          />

          {/* Recently Played Section - Only for authenticated users */}
          {isAuthenticated && recentPlayed.length > 0 && (
            <CarouselSection
              title="Recently Played"
              items={recentPlayed.slice(0, 10)}
              isLoading={isLoadingRecent}
              viewAllHref="/collection/listen-history"
              renderItem={(song: RecentPlayedSong, index: number) => {
                const isCurrentSong = currentSong?.id === song.trackId;

                // Convert RecentPlayedSong to MusicItem format
                const musicItem: MusicItem = {
                  id: song.trackId,
                  title: song.title,
                  artist: song.artist,
                  genre: (song as any).genre || "",
                  artwork: song.artwork,
                  duration: song.duration,
                  streamUrl: (song as any).streamUrl || "",
                  playbackCount: (song as any).playbackCount || 0,
                  trackCount: (song as any).trackCount || 0,
                  createdAt: song.createdAt,
                };

                return (
                  <motion.div
                    className="cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                  >
                    <div
                      className={`rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-700 border transition-all duration-300 ${openDropdown === song.id ? "border-purple-500/50" : "border-gray-700/50 hover:border-purple-500/50"}`}
                    >
                      <div className="relative group">
                        <div
                          className="cursor-pointer"
                          onClick={() => handleSongClick(song, index)}
                        >
                          <ImageWithFallback
                            src={song.artwork}
                            alt={song.title}
                            width={200}
                            height={150}
                            className="object-cover w-full h-auto"
                            imageId={song.trackId}
                            priority={true}
                          />
                        </div>
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl transition-all duration-200 group-hover:backdrop-blur-[2px] group-hover:bg-black/40 pointer-events-none">
                          <PlayPauseButton
                            track={musicItem}
                            index={index}
                            onPlaySong={handleSongClick}
                            size={32}
                            className="text-white cursor-pointer transition-transform duration-200 hover:scale-110 pointer-events-auto mt-4"
                            showOnHover={!isCurrentSong}
                            alwaysShowWhenPlaying={isCurrentSong}
                          />
                          <div
                            className={`flex items-center gap-2 ${openDropdown === song.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
                          >
                            <button
                              className={`p-1 cursor-pointer rounded-full hover:bg-pink-500/20 transition-transform duration-300 ${
                                animatingHearts.has(song.id)
                                  ? "scale-125"
                                  : "scale-100"
                              } transition-transform duration-200 hover:scale-110 pointer-events-auto`}
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
                            <DropdownMenu
                              open={openDropdown === song.id}
                              onOpenChange={(open) => {
                                if (open) {
                                  setOpenDropdown(song.id);
                                } else {
                                  setOpenDropdown(null);
                                }
                              }}
                            >
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="p-1 cursor-pointer rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors transition-transform duration-200 hover:scale-110 pointer-events-auto"
                                  title="More"
                                >
                                  <MoreHorizontal
                                    size={18}
                                    className="text-white"
                                  />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-gray-800 border-gray-700"
                              >
                                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-600/20">
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-600/20">
                                  Copy URL
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-gray-300 hover:text-white hover:bg-purple-600/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDialog(musicItem);
                                  }}
                                >
                                  Add to Playlist
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-medium text-white truncate">
                          {song.title}
                        </p>
                        <div className="flex items-center gap-1">
                          <ArtistTooltip artist={song.artist}>
                            <p
                              className="text-xs text-gray-300 truncate hover:text-purple-400 cursor-pointer font-medium"
                              onClick={() =>
                                typeof song.artist === "object" &&
                                handleArtistClick(song.artist)
                              }
                            >
                              {typeof song.artist === "string"
                                ? song.artist
                                : song.artist.username}
                            </p>
                          </ArtistTooltip>
                          {typeof song.artist === "object" &&
                            song.artist.verified && (
                              <Verified size={12} className="text-blue-400" />
                            )}
                        </div>
                        {(song as any).genre && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full font-medium mt-2 inline-block border border-purple-500/30">
                            {(song as any).genre}
                          </span>
                        )}
                        {/* For Recently Played section */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Calendar size={10} className="flex-shrink-0" />
                            <span className="text-xs truncate max-w-[80px]">
                              {song.createdAt
                                ? getReleaseDate(song.createdAt)
                                : "Unknown"}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-400 truncate max-w-[80px]">
                              {song.playedAt
                                ? getPlayedDate(song.playedAt)
                                : "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }}
            />
          )}
        </div>
        <Sidebar
          recentPlayed={recentPlayed as RecentPlayedSong[]}
          isAuthenticated={isAuthenticated}
          recommendArtists={getRecommendArtists}
          isLoadingRecommendArtists={isLoadingRecommendedArtists}
          recommendSongs={recommendSongs}
          isLoadingRecommendSongs={isLoadingRecommend}
          onSongClick={playSingleSong}
        />
      </div>
    </div>
  );
};

export default HomePage;
