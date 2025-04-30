"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import Hls from "hls.js"; // Import hls.js

export interface Song {
  streamUrl: string;
  title: string;
  artist: string;
  artwork: string;
}

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  setCurrentSong: (song: Song | null, playImmediately?: boolean) => void;
  togglePlayPause: () => void;
  skipForward: () => void;
  skipBack: () => void;
  handleSeek: (percentage: number) => void;
  formatTime: (seconds: number) => string;
  videoRef: React.RefObject<HTMLVideoElement>; // Expose videoRef
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentSongState, setCurrentSongState] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!videoRef.current || !currentSongState) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      hlsRef.current = new Hls();
      hlsRef.current.loadSource(currentSongState.streamUrl);
      hlsRef.current.attachMedia(videoRef.current);

      hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
        setDuration(videoRef.current?.duration || 0);
        if (isPlaying) {
          videoRef.current?.play().catch((err) => {
            console.error("Playback failed:", err);
            setIsPlaying(false);
          });
        }
      });

      hlsRef.current.on(Hls.Events.FRAG_LOADED, () => {
        setDuration(videoRef.current?.duration || 0);
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (e.g., Safari)
      videoRef.current.src = currentSongState.streamUrl;
      if (isPlaying) {
        videoRef.current.play().catch((err) => {
          console.error("Playback failed:", err);
          setIsPlaying(false);
        });
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentSongState, isPlaying]);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const handleProgress = () => {
      const { currentTime, duration } = video;
      setProgress((currentTime / duration) * 100 || 0);
      setCurrentTime(currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    // Add event listeners
    video.addEventListener("timeupdate", handleProgress);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      // Remove event listeners
      video.removeEventListener("timeupdate", handleProgress);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => {
        console.error("Playback failed:", err);
        setIsPlaying(false);
      });
    }
  };

  const skipBack = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      videoRef.current.currentTime - 10
    );
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      videoRef.current.duration,
      videoRef.current.currentTime + 10
    );
  };

  const handleSeek = (percentage: number) => {
    if (!videoRef.current) return;
    const seekTime = percentage * videoRef.current.duration;
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    setProgress(percentage * 100);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const setCurrentSong = (song: Song | null, playImmediately?: boolean) => {
    if (song === null) {
      setCurrentSongState(null);
      setIsPlaying(false);
      return;
    }

    if (currentSongState?.streamUrl !== song.streamUrl) {
      setCurrentSongState(song);
      setIsPlaying(playImmediately !== false); // Default to playing when changing songs
      return;
    }

    setCurrentSongState(song);
    if (playImmediately !== undefined) {
      setIsPlaying(playImmediately);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        currentSong: currentSongState,
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
        videoRef, // Expose videoRef
      }}
    >
      {children}
      {/* Hidden video element */}
      <video
        ref={videoRef}
        className="hidden"
        controls
        style={{ display: "none" }}
      />
    </MusicContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicProvider");
  }
  return context;
}
