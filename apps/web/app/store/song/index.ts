/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  FETCH_HOT_SONG_BY_GENRE,
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

export interface SongState {
  isLoading: boolean;
  error: string | null;
  songs: Song[];
  playlists: Playlist[];
  trendingId: string | null;
}

const initialState: SongState = {
  isLoading: false,
  error: null,
  songs: [],
  playlists: [],
  trendingId: null,
};

// // Async thunk for fetching hot songs
// export const fetchHotSongs = createAsyncThunk<
//   any[],
//   { kind: string; genre: string; signal: AbortSignal },
//   { rejectValue: string }
// >(
//   "song/fetchHotSongs",
//   async ({ kind, genre, signal }, { rejectWithValue }) => {
//     try {
//       // Log the inputs
//       console.log("Fetching songs for genre:", genre, "kind:", kind);

//       const response = (await graphQLRequest(
//         print(FETCH_HOT_SONG_BY_GENRE),
//         {
//           fetchHotSongInput: { kind, genre },
//         },
//         { signal }
//       )) as { fetchHotSoundCloudTracks: any[] };

//       // Return fetched tracks
//       return response.fetchHotSoundCloudTracks;
//     } catch (error: any) {
//       if (error.name === "AbortError") {
//         console.log("Fetch aborted"); // Handle fetch cancellation
//         return rejectWithValue("Fetch aborted");
//       }
//       console.error("Error fetching hot songs:", error.message); // Log error message
//       return rejectWithValue(error.message || "Failed to fetch songs");
//     }
//   }
// );

export const fetchTrendingIdByCountry = createAsyncThunk<
  { id: string },
  { countryCode: string },
  { rejectValue: string }
>(
  "song/fetchTrendingIdByCountry",
  async ({ countryCode }, { rejectWithValue }) => {
    try {
      const response = (await graphQLRequest(print(FETCH_TRENDING_SONG), {
        fetchTrendingSongInput: { CountryCode: countryCode }, // Changed from countryCode to CountryCode
      })) as { fetchTrendingSong: { id: string } };

      if (!response.fetchTrendingSong) {
        throw new Error("Invalid response from server");
      }

      return response.fetchTrendingSong;
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted"); // Handle fetch cancellation
        return rejectWithValue("Fetch aborted");
      }
      console.error("Error fetching trending song:", error.message); // Log error message
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
        console.log("Fetch aborted"); // Handle fetch cancellation
        return rejectWithValue("Fetch aborted");
      }
      console.error("Error fetching trending song playlists:", error.message); // Log error message
      return rejectWithValue(
        error.message || "Failed to fetch trending song playlists"
      );
    }
  }
);

export const fetchTrendingPlaylistSongs = createAsyncThunk<
  any[],
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
      return response.fetchTrendingPlaylistSongs;
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted"); // Handle fetch cancellation
        return rejectWithValue("Fetch aborted");
      }
      console.error("Error fetching trending song playlists:", error.message); // Log error message
      return rejectWithValue(
        error.message || "Failed to fetch trending song playlists"
      );
    }
  }
);

export const songSlice = createSlice({
  name: "song",
  initialState,
  reducers: {
    clearSongs: (state) => {
      state.songs = [];
      state.isLoading = true;
      state.error = null;
    },
    clearTrendingId: (state) => {
      state.trendingId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // .addCase(fetchHotSongs.pending, (state) => {
      //   state.isLoading = true;
      //   state.error = null;
      // })
      // .addCase(fetchHotSongs.fulfilled, (state, action) => {
      //   state.isLoading = false;

      //   console.log("action.payload;:", action.payload);
      //   state.songs = action.payload;
      // })
      // .addCase(fetchHotSongs.rejected, (state, action) => {
      //   state.isLoading = false;
      //   state.error = action.payload as string;
      // })
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
        state.songs = action.payload;
        console.log("action.payload:", action.payload);
      })
      .addCase(fetchTrendingPlaylistSongs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSongs, clearTrendingId } = songSlice.actions;
export default songSlice.reducer;
