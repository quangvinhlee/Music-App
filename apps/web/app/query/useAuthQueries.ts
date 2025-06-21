import { useQuery, useQueryClient } from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "app/utils/graphqlRequest";
import {
  GET_USER_QUERY,
  GET_COUNTRY_CODE_QUERY,
  LOGOUT_MUTATION,
} from "app/mutations/auth";
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

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        console.log("Fetching user data...");
        console.log("Current cookies:", document.cookie);

        // Check if we have a token before making the request
        const hasToken = document.cookie.includes("token=");
        if (!hasToken) {
          console.log("No token found, user is not authenticated");
          return null; // Return null for unauthenticated users
        }

        const response = (await graphQLRequest(
          print(GET_USER_QUERY),
          {}
        )) as any;
        console.log("User response:", response);
        return response.getUser;
      } catch (error: any) {
        console.error("Error fetching user:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        });

        // Handle expired token gracefully
        if (error.message.includes("Invalid or expired token")) {
          console.log("Token expired, clearing cookies...");
          // Clear any remaining cookies
          Cookies.remove("token", { path: "/" });
          return null; // Return null instead of redirecting
        }

        // For other errors, return null instead of throwing
        console.log("Other error occurred, returning null");
        return null;
      }
    },
    retry: false, // Don't retry for auth errors
    retryDelay: 1000,
    // Only refetch if we have a token
    enabled:
      typeof window !== "undefined" && document.cookie.includes("token="),
  });
}

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
    onSuccess: (data) => {
      // Invalidate the user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        // Call backend logout to clear server-side session
        await graphQLRequest(print(LOGOUT_MUTATION), {});
      } catch (error) {
        console.log("Backend logout failed, clearing frontend cookies anyway");
      }

      // Remove both token cookies (the correct one and the typo one)
      Cookies.remove("token", { path: "/" });
      Cookies.remove("tokenn", { path: "/" });
    },
    onSuccess: () => {
      // Immediately clear the user data from the cache
      queryClient.setQueryData(["user"], null);
      // Optional: Invalidate any other queries that depend on authentication
      queryClient.invalidateQueries();
    },
  });
}

// Hook for pages that require authentication
export function useRequireAuth() {
  const { data: user, isLoading, error } = useUser();
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
