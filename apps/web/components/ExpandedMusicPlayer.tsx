"use client";

import { useRef } from "react";
import Image from "next/image";
import { Play, Pause, SkipBack, SkipForward, X, ListMusic } from "lucide-react";
import { useMusicPlayer, Song } from "../app/provider/MusicContext";
import { motion } from "framer-motion";

interface ExpandedMusicPlayerProps {
  currentSong: Song;
  songsList: Song[];
  isDragging: boolean;
  progress: number;
  progressBarRef: React.RefObject<HTMLDivElement>;
  handleSeekClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleDragStart: () => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseLeave: () => void;
  handleDragEnd: (e: React.MouseEvent<HTMLDivElement>) => void;
  hoverPosition: number | null;
  hoverTime: number | null;
  onClose: () => void;
}

export default function ExpandedMusicPlayer({
  currentSong,
  songsList,
  isDragging,
  progress,
  progressBarRef,
  handleSeekClick,
  handleDragStart,
  handleMouseMove,
  handleMouseLeave,
  handleDragEnd,
  hoverPosition,
  hoverTime,
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
  } = useMusicPlayer();

  return (
    <div className="flex h-full">
      {/* Left side - Songs list */}
      <div className="w-1/3 border-r border-gray-700 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Songs List</h2>
          <ListMusic size={20} />
        </div>

        <div className="space-y-2">
          {songsList.map((song, index) => (
            <div
              key={index}
              className={`p-2 rounded flex items-center space-x-3 cursor-pointer hover:bg-gray-800 ${
                currentSong.title === song.title ? "bg-gray-800" : ""
              }`}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setCurrentSong(song);
              }}
            >
              <Image
                src={song.artwork}
                alt={song.title}
                width={40}
                height={40}
                className="rounded"
              />
              <div>
                <h3 className="font-medium">{song.title}</h3>
                <p className="text-xs text-gray-400">{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-2/3 p-6 flex flex-col">
        <div className="flex justify-between mb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex items-center p-2 hover:bg-gray-700 rounded-lg transition text-sm"
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
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 hover:bg-gray-700 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <Image
            src={currentSong.artwork}
            alt={currentSong.title}
            width={300}
            height={300}
            className="rounded-lg shadow-lg mb-8"
          />

          <h2 className="text-2xl font-bold mb-2">{currentSong.title}</h2>
          <p className="text-gray-400 mb-8">{currentSong.artist}</p>

          <div className="w-full max-w-[600px]">
            <div className="flex items-center w-full mb-4">
              <span className="text-sm text-gray-400 mr-2">
                {formatTime(currentTime)}
              </span>
              <div
                ref={progressBarRef}
                className="flex-1 bg-gray-700 h-2 rounded cursor-pointer relative"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSeekClick(e);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleDragStart();
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  handleDragEnd(e);
                }}
              >
                <div
                  className="bg-blue-500 h-full rounded transition-all duration-150"
                  style={{
                    width: `${isDragging !== false ? isDragging : progress}%`,
                  }}
                ></div>
                <div
                  className={`absolute w-4 h-4 rounded-full bg-white shadow-md transition-opacity duration-150 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none ${
                    isDragging !== false
                      ? "opacity-100"
                      : progress > 0
                      ? "opacity-80"
                      : "opacity-0"
                  }`}
                  style={{
                    left: `${isDragging !== false ? isDragging : progress}%`,
                  }}
                ></div>

                {/* Hover time tooltip */}
                {hoverPosition !== null && hoverTime !== null && (
                  <div
                    className="absolute bg-gray-800 px-2 py-1 rounded text-xs -top-8 -translate-x-1/2 pointer-events-none"
                    style={{
                      left: `${hoverPosition}px`,
                    }}
                  >
                    {hoverTime !== null ? formatTime(hoverTime) : ""}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-400 ml-2">
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center justify-center space-x-8">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skipBack();
                }}
                className="p-3 hover:bg-gray-700 rounded-full transition"
              >
                <SkipBack size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full transition"
              >
                {isPlaying ? <Pause size={30} /> : <Play size={30} />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skipForward();
                }}
                className="p-3 hover:bg-gray-700 rounded-full transition"
              >
                <SkipForward size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}