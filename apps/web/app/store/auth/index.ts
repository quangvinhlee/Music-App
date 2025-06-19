import { createSlice } from "@reduxjs/toolkit";

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
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem("token");
    },
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
