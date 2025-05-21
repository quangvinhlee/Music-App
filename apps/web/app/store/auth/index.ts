import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  FORGOT_PASSWORD_MUTATION,
  LOGIN_MUTATION,
  RESEND_VERIFICATION_MUTATION,
  RESET_PASSWORD_MUTATION,
  SIGNUP_MUTATION,
  VERIFY_USER_MUTATION,
} from "app/mutations/auth";
import { print } from "graphql";
import { graphQLRequest } from "app/ultils/graphqlRequest";

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

// Async Thunks
export const loginUser = createAsyncThunk<
  { user: any; token: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = (await graphQLRequest(print(LOGIN_MUTATION), {
      loginInput: { email, password },
    })) as { login: { token: string; user: any } | null };

    if (!response.login || !response.login.token) {
      return rejectWithValue("Invalid response from server");
    }

    return {
      token: response.login.token,
      user: response.login.user,
    };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const registerUser = createAsyncThunk<
  { message: string; user: any },
  {
    email: string;
    password: string;
    username: string;
    confirmPassword: string;
  },
  { rejectValue: string }
>("auth/registerUser", async (payload, { rejectWithValue }) => {
  try {
    const response = await graphQLRequest(print(SIGNUP_MUTATION), {
      registerInput: payload,
    });

    if (!response.register?.message) {
      return rejectWithValue("Invalid response from server");
    }

    return {
      message: response.register.message,
      user: response.register.user,
    };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const verifyUser = createAsyncThunk<
  { message: string },
  { verificationCode: string; userId: string },
  { rejectValue: string }
>(
  "auth/verifyUser",
  async ({ verificationCode, userId }, { rejectWithValue }) => {
    try {
      const response = await graphQLRequest(print(VERIFY_USER_MUTATION), {
        verifyUserInput: { userId, verificationCode },
      });

      if (!response.verifyUser?.message) {
        return rejectWithValue("Invalid response from server");
      }

      return { message: response.verifyUser.message };
    } catch (error: any) {
      return rejectWithValue(error.message || "Verification failed.");
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
      forgotPasswordInput: { email },
    });

    if (!response.forgotPassword?.message) {
      return rejectWithValue("Invalid response from server");
    }

    return { message: response.forgotPassword.message };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const resetPassword = createAsyncThunk<
  { message: string },
  { password: string; confirmPassword: string; token: string },
  { rejectValue: string }
>("auth/resetPassword", async (payload, { rejectWithValue }) => {
  try {
    const response = await graphQLRequest(print(RESET_PASSWORD_MUTATION), {
      resetPasswordInput: payload,
    });

    if (!response.resetPassword?.message) {
      return rejectWithValue("Invalid response from server");
    }

    return { message: response.resetPassword.message };
  } catch (error: any) {
    return rejectWithValue(error.message || "Unknown error");
  }
});

export const resendVerification = createAsyncThunk<
  { message: string },
  { userId: string },
  { rejectValue: string }
>("auth/resendVerification", async ({ userId }, { rejectWithValue }) => {
  try {
    const response = await graphQLRequest(print(RESEND_VERIFICATION_MUTATION), {
      resendVerificationInput: { userId },
    });
    if (!response.resendVerification?.message) {
      return rejectWithValue("Invalid response from server");
    }
    return { message: response.resendVerification.message };
  } catch (error: any) {
    return rejectWithValue(error.message || "Unknown error");
  }
});

// Slice
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
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to log in";
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload || "Failed to register";
      })
      // Verify User
      .addCase(verifyUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || "Failed to verify user";
      })
      // Resend verification code
      .addCase(resendVerification.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to resend verification code";
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to send reset link";
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to reset password";
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
