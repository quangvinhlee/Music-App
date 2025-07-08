import { useQuery, useQueryClient } from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "@/utils/graphqlRequest";
import { GET_COUNTRY_CODE_QUERY, LOGOUT_MUTATION } from "app/mutations/auth";
import {
  LOGIN_MUTATION,
  SIGNUP_MUTATION,
  VERIFY_USER_MUTATION,
  RESEND_VERIFICATION_MUTATION,
  FORGOT_PASSWORD_MUTATION,
  RESET_PASSWORD_MUTATION,
} from "app/mutations/auth";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, logout } from "app/store/auth";
import { AppDispatch } from "app/store/store";
import { useCurrentUser } from "./useUserQueries";

export function useGeoInfo() {
  return useQuery({
    queryKey: ["geoInfo"],
    queryFn: async () => {
      try {
        const response = (await graphQLRequest(
          print(GET_COUNTRY_CODE_QUERY),
          {}
        )) as any;
        if (!response?.getCountryCodeByIp)
          throw new Error("Failed to get country information");
        return {
          countryCode: response.getCountryCodeByIp.countryCode || "US",
          countryName:
            response.getCountryCodeByIp.countryName || "United States",
        };
      } catch (error: any) {
        console.error("Error fetching geo info:", error);
        // Return default values for unauthenticated users
        return {
          countryCode: "US",
          countryName: "United States",
        };
      }
    },
    retry: false,
    retryDelay: 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const { refetch } = useCurrentUser();

  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const response = (await graphQLRequest(print(LOGIN_MUTATION), {
        loginInput: input,
      })) as any;
      if (!response.login.token) {
        throw new Error("Login failed: No token received");
      }
      return response.login;
    },
    onSuccess: async (data) => {
      // Refetch the current user and update Redux state
      const userResult = await refetch();
      if (userResult.data) {
        dispatch(setUser(userResult.data));
      }
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: async () => {
      try {
        // Call backend logout to clear server-side session
        await graphQLRequest(print(LOGOUT_MUTATION), {});
      } catch (error) {
        // Continue with frontend cleanup even if backend fails
      }

      // Remove both token cookies (the correct one and the typo one)
      Cookies.remove("token", { path: "/" });
    },
    onSuccess: () => {
      // Clear user from Redux
      dispatch(logout());
      // Immediately clear the user data from the cache
      queryClient.setQueryData(["currentUser"], null);
      // Invalidate auth-dependent queries specifically
      queryClient.invalidateQueries({ queryKey: ["recentPlayed"] });
      queryClient.invalidateQueries({ queryKey: ["recommendSongs"] });
      // Clear all queries to prevent auth errors
      queryClient.invalidateQueries();
    },
  });
}

// Hook for pages that require authentication
export function useRequireAuth() {
  const { data: user, isLoading, error } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && !error) {
      // User is not authenticated, redirect to login
      router.push("/auth/login");
    }
  }, [user, isLoading, error, router]);

  return { user, isLoading, error };
}

export function useRegister() {
  return useMutation({
    mutationFn: async (input: {
      email: string;
      username: string;
      password: string;
      confirmPassword: string;
    }) => {
      const response = (await graphQLRequest(print(SIGNUP_MUTATION), {
        registerInput: input,
      })) as any;
      return response.register;
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (input: { email: string }) => {
      const response = (await graphQLRequest(print(FORGOT_PASSWORD_MUTATION), {
        forgotPasswordInput: input,
      })) as any;
      return response.forgotPassword;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (input: {
      password: string;
      confirmPassword: string;
      token: string;
    }) => {
      const response = (await graphQLRequest(print(RESET_PASSWORD_MUTATION), {
        resetPasswordInput: input,
      })) as any;
      return response.resetPassword;
    },
  });
}

export function useVerifyUser() {
  return useMutation({
    mutationFn: async (input: { userId: string; verificationCode: string }) => {
      const response = (await graphQLRequest(print(VERIFY_USER_MUTATION), {
        verifyUserInput: input,
      })) as any;
      return response.verifyUser;
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async (input: { userId: string }) => {
      const response = (await graphQLRequest(
        print(RESEND_VERIFICATION_MUTATION),
        { resendVerificationInput: input }
      )) as any;
      return response.resendVerification;
    },
  });
}
