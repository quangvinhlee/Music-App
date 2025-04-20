import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "./auth";
import SongReducer from "./song";

export default configureStore({
  reducer: {
    auth: AuthReducer,
    song: SongReducer,
  },
});
