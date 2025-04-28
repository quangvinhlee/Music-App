"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";

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
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentSongState, setCurrentSongState] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();

      // Set up event listeners
      audioRef.current.addEventListener("timeupdate", handleProgress);
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioRef.current.addEventListener("ended", () => setIsPlaying(false));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleProgress);
        audioRef.current.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        audioRef.current.removeEventListener("ended", () =>
          setIsPlaying(false)
        );
      }
    };
  }, []);

  useEffect(() => {
    if (!currentSongState || !audioRef.current) return;

    // Load new song
    audioRef.current.src = currentSongState.streamUrl;
    audioRef.current.load();

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error("Playback failed:", err);
        setIsPlaying(false);
      });
    }
  }, [currentSongState]);

  const handleProgress = () => {
    if (!audioRef.current) return;

    const { currentTime, duration } = audioRef.current;
    setProgress((currentTime / duration) * 100 || 0);
    setCurrentTime(currentTime);
    setDuration(duration);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const togglePlayPause = async () => {
    if (!audioRef.current || !currentSongState) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Playback failed:", err);
      setIsPlaying(false);
    }
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
    const seekTime = percentage * audioRef.current.duration;
    audioRef.current.currentTime = seekTime;
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
    // If setting to null, stop everything
    if (song === null) {
      setCurrentSongState(null);
      setIsPlaying(false);
      return;
    }

    // If it's a different song, update and play immediately by default
    if (currentSongState?.streamUrl !== song.streamUrl) {
      setCurrentSongState(song);
      setIsPlaying(true); // Always play when changing songs
      return;
    }

    // If it's the same song, only update play state if explicitly specified
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
      }}
    >
      {children}
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
