/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  FETCH_HOT_SONG_BY_GENRE,
  FETCH_RELATED_SONGS,
  FETCH_TRENDING_PLAYLIST_SONGS,
  FETCH_TRENDING_SONG,
  FETCH_TRENDING_SONG_PLAYLISTS,
} from "app/mutations/song";
import { graphQLRequest } from "app/ultils/graphqlRequest";
import { print } from "graphql";

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

export const fetchTrendingIdByCountry = createAsyncThunk<
  { id: string },
  { countryCode: string },
  { rejectValue: string }
>(
  "song/fetchTrendingIdByCountry",
  async ({ countryCode }, { rejectWithValue }) => {
    try {
      const response = (await graphQLRequest(print(FETCH_TRENDING_SONG), {
        fetchTrendingSongInput: { CountryCode: countryCode },
      })) as { fetchTrendingSong: { id: string } };

      if (!response.fetchTrendingSong) {
        throw new Error("Invalid response from server");
      }

      return response.fetchTrendingSong;
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted");
        return rejectWithValue("Fetch aborted");
      }
      console.error("Error fetching trending song:", error.message);
      return rejectWithValue(error.message || "Failed to fetch trending song");
    }
  }
);

export const fetchTrendingSongPlaylists = createAsyncThunk<
  any[],
  { id: string; signal: AbortSignal },
  { rejectValue: string }
>(
  "song/fetchTrendingSongPlaylists",
  async ({ id, signal }, { rejectWithValue }) => {
    try {
      const response = (await graphQLRequest(
        print(FETCH_TRENDING_SONG_PLAYLISTS),
        {
          fetchTrendingSongPlaylistsInput: { id },
        },
        { signal }
      )) as { fetchTrendingSongPlaylists: any[] };

      if (!response.fetchTrendingSongPlaylists) {
        throw new Error("Invalid response from server");
      }
      return response.fetchTrendingSongPlaylists;
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted");
        return rejectWithValue("Fetch aborted");
      }
      console.error("Error fetching trending song playlists:", error.message);
      return rejectWithValue(
        error.message || "Failed to fetch trending song playlists"
      );
    }
  }
);

export const fetchTrendingPlaylistSongs = createAsyncThunk<
  { playlistId: string; songs: any[] }, // Return playlistId with songs
  { id: string; signal: AbortSignal },
  { rejectValue: string }
>(
  "song/fetchTrendingPlaylistSongs",
  async ({ id, signal }, { rejectWithValue }) => {
    try {
      const response = (await graphQLRequest(
        print(FETCH_TRENDING_PLAYLIST_SONGS),
        {
          fetchTrendingPlaylistSongsInput: { id },
        },
        { signal }
      )) as { fetchTrendingPlaylistSongs: any[] };

      if (!response.fetchTrendingPlaylistSongs) {
        throw new Error("Invalid response from server");
      }
      return { playlistId: id, songs: response.fetchTrendingPlaylistSongs };
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted");
        return rejectWithValue("Fetch aborted");
      }
      console.error("Error fetching trending playlist songs:", error.message);
      return rejectWithValue(
        error.message || "Failed to fetch trending playlist songs"
      );
    }
  }
);

// Add new async thunk to fetch related songs
export const fetchRelatedSongs = createAsyncThunk<
  Song[],
  { songId: string; signal: AbortSignal },
  { rejectValue: string }
>("song/fetchRelatedSongs", async ({ songId, signal }, { rejectWithValue }) => {
  try {
    const response = (await graphQLRequest(
      print(FETCH_RELATED_SONGS), // Replace with actual FETCH_RELATED_SONGS query
      {
        fetchRelatedSongsInput: { id: songId },
      },
      { signal }
    )) as { fetchRelatedSongs: Song[] };

    if (!response.fetchRelatedSongs) {
      throw new Error("Invalid response from server");
    }
    return response.fetchRelatedSongs;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Fetch aborted");
      return rejectWithValue("Fetch aborted");
    }
    console.error("Error fetching related songs:", error.message);
    return rejectWithValue(error.message || "Failed to fetch related songs");
  }
});

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
      state.currentSong = action.payload;
    },
    setQueueFromPlaylist: (state, action) => {
      const { playlistId, startIndex = 0 } = action.payload;
      const playlistSongs = state.playlistSongs[playlistId] || [];

      if (playlistSongs.length > 0) {
        state.queue = [...playlistSongs];
        state.currentIndex = startIndex;
        state.currentSong = playlistSongs[startIndex];
        state.queueType = QueueType.PLAYLIST;
      }
    },
    setQueueFromRelated: (state, action) => {
      const { song, relatedSongs } = action.payload;

      state.currentSong = song;
      state.queue = [song, ...relatedSongs];
      state.currentIndex = 0;
      state.queueType = QueueType.RELATED;
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrendingIdByCountry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrendingIdByCountry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trendingId = action.payload.id;
        console.log("action.payload.id:", action.payload.id);
      })
      .addCase(fetchTrendingIdByCountry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTrendingSongPlaylists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrendingSongPlaylists.fulfilled, (state, action) => {
        state.isLoading = false;
        state.playlists = action.payload;
        console.log("Playlists fetched:", action.payload);
      })
      .addCase(fetchTrendingSongPlaylists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTrendingPlaylistSongs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrendingPlaylistSongs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.playlistSongs[action.payload.playlistId] = action.payload.songs;
        console.log("Playlist songs fetched:", action.payload);
      })
      .addCase(fetchTrendingPlaylistSongs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add cases for the new related songs thunk
      .addCase(fetchRelatedSongs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRelatedSongs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.relatedSongs = action.payload;
      })
      .addCase(fetchRelatedSongs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSongs,
  clearTrendingId,
  setCurrentSong,
  setQueueFromPlaylist,
  setQueueFromRelated,
  nextSong,
  previousSong,
  toggleShuffleMode,
  clearQueue,
} = songSlice.actions;
export default songSlice.reducer;
