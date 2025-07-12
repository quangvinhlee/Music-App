"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Button } from "app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "app/components/ui/input-otp";
import { useCooldown } from "app/hooks/useCooldown";
import { useVerifyUser, useResendVerification } from "app/query/useAuthQueries";
import Link from "next/link";

function VerifyPageContent() {
  const [otp, setOtp] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false); // ✅ new state
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const router = useRouter();
  const { mutate: verifyUserMutation, isPending: isVerifying } =
    useVerifyUser();
  const { mutate: resendVerificationMutation } = useResendVerification();

  const { isResendDisabled, timeRemaining, resetCooldown } = useCooldown();

  const handleVerifyButton = (data: {
    userId: string;
    verificationCode: string;
  }) => {
    verifyUserMutation(data, {
      onSuccess: (response) => {
        toast.success(response.message);
        setVerificationSuccess(true);
      },
      onError: (error: any) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.";
        toast.error(message);
      },
    });
  };

  const handleResendButton = (userId: string) => {
    resendVerificationMutation(
      { userId },
      {
        onSuccess: (data) => {
          toast.success(
            data.message || "Verification code resent successfully."
          );
          resetCooldown();
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred.";
          toast.error(message);
        },
      }
    );
  };

  useEffect(() => {
    if (!userId) {
      router.push("/auth/signup");
    }
  }, [userId, router]);

  // ✅ If verified, show success screen
  if (verificationSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center max-w-md mx-auto p-8 bg-gradient-to-br from-gray-800 to-gray-700 shadow-2xl rounded-2xl border-2 border-green-200">
          {/* Success Icon */}
          <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Verification Successful!
          </h2>

          <p className="text-gray-300 mb-6 leading-relaxed">
            Your account has been successfully verified. You can now log in and
            start enjoying the music app.
          </p>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="inline-block w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Normal OTP input screen
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Card className="w-full max-w-lg p-8 shadow-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-700 text-white rounded-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-1">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent">
            Verify Your Account
          </CardTitle>
          <p className="text-gray-300 text-sm">
            Enter the 6-digit code sent to your email
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup className="gap-3">
                {[...Array(6)].map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="w-12 h-12 text-xl border-2 rounded-lg bg-gray-800 text-white border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={() =>
              handleVerifyButton({
                userId: userId as string,
                verificationCode: otp,
              })
            }
            disabled={otp.length !== 6}
          >
            {isVerifying ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying...
              </div>
            ) : (
              "Verify Account"
            )}
          </Button>

          <p className="text-center text-sm text-gray-400">
            Didn't receive the code?{" "}
            <button
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              onClick={() => handleResendButton(userId as string)}
              disabled={isResendDisabled}
            >
              {isResendDisabled
                ? `Resend in ${Math.ceil(timeRemaining / 1000)}s`
                : "Resend Code"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
