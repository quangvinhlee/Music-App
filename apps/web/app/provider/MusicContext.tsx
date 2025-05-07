"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "app/store/store";
import {
  setCurrentSong as setReduxCurrentSong,
  nextSong,
  previousSong,
  setQueueFromPlaylist,
  setQueueFromRelated,
  fetchRelatedSongs,
} from "app/store/song";
import Hls from "hls.js";

export interface Song {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  streamUrl: string;
  streamType?: "mp3" | "hls";
  duration: number;
  genre?: string;
}

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  songsList: Song[];
  isExpanded: boolean;
  setCurrentSong: (song: Song) => void;
  playFromPlaylist: (
    song: Song,
    playlistId: string,
    startIndex?: number
  ) => void;
  playSingleSong: (song: Song) => void;
  togglePlayPause: () => void;
  skipForward: () => void;
  skipBack: () => void;
  handleSeek: (percentage: number) => void;
  formatTime: (time: number) => string;
  setIsExpanded: (expanded: boolean) => void;
  isDragging: boolean;
  startDragging: () => void;
  stopDragging: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const playStateBeforeDragRef = useRef(false);

  const dispatch = useDispatch<AppDispatch>();
  const { currentSong, queue } = useSelector((state: RootState) => state.song);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  const getStreamType = (url: string, definedType?: string): "mp3" | "hls" => {
    if (definedType) return definedType as "mp3" | "hls";
    if (url.includes(".m3u8")) return "hls";
    return "mp3";
  };

  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    const audio = audioRef.current;
    setIsAudioReady(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamType = getStreamType(
      currentSong.streamUrl,
      currentSong.streamType
    );

    console.log(
      `Loading song: ${currentSong.title}, streamType: ${streamType}`
    );

    if (streamType === "hls" && Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(currentSong.streamUrl);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest parsed");
        setIsAudioReady(true);
        if (isPlaying) {
          audio.play().catch((error) => {
            console.error("Failed to play HLS stream:", error);
            setIsPlaying(false);
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setIsAudioReady(false);
              break;
          }
        }
      });
    } else {
      audio.src = currentSong.streamUrl;
      audio.load();
      setIsAudioReady(true);

      if (isPlaying) {
        audio.play().catch((error) => {
          console.error("Failed to play audio:", error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentSong, isPlaying]);

  useEffect(() => {
    if (!audioRef.current || !currentSong || !isAudioReady) return;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Failed to play audio:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong, isAudioReady]);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (!isDragging && audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration || currentSong?.duration || 0);
    };

    const handleEnded = () => {
      dispatch(nextSong());
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [dispatch, isDragging, currentSong]);

  const startDragging = () => {
    if (!audioRef.current || !isAudioReady) {
      console.log("Cannot start dragging: audio not ready");
      return;
    }
    console.log("dragging:");

    playStateBeforeDragRef.current = isPlaying;
    setIsDragging(true);

    // Pause only if playing to prevent state mismatch
    if (isPlaying) {
      audioRef.current.pause();
    }
  };

  const stopDragging = () => {
    if (!audioRef.current || !isAudioReady) {
      console.log("Cannot stop dragging: audio not ready");
      setIsDragging(false);
      return;
    }

    setIsDragging(false);

    if (playStateBeforeDragRef.current) {
      console.log("Resuming playback after dragging");
      audioRef.current.play().catch((error) => {
        console.error("Failed to resume audio after dragging:", error);
        setIsPlaying(false);
      });
    }
  };

  const handleSeek = (percentage: number) => {
    if (!audioRef.current || !currentSong || !isAudioReady) {
      console.log("Cannot seek: audio not ready");
      return;
    }

    const seekTime = (percentage / 100) * audioRef.current.duration;
    if (isNaN(seekTime) || !isFinite(seekTime)) {
      console.log("Invalid seek time:", seekTime);
      return;
    }

    console.log(`Seeking to ${percentage}% (${seekTime}s)`);

    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    setProgress(percentage);

    // For HLS, ensure media is updated
    if (hlsRef.current && hlsRef.current.media) {
      hlsRef.current.media.currentTime = seekTime;
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSong || !isAudioReady) {
      console.log("Cannot toggle play/pause: audio not ready");
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const setCurrentSong = (song: Song) => {
    dispatch(setReduxCurrentSong(song));
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const playFromPlaylist = (song: Song, playlistId: string, startIndex = 0) => {
    dispatch(setQueueFromPlaylist({ playlistId, startIndex }));
    dispatch(setReduxCurrentSong(song));
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const playSingleSong = (song: Song) => {
    dispatch(setReduxCurrentSong(song));
    const controller = new AbortController();
    dispatch(
      fetchRelatedSongs({
        songId: song.id,
        signal: controller.signal,
      })
    ).then((action) => {
      if (action.meta.requestStatus === "fulfilled") {
        dispatch(
          setQueueFromRelated({
            song,
            relatedSongs: action.payload,
          })
        );
      }
    });
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const skipForward = () => {
    dispatch(nextSong());
  };

  const skipBack = () => {
    dispatch(previousSong());
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        currentTime,
        duration: audioDuration,
        songsList: queue,
        isExpanded,
        setCurrentSong,
        playFromPlaylist,
        playSingleSong,
        togglePlayPause,
        skipForward,
        skipBack,
        handleSeek,
        formatTime,
        setIsExpanded,
        isDragging,
        startDragging,
        stopDragging,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within a MusicProvider");
  }
  return context;
}
