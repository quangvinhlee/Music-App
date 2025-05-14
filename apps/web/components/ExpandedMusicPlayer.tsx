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
} from "lucide-react";
import { useMusicPlayer, Song } from "../app/provider/MusicContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "app/store/store";
import { toggleShuffleMode } from "app/store/song";
import clsx from "clsx";

interface ExpandedMusicPlayerProps {
  currentSong: Song;
  songsList: Song[];
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
  const { currentIndex, shuffleMode } = useSelector(
    (state: RootState) => state.song
  );

  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [localDragProgress, setLocalDragProgress] = useState<number | false>(
    false
  );
  const progressBarRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex h-full">
      {/* Song list */}
      <div className="w-1/3 border-r border-gray-700 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Now Playing</h2>
          <button
            onClick={handleToggleShuffle}
            className={clsx(
              "p-1 rounded-full",
              shuffleMode ? "text-blue-400" : "text-gray-400"
            )}
          >
            <Shuffle size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {songsList.map((song, index) => (
            <div
              key={song.id}
              className={clsx(
                "p-2 rounded flex items-center space-x-3 cursor-pointer hover:bg-gray-800",
                currentIndex === index ? "bg-gray-800" : ""
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
                      setImageError((prev) => ({ ...prev, [song.id]: true }))
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
              <div>
                <h3 className="font-medium text-sm">{song.title}</h3>
                <p className="text-xs text-gray-400">{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main player section */}
      <div className="w-2/3 p-6 flex flex-col">
        <div className="flex justify-between mb-4">
          <button
            onClick={onClose}
            className="flex items-center p-2 hover:bg-gray-700 rounded-lg text-sm"
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
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center">
          {!imageError[currentSong.id] ? (
            <Image
              src={currentSong.artwork}
              alt={currentSong.title}
              width={250}
              height={250}
              className="rounded-xl mb-6 shadow-lg"
              onError={() =>
                setImageError((prev) => ({ ...prev, [currentSong.id]: true }))
              }
            />
          ) : (
            <div className="w-[250px] h-[250px] bg-gray-700 rounded-xl mb-6 flex items-center justify-center">
              <Music size={64} className="text-gray-400" />
            </div>
          )}

          <h2 className="text-2xl font-bold text-center">
            {currentSong.title}
          </h2>
          <p className="text-sm text-gray-400 text-center">
            {currentSong.artist}
          </p>

          <div
            ref={progressBarRef}
            className="relative w-full h-2 bg-gray-700 rounded cursor-pointer mt-6"
            onClick={handleProgressClick}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragging}
            onMouseUp={handleDragEnd}
            onMouseLeave={() => {
              if (localDragProgress !== false) {
                handleDragEnd as any;
              }
            }}
          >
            <div
              className="h-2 bg-blue-500 rounded"
              style={{ width: `${displayProgress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md"
              style={{
                left: `${displayProgress}%`,
                transform: "translate(-50%, -50%)",
                opacity: localDragProgress !== false ? 1 : 0.8,
              }}
            />
          </div>

          <div className="w-full flex justify-between text-xs text-gray-400 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center mt-6 space-x-6">
            <button
              onClick={skipBack}
              className="hover:text-white text-gray-400"
            >
              <SkipBack size={24} />
            </button>
            <button
              onClick={togglePlayPause}
              className="bg-blue-500 p-3 rounded-full text-white hover:bg-blue-600"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={skipForward}
              className="hover:text-white text-gray-400"
            >
              <SkipForward size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
