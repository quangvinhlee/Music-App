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
  MoreHorizontal,
} from "lucide-react";
import { useMusicPlayer } from "../app/provider/MusicContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "app/store/store";
import { toggleShuffleMode } from "app/store/song";
import clsx from "clsx";
import { MusicItem } from "@/types/music";
import { useRouter } from "next/navigation";
import { ArtistTooltip } from "./ArtistTooltip";
import PlayPauseButton from "@/components/PlayPauseButton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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
    onClose(); // Close the expanded player
    router.push(`/artist/${artist.id}`);
  };

  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [localDragProgress, setLocalDragProgress] = useState<number | false>(
    false
  );
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [favoriteSongs, setFavoriteSongs] = useState<Record<string, boolean>>(
    {}
  );

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
    <div className="flex h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Song list */}
      <div className="w-1/3 border-r border-gray-700/50 p-4 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Now Playing</h2>
          <button
            onClick={handleToggleShuffle}
            className={clsx(
              "p-2 rounded-full transition-all duration-200 cursor-pointer shadow-lg",
              shuffleMode
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
            )}
          >
            <Shuffle size={18} />
          </button>
        </div>

        <div className="h-[calc(100vh-3rem)] overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-8">
          {songsList.map((song, index) => {
            const isCurrentSong = song.id === currentSong.id;

            return (
              <div
                key={song.id}
                className={clsx(
                  "group relative p-2 rounded-lg flex items-center space-x-3 cursor-pointer transition-all duration-200 shadow-sm border border-gray-700/50",
                  isCurrentSong
                    ? "bg-gradient-to-r from-purple-900/40 to-pink-900/40"
                    : "hover:bg-gray-800/70"
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
                  <h3 className="font-medium text-sm truncate text-white">
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
                <div className="flex items-center justify-end min-w-[80px]">
                  <span
                    className={clsx(
                      "text-xs text-gray-400 flex items-center transition-all duration-200"
                    )}
                  >
                    <Clock size={12} className="mr-1" />
                    {formatTime(song.duration || 0)}
                  </span>
                  <div className="flex items-center gap-1 ml-2 transition-all duration-150">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(song.id, e);
                      }}
                      className={clsx(
                        "p-1 rounded-full transition-all duration-200",
                        favoriteSongs[song.id]
                          ? "text-pink-500"
                          : "text-gray-400",
                        "hover:bg-pink-500/20 active:scale-110"
                      )}
                      title={favoriteSongs[song.id] ? "Unfavorite" : "Favorite"}
                    >
                      {favoriteSongs[song.id] ? (
                        <Heart size={18} className="fill-pink-500" />
                      ) : (
                        <Heart size={18} />
                      )}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-full transition-all duration-200 text-gray-400 hover:bg-gray-700/50 active:scale-110"
                          title="More options"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-gray-900 border-gray-700/50"
                      >
                        <DropdownMenuItem
                          className="text-white hover:bg-gray-800"
                          onClick={() => {
                            /* TODO: Add to Playlist */
                          }}
                        >
                          Add to Playlist
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-white hover:bg-gray-800"
                          onClick={() => {
                            /* TODO: Share */
                          }}
                        >
                          Share
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}

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
      <div className="w-2/3 p-6 flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl shadow-lg">
        <div className="flex justify-between mb-4">
          <button
            onClick={onClose}
            className="flex items-center p-2 hover:bg-gray-700 rounded-lg text-sm transition-all duration-200 cursor-pointer bg-gray-700/50 text-white"
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
            className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-200 cursor-pointer bg-gray-700/50 text-white"
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
          <h2 className="text-2xl font-bold text-center mb-2 text-white">
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
            className="relative w-full h-2 bg-gray-700 rounded-full cursor-pointer group shadow-lg"
            onClick={handleProgressClick}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragging}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <div
              className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-150 shadow-lg"
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
                className="hover:bg-gray-700 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center w-12 h-12 bg-gray-700/50 text-gray-300 hover:text-white shadow-lg"
              >
                <Repeat size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="w-2/4 flex items-center justify-center space-x-6">
              <button
                onClick={skipBack}
                className="p-2 hover:bg-gray-700 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center w-12 h-12 bg-gray-700/50 text-gray-300 hover:text-white shadow-lg"
                disabled={currentIndex <= 0}
              >
                <SkipBack
                  size={24}
                  className={currentIndex <= 0 ? "opacity-50" : ""}
                />
              </button>
              <button
                onClick={togglePlayPause}
                className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 cursor-pointer flex items-center justify-center w-16 h-16 shadow-xl"
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
              <button
                onClick={skipForward}
                className="p-2 hover:bg-gray-700 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center w-12 h-12 bg-gray-700/50 text-gray-300 hover:text-white shadow-lg"
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
                  "rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center w-12 h-12 shadow-lg",
                  "hover:bg-gray-700 active:scale-95 bg-gray-700/50",
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
