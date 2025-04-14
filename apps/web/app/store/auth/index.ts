import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  FORGOT_PASSWORD_MUTATION,
  GET_USER_QUERY,
  LOGIN_MUTATION,
  RESET_PASSWORD_MUTATION,
} from "app/mutations/auth";
import { print } from "graphql";
import { graphQLRequest } from "app/ultils/graphqlRequest";
import { stat } from "fs";

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk<
  { user: any; token: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await graphQLRequest(print(LOGIN_MUTATION), {
      loginInput: {
        email,
        password,
      },
    });

    if (!response.login || !response.login.token) {
      return rejectWithValue("Invalid response from server");
    }

    return {
      token: response.login.token,
    };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchUser = createAsyncThunk<any, void, { rejectValue: string }>(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await graphQLRequest(print(GET_USER_QUERY));
      return response.getUser;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk<
  { message: string },
  { email: string },
  { rejectValue: string }
>("auth/forgotPassword", async ({ email }, { rejectWithValue }) => {
  try {
    const response = await graphQLRequest(print(FORGOT_PASSWORD_MUTATION), {
      forgotPasswordInput: {
        email,
      },
    });
    if (!response.forgotPassword) {
      return rejectWithValue("Invalid response from server");
    }

    return {
      message: response.forgotPassword.message,
    };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const resetPassword = createAsyncThunk<
  { message: string },
  { confirmPassword: string; password: string; token: string },
  { rejectValue: string }
>(
  "auth/resetPassword",
  async ({ password, confirmPassword, token }, { rejectWithValue }) => {
    try {
      const response = await graphQLRequest(print(RESET_PASSWORD_MUTATION), {
        resetPasswordInput: {
          password,
          confirmPassword,
          token,
        },
      });
      if (!response.data) {
        return rejectWithValue(response);
      }

      console.log(response);
      // return {
      //   message: response.forgotPassword.message,
      // };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = true;
        state.error = action.payload || "Failed to log in";
      })
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
        state.isAuthenticated = true;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = true;
        state.user = null;
        state.error = action.payload || "Failed to fetch user";
        state.isAuthenticated = false;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = true;
        state.error = action.payload || "Failed to send reset link";
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = true;
        state.error = action.payload || "Failed to reset password";
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
