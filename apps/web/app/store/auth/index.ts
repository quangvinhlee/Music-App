import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
  isLoading: boolean;
  error: string | null;
  countryCode: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  isLoading: false,
  error: null,
  countryCode: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = null;
      Cookies.remove("token", { path: "/" });
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { setUser, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
