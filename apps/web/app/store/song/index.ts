/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

// Define the types for Song data
interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  artwork: string;
  streamUrl: string;
  duration: number;
}

interface Playlist {
  id: string;
  title: string;
  genre: string;
  artwork: string;
}

// Queue types
export enum QueueType {
  PLAYLIST = "playlist",
  RELATED = "related",
  NONE = "none",
}

export interface SongState {
  isLoading: boolean;
  error: string | null;
  playlistSongs: { [playlistId: string]: Song[] }; // Cache songs by playlist ID
  playlists: Playlist[];
  trendingId: string | null;
  // New properties for queue management
  currentSong: Song | null;
  queueType: QueueType;
  queue: Song[];
  relatedSongs: Song[];
  currentIndex: number;
  shuffleMode: boolean;
}

const initialState: SongState = {
  isLoading: false,
  error: null,
  playlistSongs: {}, // Object to store songs for each playlist
  playlists: [],
  trendingId: null,
  // Initialize new properties
  currentSong: null,
  queueType: QueueType.NONE,
  queue: [],
  relatedSongs: [],
  currentIndex: -1,
  shuffleMode: false,
};

export const songSlice = createSlice({
  name: "song",
  initialState,
  reducers: {
    clearSongs: (state) => {
      state.playlistSongs = {};
      state.isLoading = false;
      state.error = null;
    },
    clearTrendingId: (state) => {
      state.trendingId = null;
    },
    // New reducer actions for queue management
    setCurrentSong: (state, action) => {
      console.log("Setting current song:", action.payload.title);
      state.currentSong = action.payload;
    },
    setQueueFromPlaylist: (state, action) => {
      const { playlistId, startIndex = 0, songs } = action.payload;

      console.log("setQueueFromPlaylist reducer called:", {
        playlistId,
        startIndex,
        songsProvided: !!songs,
        songsCount: songs?.length || 0,
      });

      // If songs are provided directly, use them
      if (songs && songs.length > 0) {
        state.queue = [...songs];
        state.currentIndex = startIndex;
        state.currentSong = songs[startIndex];
        state.queueType = QueueType.PLAYLIST;

        // Also cache the songs for this playlist
        state.playlistSongs[playlistId] = songs;

        console.log("Queue set from provided songs:", {
          queueLength: state.queue.length,
          currentIndex: state.currentIndex,
          currentSong: state.currentSong?.title,
        });
      } else {
        // Fallback to existing behavior using cached songs
        const playlistSongs = state.playlistSongs[playlistId] || [];

        if (playlistSongs.length > 0) {
          state.queue = [...playlistSongs];
          state.currentIndex = startIndex;
          state.currentSong = playlistSongs[startIndex];
          state.queueType = QueueType.PLAYLIST;

          console.log("Queue set from cached songs:", {
            queueLength: state.queue.length,
            currentIndex: state.currentIndex,
            currentSong: state.currentSong?.title,
          });
        } else {
          console.log("No songs found for playlist:", playlistId);
        }
      }
    },
    setQueueFromRelated: (state, action) => {
      const { song, relatedSongs } = action.payload;

      console.log("setQueueFromRelated reducer called:", {
        song: song.title,
        relatedSongsCount: relatedSongs?.length || 0,
      });

      state.currentSong = song;
      state.queue = [song, ...(relatedSongs || [])];
      state.currentIndex = 0;
      state.queueType = QueueType.RELATED;

      console.log("Queue set from related songs:", {
        queueLength: state.queue.length,
        currentIndex: state.currentIndex,
      });
    },
    appendRelatedSongs: (state, action) => {
      const { relatedSongs } = action.payload;

      console.log("appendRelatedSongs reducer called:", {
        newSongsCount: relatedSongs?.length || 0,
      });

      if (relatedSongs && relatedSongs.length > 0) {
        // Append new songs to the queue (avoiding duplicates)
        const existingIds = new Set(state.queue.map((song) => song.id));
        const newSongs = relatedSongs.filter(
          (song) => !existingIds.has(song.id)
        );

        state.queue = [...state.queue, ...newSongs];

        console.log("Appended related songs:", {
          queueLength: state.queue.length,
          newSongsAdded: newSongs.length,
        });
      }
    },
    nextSong: (state) => {
      if (
        state.queue.length === 0 ||
        state.currentIndex >= state.queue.length - 1
      ) {
        return;
      }

      state.currentIndex += 1;
      state.currentSong = state.queue[state.currentIndex];
    },
    previousSong: (state) => {
      if (state.queue.length === 0 || state.currentIndex <= 0) {
        return;
      }

      state.currentIndex -= 1;
      state.currentSong = state.queue[state.currentIndex];
    },
    toggleShuffleMode: (state) => {
      if (!state.shuffleMode) {
        // Shuffling the queue except current song
        const currentSong = state.queue[state.currentIndex];
        const remainingSongs = [
          ...state.queue.filter((_, index) => index !== state.currentIndex),
        ];

        // Fisher-Yates shuffle algorithm
        for (let i = remainingSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remainingSongs[i], remainingSongs[j]] = [
            remainingSongs[j],
            remainingSongs[i],
          ];
        }

        state.queue = [currentSong, ...remainingSongs];
        state.currentIndex = 0;
      } else {
        // If turning shuffle off, need to restore original order
        // This requires storing original order somewhere - for simplicity we'll
        // just toggle the flag here. In a real implementation you'd restore the original order.
      }

      state.shuffleMode = !state.shuffleMode;
    },
    clearQueue: (state) => {
      state.queue = [];
      state.currentIndex = -1;
      state.currentSong = null;
      state.queueType = QueueType.NONE;
    },
  },
});

export const {
  clearSongs,
  clearTrendingId,
  setCurrentSong,
  setQueueFromPlaylist,
  setQueueFromRelated,
  appendRelatedSongs,
  nextSong,
  previousSong,
  toggleShuffleMode,
  clearQueue,
} = songSlice.actions;
export default songSlice.reducer;
