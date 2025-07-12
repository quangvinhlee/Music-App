"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ListMusic,
  ChevronUp,
  Verified,
} from "lucide-react";
import { useMusicPlayer } from "app/provider/MusicContext";
import { useSelector } from "react-redux";
import { RootState } from "app/store/store";
import ExpandedMusicPlayer from "./ExpandedMusicPlayer";
import QueuePopup from "./QueuePopup";
import { MusicItem } from "app/types/music";
import { useRouter } from "next/navigation";
import { ArtistTooltip } from "./ArtistTooltip";

interface MusicPlayerProps {
  song?: MusicItem | null;
}

export default function MusicPlayer({ song }: MusicPlayerProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [localDragProgress, setLocalDragProgress] = useState<number | false>(
    false
  );
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQueuePopup, setShowQueuePopup] = useState(false);
  const queueButtonRef = useRef<HTMLButtonElement>(null);

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
    isDragging,
    startDragging,
    stopDragging,
  } = useMusicPlayer();

  const router = useRouter();
  const { currentIndex, queue } = useSelector((state: RootState) => state.song);

  const handleArtistClick = (artist: any) => {
    router.push(`/artist/${artist.id}`);
  };

  useEffect(() => {
    if (song) {
      setCurrentSong(song);
    }
  }, [song, setCurrentSong]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showQueuePopup &&
        queueButtonRef.current &&
        !queueButtonRef.current.contains(event.target as Node)
      ) {
        const popup = document.getElementById("queue-popup");
        if (!popup || !popup.contains(event.target as Node)) {
          setShowQueuePopup(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showQueuePopup]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || localDragProgress !== false) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = position / rect.width;

    setHoverPosition(position);
    setHoverTime(percentage * duration);
  };

  const handleMouseLeave = () => {
    if (localDragProgress === false) {
      setHoverPosition(null);
      setHoverTime(null);
    }
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const handleDragEnd = (e: React.MouseEvent<HTMLDivElement>) => {
    if (localDragProgress === false || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = Math.max(
      0,
      Math.min(e.clientX - rect.left, rect.width)
    );
    const percentage = (clickPosition / rect.width) * 100;

    handleSeek(percentage);
    stopDragging();
    setLocalDragProgress(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (localDragProgress !== false && progressBarRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const mouseX = rect.left + (rect.width * localDragProgress) / 100;

        handleSeek(localDragProgress);
        stopDragging();
        setLocalDragProgress(false);
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [localDragProgress, handleSeek, stopDragging]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (localDragProgress !== false && progressBarRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickPosition = Math.max(
          0,
          Math.min(e.clientX - rect.left, rect.width)
        );
        const percentage = (clickPosition / rect.width) * 100;

        setLocalDragProgress(percentage);
      }
    };

    if (localDragProgress !== false) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [localDragProgress]);

  const handleExpandPlayer = (e: React.MouseEvent) => {
    // Don't expand player if clicking on a button or control element
    if (
      (e.target as Element).closest("button") ||
      (e.target as Element).closest('[role="button"]') ||
      (e.target as Element).closest("#queue-popup") ||
      (e.target as Element).closest(".progress-bar")
    ) {
      return;
    }

    setIsExpanded(true);
    setShowQueuePopup(false);
  };

  const handleCloseExpanded = () => {
    setIsExpanded(false);
  };

  const toggleQueuePopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQueuePopup((prev) => !prev);
  };

  if (!currentSong) return null;

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 text-white overflow-hidden">
        <ExpandedMusicPlayer
          currentSong={currentSong}
          songsList={queue}
          progress={progress}
          onClose={handleCloseExpanded}
        />
      </div>
    );
  }

  // Calculate which progress to display - localDrag if dragging, otherwise normal progress
  const displayProgress =
    localDragProgress !== false ? localDragProgress : progress;

  return (
    <section
      className=" group fixed bottom-0 left-0 w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-xl shadow-2xl border border-gray-700/50 z-50"
      onClick={handleExpandPlayer}
    >
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 shadow"
          title="Expand player"
        >
          <ChevronUp size={18} />
        </button>
      </div>

      <div className="flex items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center space-x-4 min-w-[180px] max-w-[300px]">
          <div className="cursor-pointer flex-shrink-0">
            <Image
              src={currentSong.artwork}
              alt={currentSong.title}
              width={50}
              height={50}
              className="rounded"
            />
          </div>
          <div className="leading-tight min-w-0 flex-1">
            <h3 className="text-sm font-semibold truncate">
              {currentSong.title}
            </h3>
            <div className="flex items-center gap-1">
              <ArtistTooltip artist={currentSong.artist}>
                <p
                  className="text-xs text-gray-400 hover:text-blue-400 cursor-pointer truncate"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArtistClick(currentSong.artist);
                  }}
                >
                  {currentSong.artist.username}
                </p>
              </ArtistTooltip>
              {currentSong.artist.verified && (
                <Verified size={12} className="text-blue-500 flex-shrink-0" />
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-[600px] mx-4">
          <div className="flex items-center w-full">
            <span className="text-xs text-gray-400 mr-2">
              {formatTime(currentTime)}
            </span>
            <div
              ref={progressBarRef}
              className="flex-1 bg-gray-700 h-2 rounded cursor-pointer relative progress-bar"
              onClick={(e) => {
                e.stopPropagation();
                handleSeekClick(e);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleDragStart(e);
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
                  width: `${displayProgress}%`,
                }}
              ></div>
              <div
                className="absolute w-4 h-4 rounded-full bg-white shadow-md transition-opacity duration-150"
                style={{
                  left: `${displayProgress}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity:
                    localDragProgress !== false || isDragging
                      ? 1
                      : progress > 0
                        ? 0.8
                        : 0,
                  pointerEvents: "none",
                }}
              ></div>

              {hoverPosition !== null &&
                hoverTime !== null &&
                !localDragProgress && (
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
            onClick={(e) => {
              e.stopPropagation();
              skipBack();
            }}
            className="p-2 hover:bg-gray-700 rounded-full transition cursor-pointer"
            disabled={currentIndex <= 0}
          >
            <SkipBack
              size={20}
              className={currentIndex <= 0 ? "opacity-50" : ""}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="p-2 hover:bg-gray-700 rounded-full transition cursor-pointer"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              skipForward();
            }}
            className="p-2 hover:bg-gray-700 rounded-full transition cursor-pointer"
            disabled={currentIndex >= queue.length - 1}
          >
            <SkipForward
              size={20}
              className={currentIndex >= queue.length - 1 ? "opacity-50" : ""}
            />
          </button>

          <div className="relative">
            <button
              ref={queueButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                toggleQueuePopup(e);
              }}
              className={`p-2 hover:bg-gray-700 rounded-full transition ml-2 cursor-pointer relative ${showQueuePopup ? "bg-gray-700" : ""}`}
            >
              <ListMusic size={20} />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg border border-white/20">
                  {queue.length > 99 ? "99+" : queue.length}
                </span>
              )}
            </button>

            {showQueuePopup && (
              <div
                id="queue-popup"
                className="absolute bottom-full right-0 mb-2 z-40"
                onClick={(e) => e.stopPropagation()}
              >
                <QueuePopup
                  queue={queue}
                  currentSong={currentSong}
                  currentIndex={currentIndex}
                  onSelectSong={setCurrentSong}
                  onClose={() => setShowQueuePopup(false)}
                />
                {/* Arrow pointing to button */}
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
