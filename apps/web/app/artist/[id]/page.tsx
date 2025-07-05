"use client";

import { useParams } from "next/navigation";
import { Artist } from "@/types/music";
import Image from "next/image";
import {
  Verified,
  PlayCircle,
  Play,
  Heart,
  HeartIcon,
  MoreHorizontal,
  Share2,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { useArtistInfo } from "app/query/useSoundCloudQueries";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useMusicPlayer } from "app/provider/MusicContext";
import MusicPlayer from "@/components/MusicPlayer";

export default function ArtistPage() {
  const params = useParams();
  const artistId = params.id as string;

  // Fetch artist data using the query hook
  const { data: artist, isLoading, error } = useArtistInfo(artistId);
  const { playFromPlaylist } = useMusicPlayer();

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [animatingHearts, setAnimatingHearts] = useState<Set<string>>(
    new Set()
  );
  const [isFollowing, setIsFollowing] = useState(false);

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

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  if (!artistId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl font-semibold mb-2">Artist not found</div>
        <div className="text-gray-500">
          Please go back to the homepage and select an artist.
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="pb-28">
        <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden">
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          <div className="relative z-10 p-6 sm:p-10 md:p-14 h-full flex items-end gap-6">
            <Skeleton className="w-40 h-40 sm:w-52 sm:h-52 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl font-semibold mb-2">Error loading artist</div>
        <div className="text-gray-500">{error.message}</div>
      </div>
    );
  }

  // No artist data found
  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl font-semibold mb-2">Artist not found</div>
        <div className="text-gray-500">
          The artist you're looking for doesn't exist.
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden">
        {/* Blurred Background Image */}
        {artist.avatarUrl && (
          <div className="absolute inset-0 z-0">
            <Image
              src={artist.avatarUrl}
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
          <div className="w-40 h-40 sm:w-52 sm:h-52 shadow-xl rounded-lg overflow-hidden border-2 border-gray-300">
            <Image
              src={artist.avatarUrl || "/music-plate.jpg"}
              alt={artist.username}
              width={208}
              height={208}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="text-gray-900 space-y-2">
            <p className="uppercase text-xs tracking-widest text-gray-600">
              Artist
            </p>
            <div className="flex items-center gap-2">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                {artist.username}
              </h1>
              {artist.verified && (
                <Verified size={32} className="text-blue-500" />
              )}
            </div>
            {artist.city && (
              <p className="text-sm text-gray-700">
                {artist.city}
                {artist.countryCode && `, ${artist.countryCode}`}
              </p>
            )}
            {typeof artist.followersCount === "number" && (
              <p className="text-sm text-gray-700">
                {artist.followersCount.toLocaleString()} followers
              </p>
            )}
            <div className="flex gap-2 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFollowToggle}
                className={`${
                  isFollowing
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white px-6 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-lg`}
              >
                {isFollowing ? <UserCheck size={28} /> : <UserPlus size={28} />}
                {isFollowing ? "Following" : "Follow"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-lg"
              >
                <Share2 size={28} />
                Share
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Artist Songs Section */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Popular Songs</h2>
        <div className="text-gray-500 text-center py-8">
          <p>No songs available for this artist yet.</p>
          <p className="text-sm mt-2">Check back later for new releases!</p>
        </div>
      </div>

      {/* Sticky Player */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <MusicPlayer />
      </div>
    </div>
  );
}
