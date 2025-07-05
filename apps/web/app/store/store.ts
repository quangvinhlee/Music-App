import { configureStore, combineReducers } from "@reduxjs/toolkit";
import AuthReducer from "./auth";
import SongReducer from "./song";
import ArtistReducer from "./artist";

// Combine reducers
const combinedReducer = combineReducers({
  auth: AuthReducer,
  song: SongReducer, // now using normal reducer without persistence
  artist: ArtistReducer,
});

// Create the Redux store
const store = configureStore({
  reducer: combinedReducer,
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
