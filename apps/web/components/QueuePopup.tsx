"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Song } from "../app/provider/MusicContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "app/store/store";
import { Volume2, Music, Shuffle } from "lucide-react";
import { toggleShuffleMode } from "app/store/song";
import { useInfiniteScroll } from "../app/hooks/useInfiniteScroll";
import { useMusicPlayer } from "../app/provider/MusicContext";

interface QueuePopupProps {
  queue: Song[];
  currentSong: Song | null;
  currentIndex: number;
  onSelectSong: (song: Song) => void;
}

const QueuePopup: React.FC<QueuePopupProps> = ({
  queue,
  currentIndex,
  currentSong,
  onSelectSong,
}) => {
  const dispatch = useDispatch();
  const { queueType, shuffleMode } = useSelector(
    (state: RootState) => state.song
  );
  const {
    loadMoreRelatedSongs,
    hasMoreRelatedSongs,
    isLoadingMoreRelatedSongs,
  } = useMusicPlayer();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const { observerRef } = useInfiniteScroll({
    hasNextPage: queueType === "related" && hasMoreRelatedSongs,
    isFetchingNextPage: isLoadingMoreRelatedSongs,
    fetchNextPage: loadMoreRelatedSongs,
  });

  const handleImageError = (songId: string) => {
    setFailedImages((prev) => ({
      ...prev,
      [songId]: true,
    }));
  };

  const handleToggleShuffle = () => {
    dispatch(toggleShuffleMode());
  };

  const getQueueTypeLabel = () => {
    switch (queueType) {
      case "playlist":
        return "Current Playlist";
      case "related":
        return "Related Songs";
      default:
        return "Next Up";
    }
  };

  if (queue.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-400">No songs in queue</p>
      </div>
    );
  }

  const visibleSongs = queue;

  return (
    <div className="py-2">
      <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-medium">{getQueueTypeLabel()}</h3>
        <button
          onClick={handleToggleShuffle}
          className={`p-2 rounded-full transition hover:bg-gray-700 ${
            shuffleMode ? "bg-gray-600 text-green-400" : "text-gray-400"
          }`}
          title="Toggle Shuffle"
        >
          <Shuffle size={18} />
        </button>
      </div>

      <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
        {visibleSongs.map((song, index) => (
          <div
            key={song.id}
            className={`px-4 py-2 flex items-center gap-3 hover:bg-gray-700 cursor-pointer ${
              currentIndex === index ? "bg-gray-700/50" : ""
            }`}
            onClick={() => onSelectSong(song)}
          >
            <div className="relative w-10 h-10 flex-shrink-0">
              {!failedImages[song.id] ? (
                <Image
                  src={song.artwork}
                  alt={song.title}
                  width={40}
                  height={40}
                  className="rounded object-cover"
                  onError={() => handleImageError(song.id)}
                />
              ) : (
                <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                  <Music size={18} className="text-gray-400" />
                </div>
              )}
              {currentSong?.id === song.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                  <Volume2 size={16} className="text-white" />
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{song.title}</p>
              <p className="text-xs text-gray-400 truncate">{song.artist}</p>
            </div>
          </div>
        ))}

        {/* Infinite scroll trigger */}
        {queueType === "related" && (
          <div ref={observerRef} className="h-4">
            {isLoadingMoreRelatedSongs && (
              <div className="px-4 py-2 text-center">
                <span className="text-sm text-gray-400">
                  Loading more songs...
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueuePopup;
