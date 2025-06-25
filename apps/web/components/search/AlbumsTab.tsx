"use client";

import Image from "next/image";
import { Album } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useImageErrors } from "app/hooks/useImageErrors";

interface SearchAlbum {
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
  trackCount: number;
}

interface AlbumsTabProps {
  albums: SearchAlbum[];
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
  const { handleImageError, hasImageError } = useImageErrors();

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
      loader={
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      }
      endMessage={
        <div className="text-center py-6 text-gray-500">
          <p>No more albums to load</p>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album: SearchAlbum) => (
          <div
            key={album.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="relative aspect-square">
              <Image
                src={
                  hasImageError(`album-${album.id}`) || !album.artwork
                    ? "/album-placeholder.jpg"
                    : album.artwork
                }
                width={300}
                height={300}
                priority
                alt={album.title}
                className="w-full h-full object-cover"
                onError={() => handleImageError(`album-${album.id}`)}
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 truncate">
                {album.title}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {album.artist.username}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{album.genre}</span>
                <span>{album.trackCount} tracks</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
}
