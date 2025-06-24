/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import {
  useTrendingSongPlaylists,
  useTrendingIdByCountry,
  useRecentPlayed,
} from "app/query/useSongQueries";
import { useGeoInfo } from "app/query/useAuthQueries";
import { useSelector } from "react-redux";
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

interface RecentPlayedSong {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  playedAt: string;
  userId: string;
}

const HomePage = () => {
  const router = useRouter();

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
  const { data: trendingIdData } = useTrendingIdByCountry(countryCode);
  const trendingId = trendingIdData?.id;

  const {
    data: playlists = [],
    isLoading,
    error,
  } = useTrendingSongPlaylists(trendingId ?? "", { enabled: !!trendingId });

  // Fetch recent played songs for authenticated users
  const { data: recentPlayed = [], isLoading: isLoadingRecent } =
    useRecentPlayed(user);

  const handleClick = (playlist: any) => () => {
    router.push(`/playlist/${playlist.id}`);
  };

  const handleSongClick = (song: RecentPlayedSong) => () => {
    // Convert RecentPlayedSong to Song format and play it
    const songToPlay = {
      id: song.trackId,
      title: song.title,
      artist: song.artist,
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
            items={playlists}
            isLoading={isLoading}
            renderItem={(playlist: any) => (
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
                      {playlist.title}
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
                  className="cursor-pointer"
                  onClick={handleSongClick(song)}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="rounded-md overflow-hidden shadow-md bg-white">
                    <ImageWithFallback
                      src={song.artwork}
                      alt={song.title}
                      width={200}
                      height={150}
                      className="object-cover w-full h-auto"
                      imageId={song.trackId}
                    />
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
          recentPlayed={recentPlayed}
          isAuthenticated={isAuthenticated}
          onPlay={(song) => {
            // Convert RecentPlayedSong to Song format and play it
            playSingleSong({
              id: song.trackId,
              title: song.title,
              artist: song.artist,
              artwork: song.artwork,
              duration: song.duration,
            });
          }}
        />
      </div>
    </div>
  );
};

export default HomePage;
