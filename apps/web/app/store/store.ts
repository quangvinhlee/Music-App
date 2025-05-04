import { configureStore, combineReducers } from "@reduxjs/toolkit";
import AuthReducer from "./auth";
import SongReducer from "./song";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

// Configure persistence for the song slice only
const songPersistConfig = {
  key: "song",
  storage,
  whitelist: ["songs"], // persist both songs array and trendingId
};

// Wrap the song reducer with persistReducer
const persistedSongReducer = persistReducer(songPersistConfig, SongReducer);

// Combine reducers
const combinedReducer = combineReducers({
  auth: AuthReducer, // not persisted
  song: persistedSongReducer, // persisted
});

// Create the Redux store
const store = configureStore({
  reducer: combinedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
          "persist/FLUSH",
          "persist/PAUSE",
          "persist/PURGE",
        ],
      },
    }),
});

// Create the persistor for use with <PersistGate>
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
