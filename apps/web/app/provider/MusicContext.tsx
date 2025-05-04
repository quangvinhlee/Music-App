"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import Hls from "hls.js";

export interface Song {
  streamUrl: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  streamType?: "hls" | "progressive" | "unknown";
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
  audioRef: React.RefObject<HTMLAudioElement>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const userPaused = useRef(false); // Track user-initiated pause

  const detectStreamType = (url: string): Song["streamType"] => {
    if (
      url.includes(".m3u8") ||
      url.includes("mpegurl") ||
      url.includes("mp4a.40.2")
    ) {
      return "hls";
    }
    if (url.includes(".mp3") || url.includes("progressive")) {
      return "progressive";
    }
    return "unknown";
  };

  const fallbackToNativePlayback = (song: Song) => {
    if (!audioRef.current) return;
    audioRef.current.src = song.streamUrl;
    audioRef.current.load();
  };

  const handlePlaybackError = (error: Error) => {
    console.error("Playback failed:", error);
    setIsPlaying(false);
    userPaused.current = true;
  };

  const initializePlayback = React.useCallback((song: Song) => {
    if (!audioRef.current) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamType = song.streamType || detectStreamType(song.streamUrl);

    try {
      if (streamType === "hls" && Hls.isSupported()) {
        hlsRef.current = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
        });

        hlsRef.current.loadSource(song.streamUrl);
        hlsRef.current.attachMedia(audioRef.current);

        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("HLS network error:", data.details);
                hlsRef.current?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("HLS media error:", data.details);
                hlsRef.current?.recoverMediaError();
                break;
              default:
                fallbackToNativePlayback(song);
                break;
            }
          }
        });
      } else {
        fallbackToNativePlayback(song);
      }
    } catch (error) {
      console.error("Playback initialization failed:", error);
      fallbackToNativePlayback(song);
    }
  }, []);

  useEffect(() => {
    if (!currentSong || !audioRef.current) return;
    initializePlayback(currentSong);
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentSong, initializePlayback]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
      userPaused.current = false;
    };

    const handlePause = () => {
      setIsPlaying(false);
      userPaused.current = true;
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      userPaused.current = true;
    };

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", updateProgress);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, [currentSong]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying && !userPaused.current) {
      audioRef.current.play().catch(handlePlaybackError);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => {
      userPaused.current = prev; // If prev is true (playing), user is pausing
      return !prev;
    });
  };

  const skipBack = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      audioRef.current.currentTime - 10
    );
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      audioRef.current.duration,
      audioRef.current.currentTime + 10
    );
  };

  const handleSeek = (percentage: number) => {
    if (!audioRef.current) return;
    const seekTime = (percentage / 100) * audioRef.current.duration;
    audioRef.current.currentTime = seekTime;
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const contextValue: MusicContextType = {
    currentSong,
    isPlaying,
    progress,
    currentTime,
    duration,
    setCurrentSong: (song, playImmediately = true) => {
      setCurrentSong(song);
      if (!audioRef.current) return;

      // Only play if explicitly requested and not paused by user
      const shouldPlay = playImmediately && !userPaused.current;

      const handleCanPlay = () => {
        if (shouldPlay) {
          setIsPlaying(true);
          userPaused.current = false;
        }
        audioRef.current?.removeEventListener("canplay", handleCanPlay);
      };

      audioRef.current.addEventListener("canplay", handleCanPlay);
    },
    togglePlayPause,
    skipForward,
    skipBack,
    handleSeek,
    formatTime,
    audioRef,
  };

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
      <audio
        ref={audioRef}
        className="hidden"
        controls={false}
        preload="auto"
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
