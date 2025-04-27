"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useMusicPlayer, Song } from "../app/provider/MusicContext";

interface MusicPlayerProps {
  song?: Song | null;
}

export default function MusicPlayer({ song }: MusicPlayerProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const {
    currentSong,
    isPlaying,
    progress,
    currentTime,
    duration,
    setCurrentSong,
    togglePlayPause,
    skipForward,
    skipBack,
    handleSeek,
    formatTime,
  } = useMusicPlayer();

  useEffect(() => {
    if (song) {
      setCurrentSong(song);
    }
  }, [song, setCurrentSong]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || isDragging) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = position / rect.width;

    setHoverPosition(position);
    setHoverTime(percentage * duration);
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
    setHoverTime(null);
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;

    handleSeek(percentage);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = Math.max(
      0,
      Math.min(e.clientX - rect.left, rect.width)
    );
    const percentage = clickPosition / rect.width;

    // Only update visual progress while dragging
    setIsDragging(percentage * 100);
  };

  const handleDragEnd = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = Math.max(
      0,
      Math.min(e.clientX - rect.left, rect.width)
    );
    const percentage = clickPosition / rect.width;

    handleSeek(percentage);
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && progressBarRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickPosition = Math.max(
          0,
          Math.min(e.clientX - rect.left, rect.width)
        );
        const percentage = clickPosition / rect.width;

        // Only update visual progress while dragging
        setIsDragging(percentage * 100);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isDragging]);

  if (!currentSong) return null;

  return (
    <section className="fixed bottom-0 left-0 w-full bg-gray-900 text-white shadow-inner z-50">
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center space-x-4 min-w-[180px]">
          <Image
            src={currentSong.artwork}
            alt={currentSong.title}
            width={50}
            height={50}
            className="rounded"
          />
          <div className="leading-tight">
            <h3 className="text-sm font-semibold">{currentSong.title}</h3>
            <p className="text-xs text-gray-400">{currentSong.artist}</p>
          </div>
        </div>

        <div className="flex-1 max-w-[600px] mx-4">
          <div className="flex items-center w-full">
            <span className="text-xs text-gray-400 mr-2">
              {formatTime(currentTime)}
            </span>
            <div
              ref={progressBarRef}
              className="flex-1 bg-gray-700 h-2 rounded cursor-pointer relative"
              onClick={handleSeekClick}
              onMouseDown={handleDragStart}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleDragEnd}
            >
              <div
                className="bg-blue-500 h-full rounded transition-all duration-150"
                style={{
                  width: `${isDragging !== false ? isDragging : progress}%`,
                }}
              ></div>
              <div
                className="absolute w-4 h-4 rounded-full bg-white shadow-md transition-opacity duration-150"
                style={{
                  left: `${isDragging !== false ? isDragging : progress}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: isDragging !== false ? 1 : progress > 0 ? 0.8 : 0,
                  pointerEvents: "none",
                }}
              ></div>

              {/* Hover time tooltip */}
              {hoverPosition !== null && hoverTime !== null && (
                <div
                  className="absolute bg-gray-800 px-2 py-1 rounded text-xs -top-8 transform -translate-x-1/2 pointer-events-none"
                  style={{
                    left: `${hoverPosition}px`,
                  }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400 ml-2">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={skipBack}
            className="p-2 hover:bg-gray-700 rounded-full transition"
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={togglePlayPause}
            className="p-2 hover:bg-gray-700 rounded-full transition"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={skipForward}
            className="p-2 hover:bg-gray-700 rounded-full transition"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
