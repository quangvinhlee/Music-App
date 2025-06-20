import { useQuery, useQueryClient } from "@tanstack/react-query";
import { print } from "graphql";
import { graphQLRequest } from "app/utils/graphqlRequest";
import { GET_USER_QUERY, GET_COUNTRY_CODE_QUERY } from "app/mutations/auth";
import {
  LOGIN_MUTATION,
  SIGNUP_MUTATION,
  VERIFY_USER_MUTATION,
  RESEND_VERIFICATION_MUTATION,
  FORGOT_PASSWORD_MUTATION,
  RESET_PASSWORD_MUTATION,
} from "app/mutations/auth";
import { useMutation } from "@tanstack/react-query";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = (await graphQLRequest(print(GET_USER_QUERY), {})) as any;
      return response.getUser;
    },
  });
}

export function useGeoInfo() {
  return useQuery({
    queryKey: ["geoInfo"],
    queryFn: async () => {
      const response = (await graphQLRequest(
        print(GET_COUNTRY_CODE_QUERY),
        {}
      )) as any;
      if (!response?.getCountryCodeByIp)
        throw new Error("Failed to get country information");
      return {
        countryCode: response.getCountryCodeByIp.countryCode || "US",
        countryName: response.getCountryCodeByIp.countryName || "United States",
      };
    },
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
      // Save token to localStorage
      localStorage.setItem("token", data.token);
      // Invalidate the user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Invalidate the token on the client side
      localStorage.removeItem("token");
    },
    onSuccess: () => {
      // Immediately clear the user data from the cache
      queryClient.setQueryData(["user"], null);
      // Optional: Invalidate any other queries that depend on authentication
      queryClient.invalidateQueries();
    },
  });
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
