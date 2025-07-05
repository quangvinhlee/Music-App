import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Artist } from "@/types/music";

export interface ArtistState {
  artist: Artist | null;
}

const initialState: ArtistState = {
  artist: null,
};

export const artistSlice = createSlice({
  name: "artist",
  initialState,
  reducers: {
    setArtist: (state, action: PayloadAction<Artist>) => {
      state.artist = action.payload;
    },
    clearArtist: (state) => {
      state.artist = null;
    },
  },
});

export const { setArtist, clearArtist } = artistSlice.actions;
export default artistSlice.reducer;
