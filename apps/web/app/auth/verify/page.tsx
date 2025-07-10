"use client";

import { useEffect, useState, Suspense } from "react";
import { useMutation } from "@apollo/client";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { RESEND_VERIFICATION_MUTATION } from "app/mutations/auth";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useCooldown } from "app/hooks/useCooldown";
import { useVerifyUser, useResendVerification } from "app/query/useAuthQueries";
import Link from "next/link";
import { FaUserFriends } from "react-icons/fa";

function VerifyPageContent() {
  const [otp, setOtp] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false); // ✅ new state
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const router = useRouter();
  const { mutate: verifyUserMutation, isPending: isVerifying } =
    useVerifyUser();
  const { mutate: resendVerificationMutation, isPending: isResending } =
    useResendVerification();

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white shadow-2xl rounded-2xl border-2 border-green-200">
          {/* Success Icon */}
          <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
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

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Verification Successful!
          </h2>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Your account has been successfully verified. You can now log in and
            start enjoying the music app.
          </p>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
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
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-xl p-10 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">
            Verify Your Account
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Enter the 6-digit OTP sent to your email
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup className="gap-4">
                {[...Array(6)].map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="w-14 h-14 text-2xl border-2 rounded-md"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            className="w-full h-14 text-lg cursor-pointer"
            onClick={() =>
              handleVerifyButton({
                userId: userId as string,
                verificationCode: otp,
              })
            }
          >
            Verify
          </Button>

          <p className="text-center text-lg">
            Didn't receive the code?{" "}
            <button
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={() => handleResendButton(userId as string)}
              disabled={isResendDisabled}
            >
              {isResendDisabled
                ? `Resend in ${Math.ceil(timeRemaining / 1000)}s`
                : "Resend Verification Code"}
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
