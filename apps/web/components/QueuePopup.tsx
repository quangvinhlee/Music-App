"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { MusicItem } from "@/types/music";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "app/store/store";
import {
  Volume2,
  Music,
  Shuffle,
  Loader2,
  Clock,
  X,
  Play,
  Pause,
  Verified,
} from "lucide-react";
import { toggleShuffleMode } from "app/store/song";
import { useMusicPlayer } from "../app/provider/MusicContext";
import clsx from "clsx";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { ArtistTooltip } from "./ArtistTooltip";

interface QueuePopupProps {
  queue: any[];
  currentSong: any | null;
  currentIndex: number;
  onSelectSong: (song: any) => void;
  onClose: () => void;
}

const QueuePopup: React.FC<QueuePopupProps> = ({
  queue,
  currentIndex,
  currentSong,
  onSelectSong,
  onClose,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { queueType, shuffleMode } = useSelector(
    (state: RootState) => state.song
  );
  const { formatTime, isPlaying, togglePlayPause } = useMusicPlayer();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (songId: string) => {
    setFailedImages((prev) => ({
      ...prev,
      [songId]: true,
    }));
  };

  const handleToggleShuffle = () => {
    dispatch(toggleShuffleMode());
  };

  const handleArtistClick = (artist: any) => {
    onClose();
    router.push(`/artist/${artist.id}`);
  };

  const handlePlayPauseClick = (song: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSong?.id === song.id) {
      togglePlayPause();
    } else {
      onSelectSong(song);
    }
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

  const LoadingSkeleton = () => (
    <div className="p-4 space-y-3">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-12 h-3" />
        </div>
      ))}
    </div>
  );

  if (queue.length === 0) {
    return (
      <div className="flex flex-col bg-gray-800 rounded-lg shadow-xl w-80">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-white">{getQueueTypeLabel()}</h3>
            <span className="text-sm text-gray-400">(0)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleShuffle}
              className={clsx(
                "p-2 rounded-full transition-all duration-200",
                "hover:bg-gray-700/50 active:scale-95",
                shuffleMode ? "text-green-400" : "text-gray-400"
              )}
              title="Toggle Shuffle"
            >
              <Shuffle size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-700/50 transition-all duration-200 active:scale-95"
              title="Close queue"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col bg-gray-800 rounded-lg shadow-xl w-80"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-white">{getQueueTypeLabel()}</h3>
          <span className="text-sm text-gray-400">({queue.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleShuffle}
            className={clsx(
              "p-2 rounded-full transition-all duration-200",
              "hover:bg-gray-700/50 active:scale-95",
              shuffleMode ? "text-green-400" : "text-gray-400"
            )}
            title="Toggle Shuffle"
          >
            <Shuffle size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700/50 transition-all duration-200 active:scale-95"
            title="Close queue"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {queue.map((song, index) => {
          const isCurrentSong = currentSong?.id === song.id;

          return (
            <div
              key={song.id}
              className={clsx(
                "w-full px-4 py-2 flex items-center gap-3 cursor-pointer transition-all duration-200",
                "hover:bg-gray-700/50 active:bg-gray-700",
                isCurrentSong ? "bg-gray-700/50" : ""
              )}
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
                {isCurrentSong ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                    <button
                      className="flex items-center justify-center"
                      onClick={(e) => handlePlayPauseClick(song, e)}
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause size={16} className="text-white" />
                      ) : (
                        <Play size={16} className="text-white" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 rounded transition-all duration-200 opacity-0 hover:opacity-100 hover:bg-black/30 flex items-center justify-center">
                    <button
                      className="opacity-0 hover:opacity-100 transition-opacity"
                      title="Play"
                      onClick={(e) => handlePlayPauseClick(song, e)}
                    >
                      <Play size={16} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{song.title}</p>
                <div className="flex items-center gap-1">
                  <ArtistTooltip artist={song.artist}>
                    <p
                      className="text-xs text-gray-400 truncate hover:text-blue-400 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArtistClick(song.artist);
                      }}
                    >
                      {song.artist.username}
                    </p>
                  </ArtistTooltip>
                  {song.artist.verified && (
                    <Verified size={12} className="text-blue-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isCurrentSong && (
                  <div className="flex items-center space-x-1">
                    <span className="w-1 h-3 bg-white animate-pulse"></span>
                    <span className="w-1 h-2 bg-white animate-pulse"></span>
                    <span className="w-1 h-1 bg-white animate-pulse"></span>
                  </div>
                )}
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock size={12} className="mr-1" />
                  {formatTime(song.duration || 0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QueuePopup;
