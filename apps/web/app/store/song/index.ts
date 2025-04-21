import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FETCH_HOT_SONG_BY_GENRE } from "app/mutations/song";
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

export interface SongState {
  isLoading: boolean;
  error: string | null;
  songs: Song[];
}

const initialState: SongState = {
  isLoading: false,
  error: null,
  songs: [],
};

// Async thunk for fetching hot songs
export const fetchHotSongs = createAsyncThunk<
  any[],
  { kind: string; genre: string; signal: AbortSignal },
  { rejectValue: string }
>(
  "song/fetchHotSongs",
  async ({ kind, genre, signal }, { rejectWithValue }) => {
    try {
      // Log the inputs
      console.log("Fetching songs for genre:", genre, "kind:", kind);

      const response = await graphQLRequest(
        print(FETCH_HOT_SONG_BY_GENRE),
        {
          fetchHotSongInput: { kind, genre },
        },
        { signal }
      ); // Pass signal to the request

      // Return fetched tracks
      return response.fetchHotSoundCloudTracks;
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted"); // Handle fetch cancellation
        return rejectWithValue("Fetch aborted");
      }
      console.error("Error fetching hot songs:", error.message); // Log error message
      return rejectWithValue(error.message || "Failed to fetch songs");
    }
  }
);

export const songSlice = createSlice({
  name: "song",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotSongs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.songs = [];
      })
      .addCase(fetchHotSongs.fulfilled, (state, action) => {
        state.isLoading = false;

        console.log("action.payload;:", action.payload);
        state.songs = action.payload;
      })
      .addCase(fetchHotSongs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default songSlice.reducer;
