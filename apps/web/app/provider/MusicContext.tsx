"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "app/store/store";
import {
  setCurrentSong as setReduxCurrentSong,
  nextSong,
  previousSong,
  setQueueFromPlaylist,
  setQueueFromRelated,
  appendToQueue,
} from "app/store/song";
import Hls from "hls.js";
import { useRelatedSongs, useStreamUrl } from "app/query/useSoundcloudQueries";
import { useCreateRecentPlayed } from "app/query/useInteractQueries";
import { formatTime as formatTimeUtil } from "@/utils";
import { MusicItem } from "@/types/music";

interface RelatedSongsResponse {
  tracks: MusicItem[];
}

interface MusicContextType {
  currentSong: MusicItem | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  songsList: MusicItem[];
  isExpanded: boolean;
  isStreamUrlLoading: boolean;
  setCurrentSong: (song: MusicItem) => void;
  playFromPlaylist: (
    song: MusicItem,
    playlistId: string,
    startIndex?: number,
    playlistSongs?: MusicItem[]
  ) => void;
  playSingleSong: (song: MusicItem) => void;
  appendSongsToQueue: (songs: MusicItem[], playlistId?: string) => void;
  togglePlayPause: () => void;
  skipForward: () => void;
  skipBack: () => void;
  handleSeek: (percentage: number) => void;
  formatTime: (time: number) => string;
  setIsExpanded: (expanded: boolean) => void;
  isDragging: boolean;
  startDragging: () => void;
  stopDragging: () => void;
  isPlayerVisible: boolean;
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
  const lastSavedSongIdRef = useRef<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { currentSong, queue, queueType, currentIndex } = useSelector(
    (state: RootState) => state.song
  );
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Helper function to determine if a track ID is an internal track
  const isInternalTrack = (id: string): boolean => {
    // Internal track IDs are MongoDB ObjectId format (24 hex characters)
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Related songs state
  const [relatedSongId, setRelatedSongId] = useState<string | null>(null);
  const { data: relatedSongsData } = useRelatedSongs(relatedSongId ?? "", {
    enabled: !!relatedSongId,
  });

  // Stream URL fetching for tracks that don't have streamUrl
  const { data: streamUrl, isLoading: isStreamUrlLoading } = useStreamUrl(
    currentSong?.id || null,
    {
      enabled: !!currentSong?.id && !isInternalTrack(currentSong.id), // Skip fetch for internal tracks
    }
  );

  // Recent play mutation
  const { mutate: createRecentPlayed } = useCreateRecentPlayed(user);

  // Function to save recent play when user is authenticated
  const saveRecentPlay = useCallback(
    (song: MusicItem) => {
      if (!isAuthenticated || !user) {
        return; // Skip if user is not authenticated
      }

      // Prevent duplicate saves for the same song
      if (lastSavedSongIdRef.current === song.id) {
        return;
      }

      try {
        createRecentPlayed({
          trackId: song.id,
          title: song.title,
          artistId: song.artist.id,
          artwork: song.artwork,
          duration: Math.round(song.duration), // Round to nearest integer
          genre: song.genre,
          createdAt: song.createdAt ? new Date(song.createdAt) : null,
        });
        // Update the last saved song ID
        lastSavedSongIdRef.current = song.id;
      } catch (error) {
        console.error("Failed to save recent play:", error);
        // Don't throw error - we don't want to break playback if saving fails
      }
    },
    [isAuthenticated, user, createRecentPlayed]
  );

  const setCurrentSong = (song: MusicItem) => {
    dispatch(setReduxCurrentSong(song));
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

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
      setIsLoadingNewSong(false);
      return;
    }

    const streamType = getStreamType(currentSong.streamUrl);

    if (streamType === "hls" && Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(currentSong.streamUrl);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
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
      const relatedTracks =
        (relatedSongsData as RelatedSongsResponse).tracks || relatedSongsData;
      dispatch(
        setQueueFromRelated({
          song: currentSong,
          relatedSongs: relatedTracks || [],
        })
      );
      setRelatedSongId(null);
    }
  }, [relatedSongsData, relatedSongId, currentSong, dispatch]);

  // Update currentSong with streamUrl when fetched
  useEffect(() => {
    if (
      currentSong &&
      streamUrl &&
      typeof streamUrl === "string" &&
      currentSong.streamUrl !== streamUrl
    ) {
      setCurrentSong({ ...currentSong, streamUrl });
    }
  }, [streamUrl, currentSong, setCurrentSong]);

  // Save recent play when currentSong changes due to navigation (next/previous)
  useEffect(() => {
    if (currentSong && isAuthenticated && user) {
      // Only save if this is a different song than the last one saved
      if (lastSavedSongIdRef.current !== currentSong.id) {
        saveRecentPlay(currentSong);
      }
    }
  }, [currentSong?.id, isAuthenticated, user, saveRecentPlay]);

  // Reset last saved song ID when user changes
  useEffect(() => {
    lastSavedSongIdRef.current = null;
  }, [user?.id]);

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

  const playFromPlaylist = (
    song: MusicItem,
    playlistId: string,
    startIndex = 0,
    playlistSongs?: MusicItem[]
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
    // Don't override the current song - it's already set by setQueueFromPlaylist
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const playSingleSong = (song: MusicItem) => {
    dispatch(setReduxCurrentSong(song));
    setRelatedSongId(song.id);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const appendSongsToQueue = (songs: MusicItem[], playlistId?: string) => {
    dispatch(appendToQueue({ songs, playlistId }));
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

  const isPlayerVisible = !!currentSong;

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
        isStreamUrlLoading,
        setCurrentSong,
        playFromPlaylist,
        playSingleSong,
        appendSongsToQueue,
        togglePlayPause,
        skipForward,
        skipBack,
        handleSeek,
        formatTime,
        setIsExpanded,
        isDragging,
        startDragging,
        stopDragging,
        isPlayerVisible,
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
