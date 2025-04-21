"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

export default function Footer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgress = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((currentTime / duration) * 100 || 0);
    }
  };

  const skipBack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10;
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-900 text-white shadow-inner z-50">
      <audio
        ref={audioRef}
        src="/sample-song.mp3" // Replace with your audio file path
        onTimeUpdate={handleProgress}
      ></audio>

      <div className="flex items-center justify-between px-4 py-3 gap-4">
        {/* Song Info */}
        <div className="flex items-center space-x-4 min-w-[180px]">
          <Image
            src="/music-plate.jpg"
            alt="Song Artwork"
            width={50}
            height={50}
            className="rounded"
          />
          <div className="leading-tight">
            <h3 className="text-sm font-semibold">Song Title</h3>
            <p className="text-xs text-gray-400">Artist Name</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-[600px] mx-4">
          <div className="w-full bg-gray-700 h-1 rounded">
            <div
              className="bg-blue-500 h-1 rounded transition-all duration-150"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Controls */}
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
    </footer>
  );
}
