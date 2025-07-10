"use client";

import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { toast } from "sonner";
import { useGoogleLogin } from "app/query/useAuthQueries";
import { useRouter } from "next/navigation";

interface GoogleLoginButtonProps {
  variant?: "login" | "signup" | "forgot";
  className?: string;
}

export default function GoogleLoginButton({
  variant = "login",
  className = "",
}: GoogleLoginButtonProps) {
  const router = useRouter();
  const { mutate: googleLogin, isPending: isGoogleLoading } = useGoogleLogin();

  const getButtonText = () => {
    if (isGoogleLoading) {
      switch (variant) {
        case "signup":
          return "Signing up...";
        case "forgot":
          return "Logging in...";
        default:
          return "Logging in...";
      }
    }

    switch (variant) {
      case "signup":
        return "Sign Up With Google";
      case "forgot":
        return "Continue with Google";
      default:
        return "Login With Google";
    }
  };

  const getSuccessMessage = () => {
    switch (variant) {
      case "signup":
        return "Google signup successful";
      default:
        return "Google login successful";
    }
  };

  const getErrorMessage = () => {
    switch (variant) {
      case "signup":
        return "Google signup failed";
      default:
        return "Google login failed";
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Initialize Google OAuth
      const google = window.google;
      if (!google) {
        toast.error("Google OAuth not available");
        return;
      }

      google.accounts.oauth2
        .initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          scope: "email profile",
          callback: async (response: any) => {
            if (response.access_token) {
              googleLogin(
                { accessToken: response.access_token },
                {
                  onSuccess: (data) => {
                    toast.success(getSuccessMessage());
                    router.push("/");
                  },
                  onError: (error: any) => {
                    const message =
                      error.response?.data?.message ||
                      error.message ||
                      getErrorMessage();
                    toast.error(message);
                  },
                }
              );
            } else {
              toast.error("Failed to get access token from Google");
            }
          },
        })
        .requestAccessToken();
    } catch (error: any) {
      toast.error(`Failed to initialize Google ${variant}`);
    }
  };

  return (
    <Button
      className={`mt-2 w-full max-w-lg border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer ${className}`}
      variant="link"
      onClick={handleGoogleLogin}
      disabled={isGoogleLoading}
    >
      <FaGoogle /> {getButtonText()}
    </Button>
  );
}
