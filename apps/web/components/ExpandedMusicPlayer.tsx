"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Shuffle,
  Music,
  Loader2,
  Heart,
  Clock,
  Repeat,
  Verified,
} from "lucide-react";
import { useMusicPlayer } from "../app/provider/MusicContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "app/store/store";
import { toggleShuffleMode } from "app/store/song";
import clsx from "clsx";
import { useVirtualizer } from "@tanstack/react-virtual";
import { MusicItem } from "@/types/music";
import { useRouter } from "next/navigation";
import { ArtistTooltip } from "./ArtistTooltip";

interface ExpandedMusicPlayerProps {
  currentSong: MusicItem;
  songsList: MusicItem[];
  progress: number;
  onClose: () => void;
}

export default function ExpandedMusicPlayer({
  currentSong,
  songsList,
  progress,
  onClose,
}: ExpandedMusicPlayerProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    formatTime,
    togglePlayPause,
    skipForward,
    skipBack,
    setCurrentSong,
    handleSeek,
    startDragging,
    stopDragging,
    isDragging,
  } = useMusicPlayer();

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { currentIndex, shuffleMode, queueType } = useSelector(
    (state: RootState) => state.song
  );

  const handleArtistClick = (artist: any) => {
    router.push(`/artist/${artist.id}`);
  };

  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [localDragProgress, setLocalDragProgress] = useState<number | false>(
    false
  );
  const progressBarRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const [favoriteSongs, setFavoriteSongs] = useState<Record<string, boolean>>(
    {}
  );

  const rowVirtualizer = useVirtualizer({
    count: songsList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // Height of each row (40px image + 16px padding)
    overscan: 5,
    paddingEnd: 0, // Remove padding at the end
  });

  const handleToggleShuffle = () => {
    dispatch(toggleShuffleMode());
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = (clickPosition / rect.width) * 100;

    handleSeek(percentage);
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    startDragging();
    setLocalDragProgress(progress);
  };

  const handleDragging = (e: React.MouseEvent<HTMLDivElement>) => {
    if (localDragProgress === false || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (position / rect.width) * 100;

    setLocalDragProgress(percentage);
  };

  const handleDragEnd = (e: React.MouseEvent<HTMLDivElement>) => {
    if (localDragProgress === false || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (position / rect.width) * 100;

    handleSeek(percentage);
    stopDragging();
    setLocalDragProgress(false);
  };

  // Display progress should be the local drag progress when dragging, or the actual progress otherwise
  const displayProgress =
    localDragProgress !== false ? localDragProgress : progress;

  const toggleFavorite = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteSongs((prev) => ({
      ...prev,
      [songId]: !prev[songId],
    }));
  };

  return (
    <div className="flex h-full">
      {/* Song list */}
      <div className="w-1/3 border-r border-gray-700 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Now Playing</h2>
          <button
            onClick={handleToggleShuffle}
            className={clsx(
              "p-2 rounded-full transition-colors cursor-pointer",
              shuffleMode
                ? "text-blue-400 hover:text-blue-300"
                : "text-gray-400 hover:text-gray-300"
            )}
          >
            <Shuffle size={18} />
          </button>
        </div>

        <div
          ref={parentRef}
          className="h-[calc(100vh-3rem)] overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-8"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const index = virtualRow.index;
              const song = songsList[index];
              if (!song) return null;

              return (
                <div
                  key={song.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className={clsx(
                    "p-2 rounded flex items-center space-x-3 cursor-pointer transition-colors",
                    currentIndex === index
                      ? "bg-gray-800/80 hover:bg-gray-800"
                      : "hover:bg-gray-800/50"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSong(song);
                  }}
                >
                  <div className="relative">
                    {!imageError[song.id] ? (
                      <Image
                        src={song.artwork}
                        alt={song.title}
                        width={40}
                        height={40}
                        className="rounded"
                        onError={() =>
                          setImageError((prev) => ({
                            ...prev,
                            [song.id]: true,
                          }))
                        }
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                        <Music size={18} className="text-gray-400" />
                      </div>
                    )}
                    {song.id === currentSong.id && isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                        <span className="w-1 h-3 bg-white animate-pulse"></span>
                        <span className="w-1 h-2 bg-white mx-1 animate-pulse"></span>
                        <span className="w-1 h-1 bg-white animate-pulse"></span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {song.title}
                    </h3>
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
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {formatTime(song.duration || 0)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* End message */}
          <div className="flex flex-col items-center justify-center py-4 px-4 mt-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mb-2">
              <Music size={14} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 text-center">
              No more songs in playlist
            </p>
          </div>
        </div>
      </div>

      {/* Main player section */}
      <div className="w-2/3 p-6 flex flex-col">
        <div className="flex justify-between mb-4">
          <button
            onClick={onClose}
            className="flex items-center p-2 hover:bg-gray-700 rounded-lg text-sm transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Return
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center">
          {!imageError[currentSong.id] ? (
            <Image
              src={currentSong.artwork}
              alt={currentSong.title}
              width={300}
              height={300}
              className="rounded-xl mb-6 shadow-lg transition-transform hover:scale-[1.02]"
              onError={() =>
                setImageError((prev) => ({ ...prev, [currentSong.id]: true }))
              }
            />
          ) : (
            <div className="w-[300px] h-[300px] bg-gray-700 rounded-xl mb-6 flex items-center justify-center">
              <Music size={64} className="text-gray-400" />
            </div>
          )}

          <h2 className="text-2xl font-bold text-center mb-2">
            {currentSong.title}
          </h2>
          <div className="flex items-center justify-center gap-1 mb-8">
            <ArtistTooltip artist={currentSong.artist}>
              <p
                className="text-sm text-gray-400 hover:text-blue-400 cursor-pointer"
                onClick={() => handleArtistClick(currentSong.artist)}
              >
                {currentSong.artist.username}
              </p>
            </ArtistTooltip>
            {currentSong.artist.verified && (
              <Verified size={14} className="text-blue-500" />
            )}
          </div>

          <div
            ref={progressBarRef}
            className="relative w-full h-2 bg-gray-700 rounded cursor-pointer group"
            onClick={handleProgressClick}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragging}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <div
              className="absolute h-full bg-blue-500 rounded transition-all duration-150"
              style={{ width: `${displayProgress}%` }}
            />
            <div
              className="absolute w-4 h-4 bg-white rounded-full shadow-md transition-all duration-150 opacity-0 group-hover:opacity-100"
              style={{
                left: `${displayProgress}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full mt-2 text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="relative flex items-center mt-8">
            <div className="w-1/4 flex justify-start">
              <button
                onClick={() => {}}
                className="hover:bg-gray-700 rounded-full transition-colors cursor-pointer flex items-center justify-center w-12 h-12"
              >
                <Repeat size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="w-2/4 flex items-center justify-center space-x-6">
              <button
                onClick={skipBack}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors cursor-pointer flex items-center justify-center w-12 h-12"
                disabled={currentIndex <= 0}
              >
                <SkipBack
                  size={24}
                  className={currentIndex <= 0 ? "opacity-50" : ""}
                />
              </button>
              <button
                onClick={togglePlayPause}
                className="p-4 bg-white text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center w-16 h-16"
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
              <button
                onClick={skipForward}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors cursor-pointer flex items-center justify-center w-12 h-12"
                disabled={currentIndex >= songsList.length - 1}
              >
                <SkipForward
                  size={24}
                  className={
                    currentIndex >= songsList.length - 1 ? "opacity-50" : ""
                  }
                />
              </button>
            </div>
            <div className="w-1/4 flex justify-end">
              <button
                onClick={(e) => toggleFavorite(currentSong.id, e)}
                className={clsx(
                  "rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center w-12 h-12",
                  "hover:bg-gray-700 active:scale-95",
                  favoriteSongs[currentSong.id]
                    ? "text-red-500"
                    : "text-gray-400"
                )}
              >
                <Heart
                  size={24}
                  className={clsx(
                    "transition-all duration-200",
                    favoriteSongs[currentSong.id] ? "fill-current" : ""
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
