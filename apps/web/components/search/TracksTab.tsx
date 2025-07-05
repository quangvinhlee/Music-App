"use client";

import Image from "next/image";
import { Music, Play, Clock } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useImageErrors } from "app/hooks/useImageErrors";
import { formatDuration, formatCount } from "@/utils";
import { useDispatch } from "react-redux";
import { setArtist } from "../../app/store/artist";
import { useRouter } from "next/navigation";

interface Track {
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
  streamUrl: string;
  playbackCount: number;
}

interface TracksTabProps {
  tracks: Track[];
  onTrackPlay: (track: Track, index: number) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export function TracksTab({
  tracks,
  onTrackPlay,
  hasNextPage,
  fetchNextPage,
}: TracksTabProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { handleImageError, hasImageError } = useImageErrors();

  const handleArtistClick = (artist: any) => {
    dispatch(setArtist(artist));
    router.push(`/artist/${artist.id}`);
  };

  if (!tracks.length) {
    return (
      <div className="col-span-full text-center py-20">
        <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No tracks found
        </h3>
        <p className="text-gray-500">Try searching with different keywords</p>
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={tracks.length}
      next={fetchNextPage}
      hasMore={hasNextPage}
      loader={undefined}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track: Track, index: number) => (
          <div
            key={`${track.id}-${index}`}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => onTrackPlay(track, index)}
          >
            <div className="relative aspect-square">
              <Image
                src={
                  hasImageError(`track-${track.id}`) || !track.artwork
                    ? "/music-plate.jpg"
                    : track.artwork
                }
                alt={track.title}
                width={300}
                height={300}
                priority
                className="w-full h-full object-cover"
                onError={() => handleImageError(`track-${track.id}`)}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 truncate">
                {track.title}
              </h3>
              <p
                className="text-sm text-gray-600 truncate hover:text-blue-600 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleArtistClick(track.artist);
                }}
              >
                {track.artist.username}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{track.genre}</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(track.duration)}
                </div>
              </div>
              {track.playbackCount && (
                <p className="text-xs text-gray-400 mt-1">
                  {formatCount(track.playbackCount)} plays
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
}
