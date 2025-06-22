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
} from "app/store/song";
import Hls from "hls.js";
import { useRelatedSongs } from "app/query/useSongQueries";
import { formatTime as formatTimeUtil } from "app/utils";

interface RelatedSongsResponse {
  tracks: Song[];
  nextHref?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  streamUrl?: string;
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
    startIndex?: number,
    playlistSongs?: Song[]
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
  loadMoreRelatedSongs: () => void;
  hasMoreRelatedSongs: boolean;
  isLoadingMoreRelatedSongs: boolean;
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
  const [isLoadingNewSong, setIsLoadingNewSong] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const playStateBeforeDragRef = useRef(false);

  const dispatch = useDispatch<AppDispatch>();
  const { currentSong, queue, queueType, currentIndex } = useSelector(
    (state: RootState) => state.song
  );

  // Related songs state
  const [relatedSongId, setRelatedSongId] = useState<string | null>(null);
  const {
    data: relatedSongsData,
    isFetching: isFetchingRelatedSongs,
    fetchNextPage: fetchNextRelatedSongs,
    hasNextPage: hasNextRelatedSongs,
  } = useRelatedSongs(relatedSongId ?? "", { enabled: !!relatedSongId });

  // Initialize audio element
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

  // Handle song changes
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    const audio = audioRef.current;

    // Store if we should auto-play after loading
    setShouldAutoPlay(isPlaying);

    // Reset states
    setIsAudioReady(false);
    setIsLoadingNewSong(true);

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Pause current audio
    audio.pause();

    // Check if we have a stream URL
    if (!currentSong.streamUrl) {
      console.log(`No stream URL available for song: ${currentSong.title}`);
      setIsLoadingNewSong(false);
      return;
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
        setIsLoadingNewSong(false);

        if (shouldAutoPlay) {
          setTimeout(() => {
            audio.play().catch((error) => {
              console.error("Failed to play HLS stream:", error);
              setIsPlaying(false);
            });
          }, 100);
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
              setIsLoadingNewSong(false);
              break;
          }
        }
      });
    } else {
      audio.src = currentSong.streamUrl;
      audio.load();

      const handleCanPlay = () => {
        setIsAudioReady(true);
        setIsLoadingNewSong(false);

        if (shouldAutoPlay) {
          setTimeout(() => {
            audio.play().catch((error) => {
              console.error("Failed to play audio:", error);
              setIsPlaying(false);
            });
          }, 100);
        }
        audio.removeEventListener("canplay", handleCanPlay);
      };

      audio.addEventListener("canplay", handleCanPlay);
    }
  }, [currentSong]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current || !currentSong || !isAudioReady || isLoadingNewSong)
      return;

    const audio = audioRef.current;
    const wasPlaying = !audio.paused;

    if (isPlaying && !wasPlaying) {
      audio.play().catch((error) => {
        console.error("Failed to play audio:", error);
        setIsPlaying(false);
      });
    } else if (!isPlaying && wasPlaying) {
      audio.pause();
    }
  }, [isPlaying, currentSong, isAudioReady, isLoadingNewSong]);

  // Audio event listeners
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
  }, [currentSong, isDragging, dispatch]);

  // Handle related songs
  useEffect(() => {
    if (
      relatedSongId &&
      relatedSongsData &&
      currentSong &&
      relatedSongId === currentSong.id
    ) {
      const firstPage = relatedSongsData.pages[0];
      if (firstPage) {
        const relatedTracks =
          (firstPage as RelatedSongsResponse).tracks || firstPage;
        dispatch(
          setQueueFromRelated({
            song: currentSong,
            relatedSongs: relatedTracks || [],
            nextHref: (firstPage as RelatedSongsResponse).nextHref,
          })
        );
      }
      setRelatedSongId(null);
    }
  }, [relatedSongsData, relatedSongId, currentSong, dispatch]);

  // Drag handling
  const startDragging = () => {
    if (!audioRef.current || !isAudioReady) return;

    playStateBeforeDragRef.current = isPlaying;
    setIsDragging(true);

    if (isPlaying) {
      audioRef.current.pause();
    }
  };

  const stopDragging = () => {
    if (!audioRef.current || !isAudioReady) {
      setIsDragging(false);
      return;
    }

    setIsDragging(false);

    if (playStateBeforeDragRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Failed to resume audio after dragging:", error);
        setIsPlaying(false);
      });
    }
  };

  const handleSeek = (percentage: number) => {
    if (!audioRef.current || !currentSong || !isAudioReady) return;

    const seekTime = (percentage / 100) * audioRef.current.duration;
    if (isNaN(seekTime) || !isFinite(seekTime)) return;

    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    setProgress(percentage);

    if (hlsRef.current && hlsRef.current.media) {
      hlsRef.current.media.currentTime = seekTime;
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSong) return;

    if (!isAudioReady || isLoadingNewSong) {
      // Allow state change even if audio isn't ready
      setIsPlaying(!isPlaying);
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

  const playFromPlaylist = (
    song: Song,
    playlistId: string,
    startIndex = 0,
    playlistSongs?: Song[]
  ) => {
    if (playlistSongs) {
      dispatch(
        setQueueFromPlaylist({
          playlistId,
          startIndex,
          songs: playlistSongs,
        })
      );
    } else {
      dispatch(setQueueFromPlaylist({ playlistId, startIndex }));
    }
    dispatch(setReduxCurrentSong(song));
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const playSingleSong = (song: Song) => {
    dispatch(setReduxCurrentSong(song));
    setRelatedSongId(song.id);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const loadMoreRelatedSongs = async () => {
    if (!hasNextRelatedSongs || isFetchingRelatedSongs) return;
    try {
      await fetchNextRelatedSongs();
    } catch (error) {
      console.error("Failed to load more related songs:", error);
    }
  };

  const skipForward = () => {
    dispatch(nextSong());
  };

  const skipBack = () => {
    dispatch(previousSong());
  };

  const formatTime = (time: number) => {
    return formatTimeUtil(time);
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
        loadMoreRelatedSongs,
        hasMoreRelatedSongs: hasNextRelatedSongs,
        isLoadingMoreRelatedSongs: isFetchingRelatedSongs,
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
