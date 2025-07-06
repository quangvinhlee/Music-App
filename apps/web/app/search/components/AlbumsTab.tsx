"use client";

import Image from "next/image";
import { Album, Verified, Play, Clock, Music, Calendar } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useImageErrors } from "app/hooks/useImageErrors";
import { useRouter } from "next/navigation";
import { ArtistTooltip } from "@/components/ArtistTooltip";
import { MusicItem } from "@/types/music";
import { motion } from "framer-motion";
import { getReleaseDate } from "@/utils/formatters";

interface AlbumsTabProps {
  albums: MusicItem[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export function AlbumsTab({
  albums,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: AlbumsTabProps) {
  const router = useRouter();
  const { handleImageError, hasImageError } = useImageErrors();

  const handleArtistClick = (artist: any) => {
    router.push(`/artist/${artist.id}`);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Loading skeleton for infinite scroll
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className="bg-white/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-200/50"
        >
          <div className="w-full h-48 bg-gray-300 animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-5 w-3/4 bg-gray-300 animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-gray-300 animate-pulse rounded" />
            <div className="h-4 w-1/3 bg-gray-300 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!albums.length) {
    return (
      <div className="col-span-full text-center py-20">
        <Album className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No albums found
        </h3>
        <p className="text-gray-500">Try searching with different keywords</p>
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={albums.length}
      next={fetchNextPage}
      hasMore={hasNextPage}
      loader={<LoadingSkeleton />}
      scrollThreshold={0.9}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {albums.map((album: MusicItem) => (
          <motion.div
            key={album.id}
            className="group bg-white/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200/50 hover:border-gray-300/50"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <Image
                src={
                  hasImageError(`album-${album.id}`) || !album.artwork
                    ? "/album-placeholder.jpg"
                    : album.artwork
                }
                alt={album.title}
                width={300}
                height={300}
                className="w-full h-48 object-cover group-hover:brightness-110 transition-all duration-300"
                onError={() => handleImageError(`album-${album.id}`)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                  <Play size={20} className="text-gray-700" />
                </div>
              </div>
              {album.duration && (
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Clock size={12} />
                  {formatDuration(album.duration)}
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate text-gray-900 group-hover:text-blue-600 transition-colors">
                    {album.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <ArtistTooltip artist={album.artist}>
                      <p
                        className="text-sm text-gray-600 truncate hover:text-blue-600 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArtistClick(album.artist);
                        }}
                      >
                        {album.artist.username}
                      </p>
                    </ArtistTooltip>
                    {album.artist.verified && (
                      <Verified size={14} className="text-blue-500" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                {album.genre && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    {album.genre}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                {album.trackCount && (
                  <div className="flex items-center gap-1">
                    <Music size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">
                      {album.trackCount} tracks
                    </span>
                  </div>
                )}
                {album.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {getReleaseDate(album.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </InfiniteScroll>
  );
}
