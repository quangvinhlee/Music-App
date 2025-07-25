/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { MusicItem, Artist } from "app/types/music";
import { Playlist } from "app/types/playlist";

// Queue types
export enum QueueType {
  PLAYLIST = "playlist",
  RELATED = "related",
  NONE = "none",
}

export interface SongState {
  isLoading: boolean;
  error: string | null;
  playlistSongs: { [playlistId: string]: MusicItem[] }; // Cache songs by playlist ID
  playlists: Playlist[];
  trendingId: string | null;
  // New properties for queue management
  currentSong: MusicItem | null;
  queueType: QueueType;
  queue: MusicItem[];
  relatedSongs: MusicItem[];
  currentIndex: number;
  shuffleMode: boolean;
  // New property for stream URL cache
  streamUrlCache: { [trackId: string]: { url: string; expires: number } };
  // Current playlist ID for auto-update functionality
  currentPlaylistId: string | null;
  // Recommended artists cache
  recommendedArtists: Artist[];
  lastFetchedArtists: number | null;
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
  streamUrlCache: {},
  // Initialize current playlist ID
  currentPlaylistId: null,
  // Initialize recommended artists cache
  recommendedArtists: [],
  lastFetchedArtists: null,
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
      const song = action.payload as MusicItem;
      state.currentSong = song;
    },
    setQueueFromPlaylist: (state, action) => {
      const { playlistId, startIndex = 0, songs } = action.payload;

      // If songs are provided directly, use them
      if (songs && songs.length > 0) {
        state.queue = songs;
        state.currentIndex = startIndex;
        state.currentSong = songs[startIndex] || null;
        state.queueType = QueueType.PLAYLIST;
        state.currentPlaylistId = playlistId; // Set the current playlist ID
        // Also cache the songs for this playlist
        state.playlistSongs[playlistId] = songs;
      } else {
        // Fallback to existing behavior using cached songs
        const playlistSongs = state.playlistSongs[playlistId] || [];
        if (playlistSongs.length > 0) {
          state.queue = [...playlistSongs];
          state.currentIndex = startIndex;
          state.currentSong = playlistSongs[startIndex] || null;
          state.queueType = QueueType.PLAYLIST;
          state.currentPlaylistId = playlistId; // Set the current playlist ID
        }
      }
    },
    setQueueFromRelated: (state, action) => {
      const { song, relatedSongs } = action.payload;
      // Shuffle related songs
      const shuffledRelatedSongs = [...(relatedSongs || [])];
      for (let i = shuffledRelatedSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledRelatedSongs[i], shuffledRelatedSongs[j]] = [
          shuffledRelatedSongs[j],
          shuffledRelatedSongs[i],
        ];
      }
      state.currentSong = song;
      state.queue = [song, ...shuffledRelatedSongs];
      state.currentIndex = 0;
      state.queueType = QueueType.RELATED;
      state.currentPlaylistId = null; // Clear playlist ID when playing related songs
    },
    appendRelatedSongs: (state, action) => {
      const { relatedSongs } = action.payload;
      if (relatedSongs && relatedSongs.length > 0) {
        // Append new songs to the queue (avoiding duplicates)
        const existingIds = new Set(
          state.queue.map((song: MusicItem) => song.id)
        );
        const newSongs = relatedSongs.filter(
          (song: MusicItem) => !existingIds.has(song.id)
        );
        state.queue = [...state.queue, ...newSongs];
      }
    },
    appendToQueue: (state, action) => {
      const { songs, playlistId } = action.payload;
      if (songs && songs.length > 0) {
        // Append new songs to the queue (avoiding duplicates)
        const existingIds = new Set(
          state.queue.map((song: MusicItem) => song.id)
        );
        const newSongs = songs.filter(
          (song: MusicItem) => !existingIds.has(song.id)
        );

        // Append to the end of the queue
        state.queue = [...state.queue, ...newSongs];

        // Also update the cached playlist songs if playlistId is provided
        if (playlistId) {
          const existingPlaylistSongs = state.playlistSongs[playlistId] || [];
          const existingPlaylistIds = new Set(
            existingPlaylistSongs.map((song: MusicItem) => song.id)
          );
          const newPlaylistSongs = songs.filter(
            (song: MusicItem) => !existingPlaylistIds.has(song.id)
          );
          state.playlistSongs[playlistId] = [
            ...existingPlaylistSongs,
            ...newPlaylistSongs,
          ];
        }
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
      state.currentSong = state.queue[state.currentIndex] as MusicItem | null;
    },
    previousSong: (state) => {
      if (state.queue.length === 0 || state.currentIndex <= 0) {
        return;
      }
      state.currentIndex -= 1;
      state.currentSong = state.queue[state.currentIndex] as MusicItem | null;
    },
    toggleShuffleMode: (state) => {
      if (!state.shuffleMode) {
        // Shuffling the queue except current song
        const currentSong = state.queue[state.currentIndex];
        if (!currentSong) return;
        const remainingSongs = state.queue.filter(
          (_, index) => index !== state.currentIndex
        );
        // Fisher-Yates shuffle algorithm
        for (let i = remainingSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = remainingSongs[i];
          if (temp && remainingSongs[j]) {
            remainingSongs[i] = remainingSongs[j];
            remainingSongs[j] = temp;
          }
        }
        state.queue = [currentSong, ...remainingSongs];
        state.currentIndex = 0;
      }
      state.shuffleMode = !state.shuffleMode;
    },
    clearQueue: (state) => {
      state.queue = [];
      state.currentIndex = -1;
      state.currentSong = null;
      state.queueType = QueueType.NONE;
      state.currentPlaylistId = null; // Clear playlist ID when clearing queue
    },
    // Recommended artists actions
    setRecommendedArtists: (state, action) => {
      state.recommendedArtists = action.payload;
      state.lastFetchedArtists = Date.now();
    },
    clearRecommendedArtists: (state) => {
      state.recommendedArtists = [];
      state.lastFetchedArtists = null;
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
  appendToQueue,
  nextSong,
  previousSong,
  toggleShuffleMode,
  clearQueue,
  setRecommendedArtists,
  clearRecommendedArtists,
} = songSlice.actions;
export default songSlice.reducer;
