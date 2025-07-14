"use client";

import { Play, Pause } from "lucide-react";
import { useMusicPlayer } from "app/provider/MusicContext";
import { MusicItem } from "app/types/music";

interface PlayPauseButtonProps {
  track: MusicItem;
  index: number;
  onPlaySong: (track: MusicItem, index: number) => void;
  size?: number;
  className?: string;
  showOnHover?: boolean;
  alwaysShowWhenPlaying?: boolean;
}

export default function PlayPauseButton({
  track,
  index,
  onPlaySong,
  size = 20,
  className = "",
  showOnHover = true,
  alwaysShowWhenPlaying = false,
}: PlayPauseButtonProps) {
  const { currentSong, isPlaying, togglePlayPause } = useMusicPlayer();

  const isCurrentSong = currentSong?.id === track.id;

  const handlePlayPauseClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If this is the current song, toggle play/pause
    if (isCurrentSong) {
      togglePlayPause();
    } else {
      // If it's a different song, play it
      onPlaySong(track, index);
    }
  };

  const getButtonContent = () => {
    if (isCurrentSong) {
      return isPlaying ? <Pause size={size} /> : <Play size={size} />;
    }
    return <Play size={size} />;
  };

  const getTitle = () => {
    if (isCurrentSong) {
      return isPlaying ? "Pause" : "Play";
    }
    return "Play";
  };

  const getOpacityClass = () => {
    if (alwaysShowWhenPlaying && isCurrentSong && isPlaying) {
      return "opacity-100";
    }
    if (showOnHover) {
      return "opacity-0 group-hover:opacity-100";
    }
    return "opacity-100";
  };

  return (
    <button
      onClick={handlePlayPauseClick}
      className={`transition-all duration-200 cursor-pointer ${getOpacityClass()} ${className}`}
      title={getTitle()}
    >
      {getButtonContent()}
    </button>
  );
}
